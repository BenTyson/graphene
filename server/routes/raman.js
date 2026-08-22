import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { csvDateOnly, sendCsv } from '../utils/csv.js';

const router = express.Router();

// Configure multer for RAMAN report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'raman-reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all RAMAN records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { researchTeam: { contains: search, mode: 'insensitive' } },
        { testingLab: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    // Sort by date first (nulls last), then by creation time
    orderBy = [
      { testDate: { sort: order, nulls: 'last' } },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const ramanRecords = await prisma.ramanTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = ramanRecords.map(record => {
    const processed = { ...record };
    // Convert all Decimal fields to numbers
    const decimalFields = [
      'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
      'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
      'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
      'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
      'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
      'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
    ];
    
    decimalFields.forEach(field => {
      processed[field] = record[field] ? Number(record[field]) : null;
    });
    
    return processed;
  });
  
  res.json(processedRecords);
}));

// Get single RAMAN record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const ramanRecord = await prisma.ramanTest.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!ramanRecord) {
    res.status(404);
    throw new Error('RAMAN record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'integralTypB2D1', 'integralTypB2D2', 'integralTypBG1', 'integralTypBG2',
    'integralTypBD1', 'integralTypBD2', 'integralTypBDG1', 'integralTypBDG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.json(processedRecord);
}));

