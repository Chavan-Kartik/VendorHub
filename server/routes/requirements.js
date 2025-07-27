const express = require('express');
const { body, validationResult } = require('express-validator');
const Requirement = require('../models/Requirement');
const Bid = require('../models/Bid');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new requirement (vendor only)
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('materials').isArray({ min: 1 }),
  body('budget.min').isNumeric(),
  body('budget.max').isNumeric(),
  body('deliveryDate').isISO8601(),
  body('biddingEndDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can create requirements' });
    }

    const requirement = new Requirement({
      ...req.body,
      vendor: userId
    });

    await requirement.save();

    res.status(201).json({
      message: 'Requirement created successfully',
      requirement
    });
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requirements (with filters)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      locality,
      material,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (locality) filter['deliveryLocation.locality'] = new RegExp(locality, 'i');
    if (material) filter['materials.name'] = new RegExp(material, 'i');
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    const requirements = await Requirement.find(filter)
      .populate('vendor', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Requirement.countDocuments(filter);

    res.json({
      requirements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requirement by ID with bids
router.get('/:id', async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id)
      .populate('vendor', 'name email phone address')
      .populate('awardedTo', 'name email phone');

    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    // Get bids for this requirement
    const bids = await Bid.find({ requirement: req.params.id })
      .populate('supplier', 'name email phone isVerified')
      .sort({ amount: 1 });

    res.json({
      requirement,
      bids,
      totalBids: bids.length
    });
  } catch (error) {
    console.error('Get requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update requirement (vendor only)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can update requirements' });
    }

    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    if (requirement.vendor.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own requirements' });
    }

    if (requirement.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update requirement that is not open' });
    }

    const updatedRequirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Requirement updated successfully',
      requirement: updatedRequirement
    });
  } catch (error) {
    console.error('Update requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Award bid to supplier (vendor only)
router.post('/:id/award', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { bidId } = req.body;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can award bids' });
    }

    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    if (requirement.vendor.toString() !== userId) {
      return res.status(403).json({ message: 'You can only award bids for your own requirements' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid || bid.requirement.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Update requirement status
    requirement.status = 'awarded';
    requirement.awardedTo = bid.supplier;
    requirement.awardedBid = bid._id;
    await requirement.save();

    // Update bid status
    bid.status = 'accepted';
    bid.isWinning = true;
    await bid.save();

    // Reject other bids
    await Bid.updateMany(
      { requirement: req.params.id, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    res.json({
      message: 'Bid awarded successfully',
      requirement,
      awardedBid: bid
    });
  } catch (error) {
    console.error('Award bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor's own requirements
router.get('/vendor/my-requirements', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requirements = await Requirement.find({ vendor: userId })
      .populate('awardedTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(requirements);
  } catch (error) {
    console.error('Get vendor requirements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bids for a specific requirement (vendor only)
router.get('/:id/bids', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can view bids for their requirements' });
    }
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    if (requirement.vendor.toString() !== userId) {
      return res.status(403).json({ message: 'You can only view bids for your own requirements' });
    }
    const bids = await Bid.find({ requirement: req.params.id })
      .populate({
        path: 'supplier',
        select: 'name email phone verified reviews',
        populate: { path: 'reviews.reviewer', select: 'name' }
      })
      .sort({ amount: 1 });
    res.json({ bids });
  } catch (error) {
    console.error('Get bids for requirement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vendor adds a review for a supplier
router.post('/supplier/:supplierId/review', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { rating, comment } = req.body;
    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can add reviews' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const supplier = await require('../models/User').findById(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    supplier.reviews.push({ reviewer: userId, rating, comment });
    await supplier.save();
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add supplier review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin verifies a supplier
router.post('/suppliers/:id/verify', auth, async (req, res) => {
  try {
    const userType = req.user.userType;
    if (userType !== 'admin') {
      return res.status(403).json({ message: 'Only admins can verify suppliers' });
    }
    const supplier = await require('../models/User').findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    supplier.verified = true;
    await supplier.save();
    res.json({ message: 'Supplier verified successfully' });
  } catch (error) {
    console.error('Verify supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: List all suppliers
router.get('/users', auth, async (req, res) => {
  try {
    const userType = req.query.userType;
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view users' });
    }
    const filter = userType ? { userType } : {};
    const users = await require('../models/User').find(filter);
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 