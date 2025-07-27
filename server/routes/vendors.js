const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get vendor profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const vendor = await User.findById(userId).select('-password');
    res.json(vendor);
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    if (userType !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, phone, address } = req.body;
    const updatedVendor = await User.findByIdAndUpdate(
      userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 