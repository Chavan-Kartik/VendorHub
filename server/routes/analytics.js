const express = require('express');
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

const router = express.Router();

// Add sales data (vendor only)
router.post('/sales-data', [
  body('salesData').isArray({ min: 1 }),
  body('salesData.*.date').isISO8601(),
  body('salesData.*.productName').trim().notEmpty(),
  body('salesData.*.quantity').isNumeric({ min: 0 }),
  body('salesData.*.revenue').isNumeric({ min: 0 }),
  body('salesData.*.cost').isNumeric({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can add sales data' });
    }

    const { salesData } = req.body;

    // Calculate profit for each sale
    const processedSalesData = salesData.map(sale => ({
      ...sale,
      profit: sale.revenue - sale.cost
    }));

    let analytics = await Analytics.findOne({ vendor: userId });
    
    if (!analytics) {
      analytics = new Analytics({
        vendor: userId,
        salesData: processedSalesData
      });
    } else {
      analytics.salesData.push(...processedSalesData);
    }

    // Generate insights
    analytics.insights = await generateInsights(analytics.salesData);
    
    await analytics.save();

    res.json({
      message: 'Sales data added successfully',
      analytics
    });
  } catch (error) {
    console.error('Add sales data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add material usage data (vendor only)
router.post('/material-usage', [
  body('materialUsage').isArray({ min: 1 }),
  body('materialUsage.*.materialName').trim().notEmpty(),
  body('materialUsage.*.quantity').isNumeric({ min: 0 }),
  body('materialUsage.*.unit').trim().notEmpty(),
  body('materialUsage.*.cost').isNumeric({ min: 0 }),
  body('materialUsage.*.date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can add material usage data' });
    }

    const { materialUsage } = req.body;

    let analytics = await Analytics.findOne({ vendor: userId });
    
    if (!analytics) {
      analytics = new Analytics({
        vendor: userId,
        materialUsage
      });
    } else {
      analytics.materialUsage.push(...materialUsage);
    }

    await analytics.save();

    res.json({
      message: 'Material usage data added successfully',
      analytics
    });
  } catch (error) {
    console.error('Add material usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics dashboard (vendor only)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await Analytics.findOne({ vendor: userId });
    
    if (!analytics) {
      return res.json({
        message: 'No analytics data found',
        dashboard: {
          totalRevenue: 0,
          totalProfit: 0,
          totalSales: 0,
          topProducts: [],
          materialEfficiency: [],
          recommendations: []
        }
      });
    }

    // Calculate dashboard metrics
    const dashboard = calculateDashboardMetrics(analytics);

    res.json({
      analytics,
      dashboard
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate recommendations
router.post('/generate-recommendations', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await Analytics.findOne({ vendor: userId });
    
    if (!analytics || !analytics.salesData.length) {
      return res.status(400).json({ message: 'No sales data available for recommendations' });
    }

    const recommendations = await generateRecommendations(analytics);
    
    analytics.insights.recommendations = recommendations;
    await analytics.save();

    res.json({
      message: 'Recommendations generated successfully',
      recommendations
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate insights
async function generateInsights(salesData) {
  const insights = {
    topSellingProducts: [],
    materialEfficiency: [],
    profitMargins: [],
    recommendations: []
  };

  if (!salesData.length) return insights;

  // Calculate top selling products
  const productStats = {};
  salesData.forEach(sale => {
    if (!productStats[sale.productName]) {
      productStats[sale.productName] = {
        totalRevenue: 0,
        totalQuantity: 0,
        totalCost: 0
      };
    }
    productStats[sale.productName].totalRevenue += sale.revenue;
    productStats[sale.productName].totalQuantity += sale.quantity;
    productStats[sale.productName].totalCost += sale.cost;
  });

  insights.topSellingProducts = Object.entries(productStats)
    .map(([productName, stats]) => ({
      productName,
      totalRevenue: stats.totalRevenue,
      totalQuantity: stats.totalQuantity
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Calculate profit margins
  insights.profitMargins = Object.entries(productStats)
    .map(([productName, stats]) => ({
      productName,
      margin: ((stats.totalRevenue - stats.totalCost) / stats.totalRevenue) * 100,
      trend: 'stable' // Simplified for demo
    }))
    .sort((a, b) => b.margin - a.margin);

  return insights;
}

// Helper function to calculate dashboard metrics
function calculateDashboardMetrics(analytics) {
  const totalRevenue = analytics.salesData.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalProfit = analytics.salesData.reduce((sum, sale) => sum + sale.profit, 0);
  const totalSales = analytics.salesData.length;

  return {
    totalRevenue,
    totalProfit,
    totalSales,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    topProducts: analytics.insights.topSellingProducts,
    materialEfficiency: analytics.insights.materialEfficiency,
    recommendations: analytics.insights.recommendations
  };
}

// Helper function to generate recommendations
async function generateRecommendations(analytics) {
  const recommendations = [];

  // Analyze sales trends
  const recentSales = analytics.salesData
    .filter(sale => new Date(sale.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (recentSales.length > 0) {
    const topProduct = analytics.insights.topSellingProducts[0];
    if (topProduct) {
      recommendations.push({
        type: 'buy',
        material: topProduct.productName,
        quantity: Math.ceil(topProduct.totalQuantity * 0.2), // 20% of current usage
        reason: `High demand for ${topProduct.productName}`,
        priority: 'high'
      });
    }

    // Check for low profit margins
    const lowMarginProducts = analytics.insights.profitMargins
      .filter(product => product.margin < 15)
      .slice(0, 3);

    lowMarginProducts.forEach(product => {
      recommendations.push({
        type: 'optimize',
        material: product.productName,
        quantity: 0,
        reason: `Low profit margin (${product.margin.toFixed(1)}%) - consider cost optimization`,
        priority: 'medium'
      });
    });
  }

  return recommendations;
}

module.exports = router; 