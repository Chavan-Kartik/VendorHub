const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    // required: false // now optional
  },
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
      required: true,
      enum: ['kg', 'liters', 'pieces', 'boxes', 'bags']
    },
    specifications: String
  }],
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  deliveryLocation: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    locality: String
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'bidding', 'awarded', 'completed', 'cancelled'],
    default: 'open'
  },
  biddingEndDate: {
    type: Date,
    required: true
  },
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  awardedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  totalBids: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

requirementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Requirement', requirementSchema); 