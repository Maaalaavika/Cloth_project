const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attach req.user if token is valid
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -verifyToken -resetToken');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Optional: attach user but don't block if no token
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const token = header.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    }
  } catch { /* ignore */ }
  next();
};

module.exports = { protect, optionalAuth };
