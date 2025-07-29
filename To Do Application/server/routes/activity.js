// backend/routes/activity.js

const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const verifyToken = require('../middleware/verifyToken'); // or remove for public log

// Fetch last 20 activities
router.get('/', verifyToken, async (req, res) => {
  try {
    const acts = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: 'user', select: 'username', strictPopulate: false }); // won't error if missing ref
    res.json(acts);
  } catch (e) {
    console.error('Activity fetch error:', e);
    res.status(500).json({ error: e.message || 'Activity fetch error' });
  }
});

module.exports = router;
