const router        = require('express').Router();
const crypto        = require('crypto');
const jwt           = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User          = require('../models/User');
const { protect }   = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendPasswordReset } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitizeUser = (user) => ({
  _id:             user._id,
  name:            user.name,
  email:           user.email,
  avatar:          user.avatar,
  bio:             user.bio,
  city:            user.city,
  pincode:         user.pincode,
  sizePreferences: user.sizePreferences,
  isVerified:      user.isVerified,
  avgRating:       user.avgRating,
  swapCount:       user.swapCount,
  trustBadge:      user.trustBadge,
});

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    let user;
    try {
      user = await User.create({
        name,
        email,
        passwordHash:   password,   // pre-save hook hashes it
        verifyToken,
        verifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await sendVerificationEmail(email, verifyToken);
      res.status(201).json({ message: 'Registered! Check your email to verify your account.' });
    } catch (emailErr) {
      if (user) {
        await User.deleteOne({ _id: user._id });
      }
      throw emailErr;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/verify-email ───────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      verifyToken:    token,
      verifyTokenExp: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

    user.isVerified      = true;
    user.verifyToken     = undefined;
    user.verifyTokenExp  = undefined;
    await user.save();

    const jwtToken = signToken(user._id);
    res.json({ token: jwtToken, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    const token = signToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/google ─────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture, isVerified: true });
    } else if (!user.googleId) {
      user.googleId   = googleId;
      user.isVerified = true;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken    = token;
    user.resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordReset(user.email, token);
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findOne({
      resetToken:    token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    user.passwordHash  = password;
    user.resetToken    = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;
