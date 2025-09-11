/**
 * Dashboard Service
 * Centralized service for all dashboard functionality
 * Extracted from app-refactored.js for better maintainability
 */

class DashboardService {
  constructor() {
    // Service operates on the main app context passed to methods
  }

  async loadDashboardData(appContext) {
    try {
      // Load all dashboard data in parallel
      await Promise.all([
        this.loadProductionMetrics(appContext),
        this.loadInventoryData(appContext), 
        this.loadTestResultsData(appContext),
        this.loadActivityData(appContext),
        this.loadLatestProductionCards(appContext)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      appContext.dashboardError = 'Failed to load dashboard data';
    }
  }

  async loadProductionMetrics(appContext) {
    appContext.dashboardLoading.production = true;
    try {
      const response = await fetch('/api/dashboard/production-metrics');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      appContext.dashboardData.production = await response.json();
    } catch (error) {
      console.error('Error loading production metrics:', error);
      appContext.dashboardData.production = null;
    } finally {
      appContext.dashboardLoading.production = false;
    }
  }

  async loadInventoryData(appContext) {
    appContext.dashboardLoading.inventory = true;
    try {
      const response = await fetch('/api/dashboard/inventory-by-location');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      appContext.dashboardData.inventory = await response.json();
    } catch (error) {
      console.error('Error loading inventory data:', error);
      appContext.dashboardData.inventory = null;
    } finally {
      appContext.dashboardLoading.inventory = false;
    }
  }

  async loadTestResultsData(appContext) {
    appContext.dashboardLoading.testResults = true;
    try {
      const response = await fetch('/api/dashboard/best-test-results');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      appContext.dashboardData.testResults = await response.json();
    } catch (error) {
      console.error('Error loading test results data:', error);
      appContext.dashboardData.testResults = null;
    } finally {
      appContext.dashboardLoading.testResults = false;
    }
  }

  async loadActivityData(appContext) {
    appContext.dashboardLoading.activity = true;
    try {
      const response = await fetch('/api/dashboard/recent-activity');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      appContext.dashboardData.activity = await response.json();
    } catch (error) {
      console.error('Error loading activity data:', error);
      appContext.dashboardData.activity = null;
    } finally {
      appContext.dashboardLoading.activity = false;
    }
  }

  async loadLatestProductionCards(appContext) {
    try {
      // Load all latest production data in parallel
      const [latestGraphene, latestBatches, latestShipments] = await Promise.all([
        window.CardService.getLatestGrapheneCards(4),
        window.CardService.getLatestCompoundBatches(4),
        window.CardService.getLatestShipments(4)
      ]);
      
      appContext.latestGrapheneCards = latestGraphene;
      appContext.latestCompoundBatches = latestBatches;
      appContext.latestShipments = latestShipments;
    } catch (error) {
      console.error('Error loading latest production cards:', error);
      appContext.latestGrapheneCards = [];
      appContext.latestCompoundBatches = [];
      appContext.latestShipments = [];
    }
  }

  // Card creation methods for dashboard
  createGrapheneCard(experiment, createSimplifiedGrapheneCard) {
    return createSimplifiedGrapheneCard(experiment, {
      context: 'dashboard'
    });
  }

  createCompoundBatchCard(batch, createSimplifiedCompoundBatchCard) {
    return createSimplifiedCompoundBatchCard(batch, {
      context: 'dashboard'
    });
  }

  createShipmentCard(shipment, createSimplifiedShipmentCard) {
    return createSimplifiedShipmentCard(shipment, {
      context: 'dashboard'
    });
  }
}

// Create singleton instance
const dashboardService = new DashboardService();

// Export for use in other modules
window.DashboardService = dashboardService;

export default dashboardService;