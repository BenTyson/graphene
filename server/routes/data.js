/**
 * Data Page API Routes
 * 
 * Provides unified endpoints for data pages across all data types
 * Returns comprehensive data objects with all related information
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();

const prisma = new PrismaClient();

/**
 * Get data for a specific experiment/batch/record by type and identifier
 * GET /api/data/:type/:identifier
 */
router.get('/:type/:identifier', async (req, res) => {
  try {
    const { type, identifier } = req.params;
    
    console.log(`📄 Data page request: ${type}/${identifier}`);
    
    let data = null;
    
    switch (type) {
      case 'graphene':
        data = await getGrapheneData(identifier);
        break;
      case 'biochar':
        data = await getBiocharData(identifier);
        break;
      case 'compound-batch':
        data = await getCompoundBatchData(identifier);
        break;
      case 'micronization':
        data = await getMicronizationData(identifier);
        break;
      case 'shipment':
        data = await getShipmentData(identifier);
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid data type',
          supportedTypes: ['graphene', 'biochar', 'compound-batch', 'micronization', 'shipment']
        });
    }
    
    if (!data) {
      return res.status(404).json({ 
        error: 'Data not found',
        type: type,
        identifier: identifier
      });
    }
    
    console.log(`✅ Data page response for ${type}/${identifier}:`, Object.keys(data));
    res.json(data);
    
  } catch (error) {
    console.error('❌ Data page error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message 
    });
  }
});

/**
 * Get comprehensive graphene experiment data
 */
