import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';

const router = express.Router();

function convertNumericFields(data) {
  const numericFields = ['amountShipped'];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== '') {
      data[field] = parseFloat(data[field]);
    } else {
      data[field] = null;
    }
  });
  
  return data;
}

function generateShipmentNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-4);
  return `SHIP-${year}-${month}-${timestamp}`;
}

router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { search = '', limit, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  // Build query options with enhanced sorting
  let orderBy;
  if (sortBy === 'chronological') {
    orderBy = [
      { shipmentDate: { sort: order, nulls: 'last' } },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const queryOptions = {
    orderBy
  };
  
  // Add limit if specified
  if (limit) {
    queryOptions.take = parseInt(limit);
  }
  
  const shipments = await prisma.materialShipment.findMany({
      where: search ? {
        OR: [
          { shipmentNumber: { contains: search, mode: 'insensitive' } },
          { shipFromLocation: { contains: search, mode: 'insensitive' } },
          { shipToLocation: { contains: search, mode: 'insensitive' } },
          { grapheneSample: { contains: search, mode: 'insensitive' } },
          { compoundBatchNumber: { contains: search, mode: 'insensitive' } },
          { micronizationSku: { contains: search, mode: 'insensitive' } },
          { mcbNumber: { contains: search, mode: 'insensitive' } },
          { purpose: { contains: search, mode: 'insensitive' } },
          { status: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true,
            output: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true,
            totalOutput: true
          }
        },
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true,
            recoveredAmount: true
          }
        },
        mcbRef: {
          select: {
            mcbNumber: true,
            totalRecoveredAmount: true
          }
        }
      },
      ...queryOptions
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentsWithFixedDates = shipments.map(s => ({
      ...s,
      shipmentDate: s.shipmentDate ? s.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: s.receivedDate ? s.receivedDate.toISOString().split('T')[0] : null
    }));

    res.json(shipmentsWithFixedDates);
}));

router.get('/locations', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const fromLocations = await prisma.materialShipment.findMany({
      select: { shipFromLocation: true },
      distinct: ['shipFromLocation']
    });
    
    const toLocations = await prisma.materialShipment.findMany({
      select: { shipToLocation: true },
      distinct: ['shipToLocation']
    });
    
    const uniqueLocations = new Set([
      ...fromLocations.map(l => l.shipFromLocation),
      ...toLocations.map(l => l.shipToLocation)
    ]);
    
    const defaultLocations = [
      "Curia Frankfurt",
      "Curia Albany", 
      "Mork Technologies",
      "GEIC",
      "Maxwell"
    ];
    
    defaultLocations.forEach(loc => uniqueLocations.add(loc));
    
    res.json(Array.from(uniqueLocations).sort());
}));

router.get('/graphene/:experimentNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  const shipments = await prisma.materialShipment.findMany({
      where: { grapheneSample: experimentNumber },
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true,
            output: true
          }
        }
      },
      orderBy: { shipmentDate: 'desc' }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentsWithFixedDates = shipments.map(s => ({
      ...s,
      shipmentDate: s.shipmentDate ? s.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: s.receivedDate ? s.receivedDate.toISOString().split('T')[0] : null
    }));

    res.json(shipmentsWithFixedDates);
}));

router.get('/compound-batch/:batchNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { batchNumber } = req.params;
  
  const shipments = await prisma.materialShipment.findMany({
      where: { compoundBatchNumber: batchNumber },
      include: {
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true,
            totalOutput: true
          }
        }
      },
      orderBy: { shipmentDate: 'desc' }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentsWithFixedDates = shipments.map(s => ({
      ...s,
      shipmentDate: s.shipmentDate ? s.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: s.receivedDate ? s.receivedDate.toISOString().split('T')[0] : null
    }));

    res.json(shipmentsWithFixedDates);
}));

router.get('/micronization/:sku', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sku } = req.params;

  const shipments = await prisma.materialShipment.findMany({
      where: { micronizationSku: sku },
      include: {
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true,
            recoveredAmount: true
          }
        }
      },
      orderBy: { shipmentDate: 'desc' }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentsWithFixedDates = shipments.map(s => ({
      ...s,
      shipmentDate: s.shipmentDate ? s.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: s.receivedDate ? s.receivedDate.toISOString().split('T')[0] : null
    }));

    res.json(shipmentsWithFixedDates);
}));

// Get shipments for specific MCB
router.get('/mcb/:mcbNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { mcbNumber } = req.params;

  const shipments = await prisma.materialShipment.findMany({
      where: { mcbNumber },
      include: {
        mcbRef: {
          select: {
            mcbNumber: true,
            totalRecoveredAmount: true
          }
        }
      },
      orderBy: { shipmentDate: 'desc' }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentsWithFixedDates = shipments.map(s => ({
      ...s,
      shipmentDate: s.shipmentDate ? s.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: s.receivedDate ? s.receivedDate.toISOString().split('T')[0] : null
    }));

    res.json(shipmentsWithFixedDates);
}));

