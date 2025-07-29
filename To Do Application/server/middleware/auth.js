const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) return res.status(403).json({ error: 'Token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
