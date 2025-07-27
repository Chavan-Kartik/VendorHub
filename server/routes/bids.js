const express = require('express');
const { body, validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Requirement = require('../models/Requirement');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Place a bid (supplier only)
router.post('/', requireAuth, upload.array('photos', 5), [
  body('requirement').isMongoId(),
  body('amount').isNumeric({ min: 1 }),
  body('deliveryTime').isNumeric({ min: 1 }),
  body('description').trim().isLength({ min: 10 }),
  body('materials').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can place bids' });
    }

    // Check if supplier is verified
    const user = await User.findById(userId);
    if (!user.verified) {
      return res.status(403).json({ message: 'You must be a verified supplier to place bids.' });
    }

    const { requirement: requirementId, amount, deliveryTime, description, materials, terms } = req.body;

    // Check if requirement exists and is open for bidding
    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    if (requirement.status !== 'open' && requirement.status !== 'bidding') {
      return res.status(400).json({ message: 'This requirement is not open for bidding' });
    }

    if (new Date() > new Date(requirement.biddingEndDate)) {
      return res.status(400).json({ message: 'Bidding period has ended' });
    }

    // Check if supplier already placed a bid
    const existingBid = await Bid.findOne({
      requirement: requirementId,
      supplier: userId
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid for this requirement' });
    }

    // Handle photo uploads
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(f => '/uploads/' + f.filename);
    }

    // Create new bid
    const bid = new Bid({
      requirement: requirementId,
      supplier: userId,
      amount,
      deliveryTime,
      description,
      materials,
      terms,
      photos
    });

    await bid.save();

    // Update requirement bid count
    requirement.totalBids += 1;
    requirement.status = 'bidding';
    await requirement.save();

    res.status(201).json({
      message: 'Bid placed successfully',
      bid
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve uploaded images
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Get supplier's bids
router.get('/my-bids', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bids = await Bid.find({ supplier: userId })
      .populate('requirement', 'title description budget deliveryLocation status')
      .populate('requirement.vendor', 'name email phone')
      .sort({ submittedAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bid (supplier only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can update bids' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.supplier.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own bids' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update bid that is not pending' });
    }

    // Check if requirement is still open for bidding
    const requirement = await Requirement.findById(bid.requirement);
    if (new Date() > new Date(requirement.biddingEndDate)) {
      return res.status(400).json({ message: 'Bidding period has ended' });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Bid updated successfully',
      bid: updatedBid
    });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw bid (supplier only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can withdraw bids' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.supplier.toString() !== userId) {
      return res.status(403).json({ message: 'You can only withdraw your own bids' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw bid that is not pending' });
    }

    // Check if requirement is still open for bidding
    const requirement = await Requirement.findById(bid.requirement);
    if (new Date() > new Date(requirement.biddingEndDate)) {
      return res.status(400).json({ message: 'Bidding period has ended' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Update requirement bid count
    requirement.totalBids = Math.max(0, requirement.totalBids - 1);
    if (requirement.totalBids === 0) {
      requirement.status = 'open';
    }
    await requirement.save();

    res.json({
      message: 'Bid withdrawn successfully',
      bid
    });
  } catch (error) {
    console.error('Withdraw bid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bids for a specific requirement
router.get('/requirement/:requirementId', async (req, res) => {
  try {
    const bids = await Bid.find({ requirement: req.params.requirementId })
      .populate('supplier', 'name email phone isVerified')
      .populate('reviews.reviewer', 'name')
      .sort({ amount: 1 });

    res.json(bids);
  } catch (error) {
    console.error('Get requirement bids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a review to a bid
router.post('/:id/reviews', requireAuth, [
    body('text').trim().isLength({ min: 1 }),
    body('rating').isNumeric({ min: 1, max: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const bid = await Bid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        const requirement = await Requirement.findById(bid.requirement);
        if (requirement.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Only the requirement creator can review bids' });
        }

        const { text, rating } = req.body;
        const review = {
            text,
            rating,
            reviewer: req.user.userId
        };

        bid.reviews.push(review);
        await bid.save();

        res.status(201).json({
            message: 'Review added successfully',
            bid
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;