async function getGrapheneData(experimentNumber) {
  const experiment = await prisma.graphene.findUnique({
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
  
  if (!experiment) return null;
  
  // Add derived fields
  experiment.status = getExperimentStatus(experiment);
  experiment.testCount = getTestCount(experiment);
  
  return experiment;
}

/**
 * Get comprehensive biochar experiment data
 */
async function getBiocharData(experimentNumber) {
  const experiment = await prisma.biochar.findUnique({
    where: { experimentNumber },
    include: {
      // Add any available relationships here
    }
  });
  
  if (!experiment) return null;
  
  // Add derived fields
  experiment.status = getExperimentStatus(experiment);
  experiment.downstreamCount = experiment.grapheneExperiments?.length || 0;
  
  return experiment;
}

/**
 * Get comprehensive compound batch data
 */
async function getCompoundBatchData(batchNumber) {
  // Simplified for now - just return basic compound batch data
  return { batchNumber, message: 'Compound batch data not yet implemented' };
  
  if (!batch) return null;
  
  // Add derived fields
  batch.status = getBatchStatus(batch);
  batch.micronized = batch.micronizations?.length > 0;
  batch.totalShipped = batch.shipments?.reduce((sum, shipment) => sum + (shipment.weight || 0), 0) || 0;
  
  return batch;
}

/**
 * Get comprehensive micronization data
 */
async function getMicronizationData(micronizationNumber) {
  // Simplified for now - just return basic micronization data
  return { micronizationNumber, message: 'Micronization data not yet implemented' };
  
  if (!micronization) return null;
  
  // Add derived fields
  micronization.status = getMicronizationStatus(micronization);
  micronization.yield = micronization.inputWeight && micronization.outputWeight 
    ? ((micronization.outputWeight / micronization.inputWeight) * 100).toFixed(1)
    : null;
  
  return micronization;
}

/**
 * Get comprehensive shipment data
 */
async function getShipmentData(shipmentNumber) {
  // Simplified for now - just return basic shipment data
  return { shipmentNumber, message: 'Shipment data not yet implemented' };
  
  if (!shipment) return null;
  
  // Add derived fields
  shipment.sourceType = getShipmentSourceType(shipment);
  shipment.sourceData = getShipmentSourceData(shipment);
  
  return shipment;
}

/**
 * Helper functions for derived fields
 */

function getExperimentStatus(experiment) {
  if (!experiment) return 'unknown';
  
  // Logic to determine experiment status based on data completeness
  if (experiment.output && experiment.output > 0) {
    return 'completed';
  } else if (experiment.experimentDate) {
    return 'in_progress';
  } else {
    return 'pending';
  }
}

function getBatchStatus(batch) {
  if (!batch) return 'unknown';
  
  if (batch.totalOutput && batch.totalOutput > 0) {
    return 'completed';
  } else if (batch.constituents && batch.constituents.length > 0) {
    return 'in_progress';
  } else {
    return 'pending';
  }
}

function getMicronizationStatus(micronization) {
  if (!micronization) return 'unknown';
  
  if (micronization.outputWeight && micronization.outputWeight > 0) {
    return 'completed';
  } else if (micronization.inputWeight) {
    return 'in_progress';
  } else {
    return 'pending';
  }
}

function getTestCount(experiment) {
  let count = 0;
  if (experiment.betTests) count += experiment.betTests.length;
  if (experiment.conductivityTests) count += experiment.conductivityTests.length;
  if (experiment.ramanTests) count += experiment.ramanTests.length;
  if (experiment.temTests) count += experiment.temTests.length;
  return count;
}

function getShipmentSourceType(shipment) {
  if (shipment.grapheneExperiment) return 'graphene';
  if (shipment.compoundBatch) return 'compound-batch';
  if (shipment.micronization) return 'micronization';
  return 'unknown';
}

function getShipmentSourceData(shipment) {
  if (shipment.grapheneExperiment) return shipment.grapheneExperiment;
  if (shipment.compoundBatch) return shipment.compoundBatch;
  if (shipment.micronization) return shipment.micronization;
  return null;
}

/**
 * Get related experiments/data for a given record
 * GET /api/data/:type/:identifier/related
 */
router.get('/:type/:identifier/related', async (req, res) => {
  try {
    const { type, identifier } = req.params;
    
    let relatedData = [];
    
    switch (type) {
      case 'graphene':
        relatedData = await getRelatedGrapheneData(identifier);
        break;
      case 'biochar':
        relatedData = await getRelatedBiocharData(identifier);
        break;
      case 'compound-batch':
        relatedData = await getRelatedCompoundBatchData(identifier);
        break;
      default:
        return res.status(400).json({ error: 'Related data not supported for this type' });
    }
    
    res.json({ related: relatedData });
    
  } catch (error) {
    console.error('❌ Related data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch related data',
      message: error.message 
    });
  }
});

async function getRelatedGrapheneData(experimentNumber) {
  const experiment = await prisma.graphene.findUnique({
    where: { experimentNumber },
    select: { biocharLotNumber: true }
  });
  
  if (!experiment?.biocharLotNumber) return [];
  
  // Find other graphene experiments using the same biochar
  const related = await prisma.graphene.findMany({
    where: {
      biocharLotNumber: experiment.biocharLotNumber,
      experimentNumber: { not: experimentNumber }
    },
    orderBy: { experimentDate: 'desc' },
    take: 5
  });
  
  return related.map(exp => ({
    type: 'graphene',
    identifier: exp.experimentNumber,
    title: exp.experimentNumber,
    description: `Using biochar ${experiment.biocharLotNumber}`,
    date: exp.experimentDate
  }));
}

async function getRelatedBiocharData(experimentNumber) {
  // Find graphene experiments that used this biochar
  const related = await prisma.graphene.findMany({
    where: { biocharLotNumber: experimentNumber },
    orderBy: { experimentDate: 'desc' },
    take: 10
  });
  
  return related.map(exp => ({
    type: 'graphene',
    identifier: exp.experimentNumber,
    title: exp.experimentNumber,
    description: `Graphene experiment using this biochar`,
    date: exp.experimentDate
  }));
}

async function getRelatedCompoundBatchData(batchNumber) {
  // Simplified for now
  return [];
  
  if (!batch?.constituents) return [];
  
  return batch.constituents.map(constituent => ({
    type: 'graphene',
    identifier: constituent.experiment.experimentNumber,
    title: constituent.experiment.experimentNumber,
    description: `Constituent experiment (${constituent.weightUsed}g used)`,
    date: constituent.experiment.experimentDate
  }));
}

export default router;