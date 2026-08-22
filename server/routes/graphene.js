import express from 'express';
import asyncHandler from 'express-async-handler';
import { buildQueryOptions, buildResponseMeta, formatResponse } from '../utils/queryHelpers.js';
import { buildFilterWhere, buildFilterAwareOrderBy, getFilterOptions } from '../utils/filterQueryBuilder.js';
import { getFilterConfig } from '../utils/filterConfig.js';
import { createFileUploadMiddleware, uploadFile, deleteFileFromStorage } from '../utils/fileUpload.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

/**
 * Build the Prisma `where` clause for a graphene list request.
 *
 * Shared by GET / and GET /export/csv so a CSV export always contains exactly
 * the rows the user is looking at. Conditions are composed with AND rather than
 * assigned onto a single object, so a species filter can't clobber the OR
 * clause produced by a search term.
 *
 * @param {import('express').Request} req
 * @returns {object} Prisma where clause
 */
function buildGrapheneWhere(req) {
  const { filters, search } = buildQueryOptions(req, 'graphene');
  const conditions = [];

  const filterWhere = buildFilterWhere('graphene', filters, search);
  if (Object.keys(filterWhere).length > 0) {
    conditions.push(filterWhere);
  }

  // Species filter
  const speciesFilter = req.query.species;
  if (speciesFilter === 'species1') {
    // Species 1: Only KOH (no NaOH in base2Type)
    conditions.push({ OR: [{ base2Type: null }, { base2Type: { not: 'NaOH' } }] });
  } else if (speciesFilter === 'species2') {
    // Species 2: Has both KOH and NaOH (base2Type is NaOH)
    conditions.push({ base2Type: 'NaOH' });
  }
  // 'all' or undefined = no additional filtering

  // Tested filters (AND logic - must have all selected test types)
  const testedFilters = req.query['tested[]'] || req.query.tested;
  if (testedFilters) {
    const selected = Array.isArray(testedFilters) ? testedFilters : [testedFilters];
    selected.forEach(testType => {
      if (testType === 'bet') {
        conditions.push({ betTests: { some: {} } });
      } else if (testType === 'conductivity') {
        conditions.push({ conductivityTests: { some: {} } });
      } else if (testType === 'raman') {
        conditions.push({ ramanTests: { some: {} } });
      }
    });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

// Columns the graphene table can be sorted by, mapped to whether the column is
// nullable. Nullable columns sort nulls last so the CSV order matches the
// client-side sort in applySortingToGraphene(); Prisma rejects `nulls` on
// non-nullable columns, so they must be listed as false.
const GRAPHENE_SORT_FIELDS = {
  createdAt: false,
  experimentNumber: false,
  experimentDate: true,
  testOrder: true,
  oven: true,
  quantity: true,
  biocharExperiment: true,
  grindingCount: true,
  tempRate: true,
  tempMax: true,
  time: true,
  volumeMl: true,
  output: true,
  species: true
};

/**
 * Build the orderBy for the CSV export from the table's current sort.
 * Unknown columns fall back to the default (newest first) rather than throwing.
 *
 * @param {{ sortBy: string, order: 'asc'|'desc' }} sort
 * @returns {object|object[]} Prisma orderBy clause
 */
function buildGrapheneExportOrderBy(sort) {
  const field = sort.sortBy === 'chronological' ? 'experimentDate' : sort.sortBy;

  if (!(field in GRAPHENE_SORT_FIELDS)) {
    return { createdAt: 'desc' };
  }

  const primary = GRAPHENE_SORT_FIELDS[field]
    ? { [field]: { sort: sort.order, nulls: 'last' } }
    : { [field]: sort.order };

  return field === 'createdAt' ? primary : [primary, { createdAt: 'desc' }];
}


/**
 * Quote one CSV field per RFC 4180.
 *
 * Every value in the export goes through here. The previous implementation quoted
 * roughly half its fields by hand, so any unquoted value containing a comma silently
 * shifted every later column in that row. The export now carries five free-text
 * narrative fields, which is exactly where embedded newlines live, so escaping is no
 * longer optional anywhere.
 *
 * Quotes only when the value needs it (comma, double quote, CR, LF, or leading/
 * trailing whitespace) rather than always, so numeric columns stay unquoted and the
 * file reads and diffs cleanly. That predicate is the complete RFC 4180 set.
 *
 * Handles the four shapes this route produces uniformly:
 *   null / undefined -> empty
 *   Date             -> ISO 8601
 *   Prisma Decimal   -> its decimal literal (String() calls toString(), not valueOf())
 *   string[]         -> comma-joined inside one quoted field
 *
 * @param {*} value
 * @returns {string} the field, escaped and quoted if required
 */
function csvField(value) {
  if (value === null || value === undefined) return '';

  let s;
  if (value instanceof Date) {
    s = value.toISOString();
  } else if (Array.isArray(value)) {
    s = value.join(', ');
  } else {
    s = String(value);
  }

  if (s === '') return '';
  if (/[",\r\n]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Join one record's fields into a CSV line.
 * @param {Array<*>} fields
 * @returns {string}
 */
function csvRow(fields) {
  return fields.map(csvField).join(',');
}

/**
 * The CSV export mirrors the two-row grouped header of the desktop Graphene table
 * (client/src/js/components/tabs/GrapheneTab.js) so the file reads like the screen:
 * row 1 is the group band, row 2 the sub-labels, row 3 onward the data.
 *
 * Entries are [groupLabel, subLabel]. A `rowspan=2` column in the table carries its
 * label on row 1 and an empty row 2, matching how the table shows it once across both
 * rows. A grouped column repeats '' as its group label on every cell after the first,
 * which is the CSV equivalent of `colspan`.
 *
 * Three cells in the table are display composites — one visual column holding two
 * values, the second rendered in grey (`24g + 6g`, `KOH + NaOH`, `EXP` / `LOT: n`,
 * experiment number + title note). Each becomes sibling sub-columns here rather than a
 * concatenated display string: the whole point of the change was to make the secondary
 * base filterable and pivotable, which a string like "24g + 6g" is not.
 *
 * The table's `Actions` column is omitted — it is buttons, not data.
 *
 * Consequence, accepted deliberately: with two header rows, row 1 is not the header
 * row, so `pandas.read_csv()` defaults and other naive parsers misread the file. That
 * is a trade of machine-readability for human readability, and it is intentional.
 */
const GRAPHENE_CSV_COLUMNS = [
  ['Order', ''],
  ['Exp #', 'Exp'],
  ['', 'Note'],
  ['Date', ''],
  ['Oven', ''],
  ['Qty (g)', ''],
  ['Biochar', 'Exp'],
  ['', 'Lot'],
  ['Base', 'Amt'],
  ['', 'Amt 2'],
  ['', 'Type'],
  ['', 'Type 2'],
  ['', 'NaOH%'],
  ['', 'Conc%'],
  ['', 'Conc% 2'],
  ['Grinding', 'Method'],
  ['', '# Grinds'],
  ['', 'Time'],
  ['', 'Freq'],
  ['Homog.', ''],
  ['Gas', ''],
  ['Temperature', 'Rate'],
  ['', 'Max'],
  ['', 'Time'],
  ['Wash', 'Amt'],
  ['', 'Sol.'],
  ['', 'Conc%'],
  ['', 'Water'],
  ['Drying', 'Temp'],
  ['', 'Atm.'],
  ['', 'Press.'],
  ['Results', 'Vol(ml)'],
  ['', 'Dens.'],
  ['', 'Out(g)'],
  ['', 'Out%'],
  ['Species', ''],
  ['Appearance', ''],
  ['Record', 'Team'],
  ['', 'SEM'],
  ['', 'Created'],
  ['', 'Updated'],
  ['Notes', 'Comments'],
  ['', 'Objective'],
  ['', 'Details'],
  ['', 'Result'],
  ['', 'Conclusion'],
  ['', 'Rec. Action']
];

/**
 * NaOH share of the total base charge, as the Graphene table computes it.
 *
 * Reproduces client/src/js/components/tabs/GrapheneTab.js exactly, including the two
 * edge cases that are easy to lose: a zero total base returns '0%', and NaOH as the
 * *primary* base with no secondary returns '100%' rather than a computed figure. A
 * derived column that disagrees with the screen is worse than no column, because a
 * reader reconciling the two has no way to tell which is wrong.
 *
 * `parseFloat` on a Prisma Decimal stringifies it first, giving the same number the
 * browser gets from the JSON-serialised string.
 *
 * @param {object} g graphene record
 * @returns {string} e.g. '20.0%'
 */
function grapheneNaohPercent(g) {
  const baseAmt = parseFloat(g.baseAmount) || 0;
  const base2Amt = parseFloat(g.base2Amount) || 0;
  const totalBase = baseAmt + base2Amt;
  if (totalBase === 0) return '0%';
  if (g.base2Type === 'NaOH') {
    return ((base2Amt / totalBase) * 100).toFixed(1) + '%';
  } else if (g.baseType === 'NaOH') {
    return base2Amt > 0 ? ((baseAmt / totalBase) * 100).toFixed(1) + '%' : '100%';
  }
  return '0%';
}

/**
 * Yield as a percentage of input, as the Graphene table computes it.
 * Reproduces calculateOutputPercentage in client/src/js/utils/formatters.js.
 *
 * @param {object} g graphene record
 * @returns {string} e.g. '12.5%', or '' when either side is missing
 */
function grapheneOutputPercent(g) {
  if (g.quantity && g.output && g.quantity > 0) {
    return ((g.output / g.quantity) * 100).toFixed(1) + '%';
  }
  return '';
}

/**
 * Date-only rendering for the CSV.
 *
 * The table shows `Unknown` for a missing or epoch date (formatDateSafe in
 * app-refactored.js). The CSV emits an empty cell instead: a literal 'Unknown' in a
 * date column is unsortable and unfilterable, and an empty cell is exactly what a
 * spreadsheet reads as "no date".
 *
 * @param {Date|null|undefined} d
 * @returns {string} YYYY-MM-DD, or ''
 */
function csvDateOnly(d) {
  if (!d) return '';
  const t = d.getTime();
  if (Number.isNaN(t)) return '';
  return d.toISOString().slice(0, 10);
}

// Configure file upload middleware for SEM reports
const upload = createFileUploadMiddleware('sem-reports', {
  allowedTypes: ['application/pdf'],
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.pdf'],
  validateContent: true
});

// Get all graphene records with advanced filtering
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const tableName = 'graphene';
  
  try {
    // Parse request parameters using the new query helpers
    const queryOptions = buildQueryOptions(req, tableName);
    const { filters, pagination, sort } = queryOptions;

    // Build enhanced where clause using the shared filter builder
    const where = buildGrapheneWhere(req);

    // Build enhanced order by clause
    const sortMappings = {
      chronological: 'experimentDate'
    };
    const orderBy = buildFilterAwareOrderBy(sort.sortBy, sort.order, sortMappings);
    
    // Get total count before filtering for metadata
    const totalCount = await prisma.graphene.count();
    
    // Get filtered count
    const filteredCount = await prisma.graphene.count({ where });
    
    // Build pagination options
    const paginationOptions = pagination.page ? {
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit
    } : {};
    
    // Execute main query with filtering
    const graphenes = await prisma.graphene.findMany({
      where,
      orderBy,
      ...paginationOptions,
      include: { 
        biocharLotRef: true,
        updateReports: {
          include: {
            updateReport: true
          }
        },
        semReports: {
          include: {
            semReport: true
          }
        }
      }
    });
    
    // Convert dates to date-only strings to avoid timezone issues
    const graphenesWithFixedDates = graphenes.map(g => ({
      ...g,
      experimentDate: g.experimentDate ? g.experimentDate.toISOString().split('T')[0] : null
    }));
    
    // Build response metadata
    const meta = buildResponseMeta(totalCount, filteredCount, pagination, filters);
    
    // Return formatted response with metadata
    res.json(formatResponse(graphenesWithFixedDates, meta));
    
  } catch (error) {
    console.error('Error in graphene filtering:', error);
    res.status(500).json({ error: 'Failed to retrieve graphene records', details: error.message });
  }
}));

// Get single graphene record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const graphene = await prisma.graphene.findUnique({
    where: { id },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // Convert date to date-only string to avoid timezone issues
  const grapheneWithFixedDate = {
    ...graphene,
    experimentDate: graphene.experimentDate ? graphene.experimentDate.toISOString().split('T')[0] : null
  };
  
  res.json(grapheneWithFixedDate);
}));

