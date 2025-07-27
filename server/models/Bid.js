const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: Number, // in days
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photos: [{ type: String }],
  materials: [{
    name: {
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
    price: {
      type: Number,
      required: true
    },
    quality: {
      type: String,
      enum: ['premium', 'standard', 'economy'],
      default: 'standard'
    }
  }],
  terms: {
    paymentTerms: String,
    deliveryTerms: String,
    warranty: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bidSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
bidSchema.index({ requirement: 1, supplier: 1 });
bidSchema.index({ requirement: 1, amount: 1 });

module.exports = mongoose.model('Bid', bidSchema); 