// Create new RAMAN record
router.post('/', upload.single('ramanReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Debug: log the incoming data
  console.log('Incoming RAMAN data:', Object.keys(req.body));
  console.log('Full data:', req.body);
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'integralTypB2D1', 'integralTypB2D2', 'integralTypBG1', 'integralTypBG2',
    'integralTypBD1', 'integralTypBD2', 'integralTypBDG1', 'integralTypBDG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
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
  
  // Handle date field
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Handle RAMAN report file upload
  if (req.file) {
    data.ramanReportPath = path.join('raman-reports', req.file.filename);
  }
  
  // Remove UI-only fields from data
  delete data.ramanReportFile;
  delete data.removeRamanReport;
  delete data.replaceRamanReport;
  delete data.grapheneRef;
  delete data.dateUnknown;
  delete data.materialType; // UI-only field for sample type selection
  
  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  console.log('Final data being sent to Prisma:', data);
  console.log('Data keys after cleanup:', Object.keys(data));
  
  const ramanRecord = await prisma.ramanTest.create({
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'integralTypB2D1', 'integralTypB2D2', 'integralTypBG1', 'integralTypBG2',
    'integralTypBD1', 'integralTypBD2', 'integralTypBDG1', 'integralTypBDG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.status(201).json(processedRecord);
}));

// Update RAMAN record
router.put('/:id', upload.single('ramanReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'integralTypB2D1', 'integralTypB2D2', 'integralTypBG1', 'integralTypBG2',
    'integralTypBD1', 'integralTypBD2', 'integralTypBDG1', 'integralTypBDG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
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
  
  // Handle date field
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Get existing record to handle file operations
  const existingRecord = await prisma.ramanTest.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('RAMAN record not found');
  }
  
  // Handle RAMAN report file operations
  if (data.removeRamanReport === 'true') {
    // Remove existing file
    if (existingRecord.ramanReportPath) {
      const filePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    data.ramanReportPath = null;
  } else if (req.file) {
    // Replace existing file
    if (existingRecord.ramanReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    data.ramanReportPath = path.join('raman-reports', req.file.filename);
  }
  
  // Remove UI-only fields and relational fields from data
  delete data.ramanReportFile;
  delete data.removeRamanReport;
  delete data.replaceRamanReport;
  delete data.grapheneRef;
  delete data.dateUnknown;
  delete data.materialType; // UI-only field for sample type selection
  
  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const ramanRecord = await prisma.ramanTest.update({
    where: { id },
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'integralTypB2D1', 'integralTypB2D2', 'integralTypBG1', 'integralTypBG2',
    'integralTypBD1', 'integralTypBD2', 'integralTypBDG1', 'integralTypBDG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.json(processedRecord);
}));

// Delete RAMAN record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to delete associated file
  const existingRecord = await prisma.ramanTest.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.ramanReportPath) {
    const filePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  await prisma.ramanTest.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

/**
 * Render one Integral / Peak-High measurement as the RAMAN table renders it.
 *
 * These are stored as two Decimal columns (`...1`, `...2`) and displayed joined by a
 * comma — `1,422`. They are NOT two measurements: they are the integer part and the
 * fractional digits of a single number in German decimal notation. Measured across all
 * 14 live records before deciding:
 *
 *   Integral Typ A D/G : 1,422  1,451  1,337  1,278  1,94   -> 1.422 1.451 1.337 1.278 1.94
 *   Integral Typ B D/G : 1,352                              -> 1.352
 *   Peak High Typ J D/G: 0,905                              -> 0.905
 *   Integral Typ A G   : 226,6  228,0  217,1  223,0  216,4  -> 226.6 ... 216.4
 *
 * A graphene D/G ratio of 1.2-1.5 is the textbook range; a pair of independent
 * measurements reading (1, 422) is not a quantity at all. The research team is
 * `Curia - Germany` and the modal's own placeholders are `1` and `451`
 * (client/src/js/components/modals/RAMANModal.js:210-215), i.e. 1,451.
 *
 * So this value is emitted as ONE quoted field, not as two sibling columns.
 *
 * That deviates from the house pattern the graphene export set (split a display
 * composite into siblings) and the deviation is the point: graphene's composites were
 * genuinely two quantities welded together for display, so splitting recovered data.
 * Here the two columns are halves of one number, and splitting would produce two
 * numeric-looking columns that mean nothing apart — a reader averaging `D/G 2` would
 * get 336, silently, from values whose real mean is 1.4. That is a worse failure than
 * the raggedness being fixed, because it looks right.
 *
 * Reconstructing the decimal (1.422) was rejected too: the storage is lossy. A
 * fractional part of `05` is stored as Decimal 5, so 9.05 and 9.5 are indistinguishable
 * in the database. Emitting a reconstructed number would invent precision that is not
 * recoverable. The comma form is exactly what the screen shows and is losslessly
 * splittable by whoever knows the convention.
 *
 * Quoting is what makes it safe: the previous code emitted this same string UNQUOTED,
 * which is the live corruption this chip exists to fix.
 *
 * Presence test is `!= null` rather than truthiness, matching the main table's Typ A /
 * Typ B cells (TestResultsRAMANTab.js:111-118). The expanded detail matrix uses
 * truthiness for Typ A and Peak High Typ J, which wrongly hides a legitimate leading
 * `0` — `0,24` renders as `-` there. The export shows the real value; see notes.
 *
 * @param {*} a integer part
 * @param {*} b fractional digits
 * @returns {string} e.g. '1,422', or '' when either half is absent
 */
function ramanPair(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) return '';
  return `${a},${b}`;
}

/**
 * Two-row grouped header, mirroring the RAMAN table's own grouped <thead>
 * (client/src/js/components/tabs/TestResultsRAMANTab.js:55-83), which carries
 * colspan=4 band cells over 2D / G / D / D-G sub-labels. A flat header here would not
 * match the screen; this tab genuinely is grouped, unlike most of the test tabs.
 *
 * Entries are [groupLabel, subLabel]; '' as a group label is the CSV equivalent of
 * colspan, and an ungrouped column carries its label on row 1 with an empty row 2.
 *
 * Two kinds of composite, handled differently on evidence rather than uniformly:
 *
 *  - Integration Range is genuinely two numbers, stored as `...Low` / `...High` and
 *    shown hyphen-joined (`2791-2557`). Split into sibling columns: both halves are
 *    independently meaningful, which is exactly the graphene case.
 *  - Integral Typ A / B and Peak High Typ J are ONE German-decimal number stored in
 *    two columns. Kept as one quoted field — see ramanPair() above for the measurement
 *    that settled it.
 *
 * `Integral Typ B` is new to the export: all four of its cells are rendered in the tab
 * (TestResultsRAMANTab.js:61) and reached the CSV nowhere.
 */
const RAMAN_CSV_COLUMNS = [
  ['Test Date', ''],
  // The table's sample cell is a display composite: a G/CB badge plus whichever of the
  // two identifiers is set (TestResultsRAMANTab.js:96). Split, so each is filterable.
  ['Sample', 'Graphene'],
  ['', 'Compound Batch'],
  ['Testing Lab', ''],
  ['Research Team', ''],
  ['Integration Range', '2D Low'],
  ['', '2D High'],
  ['', 'G Low'],
  ['', 'G High'],
  ['', 'D Low'],
  ['', 'D High'],
  ['', 'D/G Low'],
  ['', 'D/G High'],
  ['Integral Typ A', '2D'],
  ['', 'G'],
  ['', 'D'],
  ['', 'D/G'],
  ['Integral Typ B', '2D'],
  ['', 'G'],
  ['', 'D'],
  ['', 'D/G'],
  ['Peak High Typ J', '2D'],
  ['', 'G'],
  ['', 'D'],
  ['', 'D/G'],
  ['RAMAN Report', ''],
  ['Comments', ''],
  ['Record', 'Created'],
  ['', 'Updated']
];

// Export to CSV
// Accepts the same search/sort query params as GET / so the file contains exactly the
// rows the table is showing. With no params it exports every record.
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;

  // Same predicate as GET / above — keep the two in step.
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { researchTeam: { contains: search, mode: 'insensitive' } },
        { testingLab: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }

  let orderBy;
  if (sortBy === 'chronological') {
    orderBy = [
      { testDate: { sort: order, nulls: 'last' } },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const ramanRecords = await prisma.ramanTest.findMany({
    where,
    orderBy,
    include: { grapheneRef: true }
  });

  const rows = ramanRecords.map(r => [
    csvDateOnly(r.testDate),
    r.grapheneSample,
    r.compoundBatchNumber,
    r.testingLab,
    r.researchTeam,
    r.integrationRange2DLow,
    r.integrationRange2DHigh,
    r.integrationRangeGLow,
    r.integrationRangeGHigh,
    r.integrationRangeDLow,
    r.integrationRangeDHigh,
    r.integrationRangeDGLow,
    r.integrationRangeDGHigh,
    ramanPair(r.integralTypA2D1, r.integralTypA2D2),
    ramanPair(r.integralTypAG1, r.integralTypAG2),
    ramanPair(r.integralTypAD1, r.integralTypAD2),
    ramanPair(r.integralTypADG1, r.integralTypADG2),
    ramanPair(r.integralTypB2D1, r.integralTypB2D2),
    ramanPair(r.integralTypBG1, r.integralTypBG2),
    ramanPair(r.integralTypBD1, r.integralTypBD2),
    ramanPair(r.integralTypBDG1, r.integralTypBDG2),
    ramanPair(r.peakHighTypJ2D1, r.peakHighTypJ2D2),
    ramanPair(r.peakHighTypJG1, r.peakHighTypJG2),
    ramanPair(r.peakHighTypJD1, r.peakHighTypJD2),
    ramanPair(r.peakHighTypJDG1, r.peakHighTypJDG2),
    r.ramanReportPath ? 'Yes' : 'No',
    r.comments,
    r.createdAt,
    r.updatedAt
  ]);

  sendCsv(res, 'raman_export.csv', RAMAN_CSV_COLUMNS, rows);
}));

export default router;