// Get graphene records by biochar experiment
router.get('/by-biochar/:biocharExperiment', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { biocharExperiment } = req.params;
  
  const graphenes = await prisma.graphene.findMany({
    where: { biocharExperiment },
    orderBy: { createdAt: 'desc' },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  // Convert dates to date-only strings to avoid timezone issues
  const graphenesWithFixedDates = graphenes.map(g => ({
    ...g,
    experimentDate: g.experimentDate ? g.experimentDate.toISOString().split('T')[0] : null
  }));
  
  res.json(graphenesWithFixedDates);
}));

// Get related data for a graphene experiment - MUST BE BEFORE /:id route
router.get('/:experimentNumber/related', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  // Get the graphene record to find its biochar reference
  const graphene = await prisma.graphene.findUnique({
    where: { experimentNumber },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // Get source biochar data
  let sourceBiochar = null;
  let lotBiocharExperiments = [];
  
  if (graphene.biocharExperiment) {
    // Direct biochar reference
    sourceBiochar = await prisma.biochar.findUnique({
      where: { experimentNumber: graphene.biocharExperiment }
    });
  } else if (graphene.biocharLotNumber) {
    // Lot reference - get all biochar experiments in the lot
    lotBiocharExperiments = await prisma.biochar.findMany({
      where: { lotNumber: graphene.biocharLotNumber },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Get BET tests for this graphene
  const betTests = await prisma.bET.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get RAMAN tests for this graphene
  const ramanTests = await prisma.ramanTest.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get conductivity tests for this graphene
  const conductivityTests = await prisma.conductivityTest.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get shipments for this graphene
  const shipments = await prisma.materialShipment.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get compound batches that include this graphene experiment
  const compoundBatches = await prisma.grapheneCompoundBatch.findMany({
    where: { grapheneId: graphene.id },
    include: {
      compoundBatch: {
        include: {
          experiments: {
            include: {
              graphene: {
                select: {
                  experimentNumber: true,
                  output: true
                }
              }
            }
          },
          betTests: true,
          conductivityTests: true,
          ramanTests: true,
          temTests: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Process decimal fields for frontend display
  const processedBetTests = betTests.map(record => ({
    ...record,
    mass: record.mass ? Number(record.mass) : null,
    multipointBetArea: record.multipointBetArea ? Number(record.multipointBetArea) : null,
    langmuirSurfaceArea: record.langmuirSurfaceArea ? Number(record.langmuirSurfaceArea) : null
  }));

  const processedConductivityTests = conductivityTests.map(record => ({
    ...record,
    conductivity1kN: record.conductivity1kN ? Number(record.conductivity1kN) : null,
    conductivity8kN: record.conductivity8kN ? Number(record.conductivity8kN) : null,
    conductivity12kN: record.conductivity12kN ? Number(record.conductivity12kN) : null,
    conductivity20kN: record.conductivity20kN ? Number(record.conductivity20kN) : null
  }));

  // Process compound batches to convert decimal fields
  const processedCompoundBatches = compoundBatches.map(cb => ({
    ...cb,
    compoundBatch: {
      ...cb.compoundBatch,
      totalOutput: cb.compoundBatch.totalOutput ? Number(cb.compoundBatch.totalOutput) : null,
      createdDate: cb.compoundBatch.createdDate ? cb.compoundBatch.createdDate.toISOString().split('T')[0] : null
    }
  }));

  // Process SEM reports to flatten the nested structure
  const processedSemReports = graphene.semReports?.map(sr => ({
    ...sr.semReport,
    reportDate: sr.semReport.reportDate ? sr.semReport.reportDate.toISOString().split('T')[0] : null
  })) || [];

  // Process update reports to flatten the nested structure
  const processedUpdateReports = graphene.updateReports?.map(ur => ({
    ...ur.updateReport,
    weekDate: ur.updateReport.weekDate ? ur.updateReport.weekDate.toISOString().split('T')[0] : null,
    uploadDate: ur.updateReport.createdAt ? ur.updateReport.createdAt.toISOString().split('T')[0] : null
  })) || [];
  
  res.json({
    sourceBiochar,
    lotBiocharExperiments,
    betTests: processedBetTests,
    ramanTests,
    conductivityTests: processedConductivityTests,
    compoundBatches: processedCompoundBatches,
    shipments,
    semReports: processedSemReports,
    updateReports: processedUpdateReports,
    lotInfo: graphene.biocharLotRef
  });
}));

// Create new graphene record with optional SEM file
router.post('/', upload.single('semReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Prepare data (no longer setting semReportPath as we use SEM report associations)
  const data = { ...req.body };
  
  // Remove UI-only fields that don't exist in database schema
  delete data.biocharSource;
  delete data.dateUnknown;
  delete data.semReportFile;
  delete data.objectivePaste;
  delete data.removeSemReport;
  delete data.replaceSemReport;
  delete data.density; // Density is calculated, not stored
  delete data.semReports; // Relational field, not stored directly
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['testOrder', 'quantity', 'baseAmount', 'baseConcentration', 
                        'base2Amount', 'base2Concentration', 'grindingCount', 'grindingTime', 'grindingFrequency',
                        'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp', 
                        'volumeMl', 'output'];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseFloat(data[field]);
      if (!isNaN(num)) {
        data[field] = num;
      }
    } else {
      data[field] = null;
    }
  });
  
  // Handle boolean field
  if (data.homogeneous !== undefined && data.homogeneous !== null && data.homogeneous !== '') {
    data.homogeneous = data.homogeneous === 'true' || data.homogeneous === true;
  } else {
    data.homogeneous = null;
  }
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.experimentDate && data.experimentDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.experimentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.experimentDate.split('-');
      data.experimentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.experimentDate = new Date(data.experimentDate);
    }
  } else {
    data.experimentDate = null;
  }
  
  // Handle reference fields - convert empty strings to null
  const referenceFields = ['biocharExperiment', 'biocharLotNumber'];
  referenceFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });
  
  // Extract update report IDs and remove from main data
  let updateReportIds = [];
  if (data.updateReportIds) {
    try {
      updateReportIds = JSON.parse(data.updateReportIds);
    } catch (e) {
      updateReportIds = Array.isArray(data.updateReportIds) ? data.updateReportIds : [];
    }
    delete data.updateReportIds;
  }
  
  const graphene = await prisma.graphene.create({
    data
  });
  
  // Create SEM report entry if file was uploaded directly
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'sem-reports');
    
    if (uploadResult.success) {
      const semReportData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: uploadResult.path, // Will be Cloudinary URL or local path
        reportDate: data.experimentDate || new Date()
      };
      
      console.log('📁 SEM Report Upload Success:', {
        filename: semReportData.filename,
        originalName: semReportData.originalName,
        filePath: semReportData.filePath,
        isCloudinary: uploadResult.isCloudinary
      });
      
      const semReport = await prisma.semReport.create({
        data: semReportData
      });
      
      // Create association between graphene and SEM report
      await prisma.grapheneSemReport.create({
        data: {
          grapheneId: graphene.id,
          semReportId: semReport.id
        }
      });
    } else {
      console.error('Failed to upload SEM report:', uploadResult.error);
    }
  }
  
  // Create update report associations if provided
  if (updateReportIds.length > 0) {
    const updateReportAssociations = updateReportIds.map(reportId => ({
      grapheneId: graphene.id,
      updateReportId: reportId
    }));
    
    await prisma.grapheneUpdateReport.createMany({
      data: updateReportAssociations,
      skipDuplicates: true
    });
  }
  
  // Trigger AI insights cache invalidation for new graphene data
  AIInsightsService.onNewData('graphene');
  
  res.status(201).json(graphene);
}));

