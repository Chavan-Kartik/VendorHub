const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get supplier profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const supplier = await User.findById(userId).select('-password');
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update supplier profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, phone, address } = req.body;
    const updatedSupplier = await User.findByIdAndUpdate(
      userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      supplier: updatedSupplier
    });
  } catch (error) {
    console.error('Update supplier profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get verification status
router.get('/verification-status', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'supplier') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const supplier = await User.findById(userId).select('isVerified verificationDocuments');
    res.json({
      isVerified: supplier.isVerified,
      verificationDocuments: supplier.verificationDocuments
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 