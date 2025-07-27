const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  salesData: [{
    date: {
      type: Date,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    revenue: {
      type: Number,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    profit: {
      type: Number,
      required: true
    }
  }],
  materialUsage: [{
    materialName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  insights: {
    topSellingProducts: [{
      productName: String,
      totalRevenue: Number,
      totalQuantity: Number
    }],
    materialEfficiency: [{
      materialName: String,
      costPerUnit: Number,
      usageTrend: String // 'increasing', 'decreasing', 'stable'
    }],
    profitMargins: [{
      productName: String,
      margin: Number,
      trend: String
    }],
    recommendations: [{
      type: {
        type: String,
        enum: ['buy', 'sell', 'optimize'],
        required: true
      },
      material: String,
      quantity: Number,
      reason: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

analyticsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema); 