// Update graphene record with optional SEM file
router.put('/:id', upload.single('semReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to handle file replacement
  const existingRecord = await prisma.graphene.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // If new file was uploaded, add the path to the data and delete old file
  const data = { ...req.body };
  
  // Note: SEM report removal is now handled through the SEM Reports system
  // The removeSemReport flag is processed but no file operations needed here
  
  // Remove UI-only fields that don't exist in database schema
  delete data.biocharSource;
  delete data.dateUnknown;
  delete data.semReportFile;
  delete data.removeSemReport;
  delete data.replaceSemReport;
  delete data.objectivePaste;
  delete data.density; // Density is calculated, not stored
  delete data.semReports; // Relational field, not stored directly
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['testOrder', 'quantity', 'baseAmount', 'baseConcentration', 
                        'base2Amount', 'base2Concentration', 'grindingCount', 'grindingTime', 'grindingFrequency',
                        'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp', 
                        'volumeMl', 'output'];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseFloat(data[field]);
      if (!isNaN(num)) {
        data[field] = num;
      }
    } else {
      data[field] = null;
    }
  });
  
  // Handle boolean field
  if (data.homogeneous !== undefined && data.homogeneous !== null && data.homogeneous !== '') {
    data.homogeneous = data.homogeneous === 'true' || data.homogeneous === true;
  } else {
    data.homogeneous = null;
  }
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.experimentDate && data.experimentDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.experimentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.experimentDate.split('-');
      data.experimentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.experimentDate = new Date(data.experimentDate);
    }
  } else {
    data.experimentDate = null;
  }
  
  // Handle reference fields - convert empty strings to null
  const referenceFields = ['biocharExperiment', 'biocharLotNumber'];
  referenceFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });
  
  // Extract update report IDs and remove from main data
  let updateReportIds = [];
  let hasUpdateReportIds = false;
  if (data.updateReportIds !== undefined) {
    hasUpdateReportIds = true;
    try {
      updateReportIds = JSON.parse(data.updateReportIds);
    } catch (e) {
      updateReportIds = Array.isArray(data.updateReportIds) ? data.updateReportIds : [];
    }
    delete data.updateReportIds;
  }
  
  const graphene = await prisma.graphene.update({
    where: { id },
    data
  });
  
  // Handle SEM report creation for direct uploads
  if (req.file && !data.removeSemReport) {
    const uploadResult = await uploadFile(req.file, 'sem-reports');
    
    if (uploadResult.success) {
      const semReportData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: uploadResult.path, // Will be Cloudinary URL or local path
        reportDate: data.experimentDate || new Date()
      };
      
      const semReport = await prisma.semReport.create({
        data: semReportData
      });
      
      // Create association between graphene and SEM report
      await prisma.grapheneSemReport.create({
        data: {
          grapheneId: id,
          semReportId: semReport.id
        }
      });
    } else {
      console.error('Failed to upload SEM report:', uploadResult.error);
    }
  }
  
  // Update report associations if provided
  if (hasUpdateReportIds) {
    // Remove existing associations
    await prisma.grapheneUpdateReport.deleteMany({
      where: { grapheneId: id }
    });
    
    // Create new associations
    if (updateReportIds.length > 0) {
      const updateReportAssociations = updateReportIds.map(reportId => ({
        grapheneId: id,
        updateReportId: reportId
      }));
      
      await prisma.grapheneUpdateReport.createMany({
        data: updateReportAssociations,
        skipDuplicates: true
      });
    }
  }
  
  // Trigger AI insights cache invalidation for updated graphene data
  AIInsightsService.onNewData('graphene');
  
  res.json(graphene);
}));

