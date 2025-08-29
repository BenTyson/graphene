import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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

router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const shipments = await prisma.materialShipment.findMany({
      where: search ? {
        OR: [
          { shipmentNumber: { contains: search, mode: 'insensitive' } },
          { shipFromLocation: { contains: search, mode: 'insensitive' } },
          { shipToLocation: { contains: search, mode: 'insensitive' } },
          { grapheneSample: { contains: search, mode: 'insensitive' } },
          { compoundBatchNumber: { contains: search, mode: 'insensitive' } },
          { micronizationSku: { contains: search, mode: 'insensitive' } },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/locations', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/graphene/:experimentNumber', async (req, res) => {
  try {
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

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching graphene shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/compound-batch/:batchNumber', async (req, res) => {
  try {
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

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching compound batch shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/micronization/:sku', async (req, res) => {
  try {
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

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching micronization shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
      'Created At'
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
      }
      
      return [
        shipment.shipmentNumber,
        shipment.shipFromLocation,
        shipment.shipToLocation,
        shipment.shipmentDate ? shipment.shipmentDate.toISOString().split('T')[0] : '',
        shipment.amountShipped || '',
        shipment.unit,
        materialType,
        materialReference,
        materialSpeciesName,
        shipment.purpose || '',
        shipment.status || '',
        shipment.receivedDate ? shipment.receivedDate.toISOString().split('T')[0] : '',
        shipment.comments || '',
        shipment.createdAt.toISOString().split('T')[0]
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="material_shipments.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting shipments CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
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
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    let data = { ...req.body };
    
    data = convertNumericFields(data);
    
    delete data.materialType;
    delete data.dateUnknown;
    delete data.receivedDateUnknown;
    
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
        }
      }
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Shipment number already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };
    
    data = convertNumericFields(data);
    
    delete data.materialType;
    delete data.dateUnknown;
    delete data.receivedDateUnknown;
    
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
        }
      }
    });

    res.json(shipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Shipment not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Shipment number already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.materialShipment.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Shipment not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;