router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const shipments = await prisma.materialShipment.findMany({
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        },
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true
          }
        },
        mcbRef: {
          select: {
            mcbNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Single header row: the Shipments table's <thead> is flat — Shipment #, From, To,
    // Date, Amount, Material, Purpose, Status, Actions (ShipmentsTab.js). No colspan
    // band to mirror. The export is a superset: it splits the table's single Material
    // cell into Type / Reference / Species-Name, which is the graphene composite rule
    // and predates this chip.
    const csvHeaders = [
      'Shipment Number',
      'From Location',
      'To Location',
      'Shipment Date',
      'Amount Shipped',
      'Unit',
      'Material Type',
      'Material Reference',
      'Material Species/Name',
      'Purpose',
      'Status',
      'Received Date',
      'Comments',
      'Created At',
      'Updated At'
    ];

    const csvRows = shipments.map(shipment => {
      let materialType = '';
      let materialReference = '';
      let materialSpeciesName = '';

      if (shipment.grapheneSample) {
        materialType = 'Graphene';
        materialReference = shipment.grapheneSample;
        materialSpeciesName = shipment.grapheneRef?.species || '';
      } else if (shipment.compoundBatchNumber) {
        materialType = 'Compound Batch';
        materialReference = shipment.compoundBatchNumber;
        materialSpeciesName = shipment.compoundBatchRef?.batchName || '';
      } else if (shipment.micronizationSku) {
        materialType = 'Micronized';
        materialReference = shipment.micronizationSku;
        materialSpeciesName = shipment.micronizationRef?.micronizationNumber || '';
      } else if (shipment.mcbNumber) {
        materialType = 'MCB';
        materialReference = shipment.mcbNumber;
        materialSpeciesName = ''; // MCB no longer has a name field
      }

      return [
        shipment.shipmentNumber,
        shipment.shipFromLocation,
        shipment.shipToLocation,
        csvDateOnly(shipment.shipmentDate),
        shipment.amountShipped,
        shipment.unit,
        materialType,
        materialReference,
        materialSpeciesName,
        shipment.purpose,
        shipment.status,
        csvDateOnly(shipment.receivedDate),
        shipment.comments,
        csvDateOnly(shipment.createdAt),
        csvDateOnly(shipment.updatedAt)
      ];
    });

    // Previously this route wrapped every field in quotes but never doubled interior
    // quotes — `"${field}"` — so a single double-quote character anywhere in comments,
    // purpose or a location name terminated the field early and shifted the rest of the
    // row. The shared helper quotes only when needed and always doubles.
    sendCsv(res, 'material_shipments.csv', csvHeaders, csvRows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const shipment = await prisma.materialShipment.findUnique({
      where: { id },
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true,
            output: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true,
            totalOutput: true
          }
        },
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true,
            recoveredAmount: true
          }
        },
        mcbRef: {
          select: {
            mcbNumber: true,
            totalRecoveredAmount: true
          }
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentWithFixedDates = {
      ...shipment,
      shipmentDate: shipment.shipmentDate ? shipment.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: shipment.receivedDate ? shipment.receivedDate.toISOString().split('T')[0] : null
    };

    res.json(shipmentWithFixedDates);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  let data = { ...req.body };
    
    data = convertNumericFields(data);
    
    delete data.materialType;
    delete data.dateUnknown;
    delete data.receivedDateUnknown;
    
    // Handle material selection - only one should be set, others should be null
    if (!data.grapheneSample || data.grapheneSample === '') {
      data.grapheneSample = null;
    }
    if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
      data.compoundBatchNumber = null;
    }
    if (!data.micronizationSku || data.micronizationSku === '') {
      data.micronizationSku = null;
    }
    if (!data.mcbNumber || data.mcbNumber === '') {
      data.mcbNumber = null;
    }
    
    if (!data.shipmentNumber) {
      data.shipmentNumber = generateShipmentNumber();
    }
    
    if (data.shipmentDate === null || data.shipmentDate === '') {
      data.shipmentDate = null;
    }
    
    if (data.receivedDate === null || data.receivedDate === '') {
      data.receivedDate = null;
    }

    const shipment = await prisma.materialShipment.create({
      data,
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true,
            output: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true,
            totalOutput: true
          }
        },
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true,
            recoveredAmount: true
          }
        },
        mcbRef: {
          select: {
            mcbNumber: true,
            totalRecoveredAmount: true
          }
        }
      }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentWithFixedDates = {
      ...shipment,
      shipmentDate: shipment.shipmentDate ? shipment.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: shipment.receivedDate ? shipment.receivedDate.toISOString().split('T')[0] : null
    };

    res.status(201).json(shipmentWithFixedDates);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  let data = { ...req.body };
    
    data = convertNumericFields(data);
    
    delete data.materialType;
    delete data.dateUnknown;
    delete data.receivedDateUnknown;
    
    // Handle material selection - only one should be set, others should be null
    if (!data.grapheneSample || data.grapheneSample === '') {
      data.grapheneSample = null;
    }
    if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
      data.compoundBatchNumber = null;
    }
    if (!data.micronizationSku || data.micronizationSku === '') {
      data.micronizationSku = null;
    }
    if (!data.mcbNumber || data.mcbNumber === '') {
      data.mcbNumber = null;
    }
    
    if (data.shipmentDate === null || data.shipmentDate === '') {
      data.shipmentDate = null;
    }
    
    if (data.receivedDate === null || data.receivedDate === '') {
      data.receivedDate = null;
    }

    const shipment = await prisma.materialShipment.update({
      where: { id },
      data,
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true,
            output: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true,
            totalOutput: true
          }
        },
        micronizationRef: {
          select: {
            micronizationNumber: true,
            sku: true,
            recoveredAmount: true
          }
        },
        mcbRef: {
          select: {
            mcbNumber: true,
            totalRecoveredAmount: true
          }
        }
      }
    });

    // Convert dates to date-only strings to avoid timezone issues
    const shipmentWithFixedDates = {
      ...shipment,
      shipmentDate: shipment.shipmentDate ? shipment.shipmentDate.toISOString().split('T')[0] : null,
      receivedDate: shipment.receivedDate ? shipment.receivedDate.toISOString().split('T')[0] : null
    };

    res.json(shipmentWithFixedDates);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  await prisma.materialShipment.delete({
    where: { id }
  });

  res.json({ success: true });
}));

export default router;