// Delete graphene record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get record to delete associated file
  const existingRecord = await prisma.graphene.findUnique({
    where: { id }
  });
  
  // Note: File deletion is now handled through SEM Reports system
  // Associated files are cleaned up through the semReports associations
  
  await prisma.graphene.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
// Accepts the same search/species/tested/sort query params as GET / so the file
// contains exactly the rows currently shown in the table. With no params it
// exports every record.
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const where = buildGrapheneWhere(req);
  const { sort } = buildQueryOptions(req, 'graphene');

  // Mirror the table's current sort
  const orderBy = buildGrapheneExportOrderBy(sort);

  const graphenes = await prisma.graphene.findMany({
    where,
    orderBy,
    include: {
      biocharLotRef: true,
      // Presence only — a record can carry a SEM report either on the legacy
      // semReportPath column or through this join table, and reporting 'No' for the
      // latter would be wrong.
      semReports: { select: { id: true } }
    }
  });

  // Record separator is CRLF per RFC 4180. With five free-text narrative fields now in
  // the export, a bare LF inside a quoted value is likely; using CRLF between records
  // keeps the two unambiguous even for a parser that handles quoting sloppily.
  const EOL = '\r\n';

  let csv = csvRow(GRAPHENE_CSV_COLUMNS.map(c => c[0])) + EOL;
  csv += csvRow(GRAPHENE_CSV_COLUMNS.map(c => c[1])) + EOL;

  graphenes.forEach(g => {
    const row = [
      g.testOrder,
      g.experimentNumber,
      g.titleNote,
      csvDateOnly(g.experimentDate),
      g.oven,
      g.quantity,
      g.biocharExperiment,
      g.biocharLotNumber,
      g.baseAmount,
      g.base2Amount,
      g.baseType,
      g.base2Type,
      grapheneNaohPercent(g),
      g.baseConcentration,
      g.base2Concentration,
      g.grindingMethod,
      g.grindingCount,
      g.grindingTime,
      g.grindingFrequency,
      g.homogeneous !== null && g.homogeneous !== undefined ? (g.homogeneous ? 'Yes' : 'No') : '',
      g.gas,
      g.tempRate,
      g.tempMax,
      g.time,
      g.washAmount,
      g.washSolution,
      g.washConcentration,
      g.washWater,
      g.dryingTemp,
      g.dryingAtmosphere,
      g.dryingPressure,
      g.volumeMl,
      // Density is derived here rather than read from the model's stored `density`
      // column: the write path deletes that column ("Density is calculated, not
      // stored"). Deliberate — do not "fix" it to read the column.
      (g.volumeMl && g.output) ? (g.volumeMl / g.output).toFixed(4) : '',
      g.output,
      grapheneOutputPercent(g),
      g.species,
      g.appearanceTags,
      g.researchTeam,
      (g.semReportPath || (g.semReports && g.semReports.length > 0)) ? 'Yes' : 'No',
      g.createdAt,
      g.updatedAt,
      g.comments,
      g.objective,
      g.experimentDetails,
      g.result,
      g.conclusion,
      g.recommendedAction
    ];
    csv += csvRow(row) + EOL;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="graphene_export.csv"');
  res.send(csv);
}));

// Get filter configuration for graphene table
router.get('/filters/config', asyncHandler(async (req, res) => {
  try {
    const config = getFilterConfig('graphene');
    if (!config) {
      return res.status(404).json({ error: 'Filter configuration not found for graphene table' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error getting filter config:', error);
    res.status(500).json({ error: 'Failed to get filter configuration', details: error.message });
  }
}));

// Get filter options for specific field
router.get('/filters/:filterField/options', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { filterField } = req.params;
  
  try {
    const options = await getFilterOptions(prisma, 'graphene', filterField);
    res.json(options);
  } catch (error) {
    console.error(`Error getting filter options for ${filterField}:`, error);
    res.status(500).json({ error: `Failed to get options for ${filterField}`, details: error.message });
  }
}));

export default router;