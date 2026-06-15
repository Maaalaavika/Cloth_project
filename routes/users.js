const router  = require('express').Router();
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ─── GET /api/users/:id ────────────────────────────────────────────────────
// Public profile view
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -verifyToken -resetToken -googleId -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /api/users/me ───────────────────────────────────────────────────
// Update own profile (name, bio, city, pincode, sizePreferences, avatar)
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'city', 'pincode', 'sizePreferences', 'avatar'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // If pincode provided, attempt to geocode to [lng, lat]
    // In production, call a geocoding API here (e.g. Google Maps Geocoding)
    // For now we accept optional lat/lng from client
    if (req.body.lat && req.body.lng) {
      updates.location = { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-passwordHash -verifyToken -resetToken');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/users/:id/reviews ──────────────────────────────────────────
// Submit a review after a completed swap
// Body: { swapRequestId, rating (1-5), comment }
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { swapRequestId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    // Prevent reviewing yourself
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot review yourself' });

    const reviewee = await User.findById(req.params.id);
    if (!reviewee) return res.status(404).json({ message: 'User not found' });

    // Prevent duplicate review for same swap
    const already = reviewee.reviews.some(
      (r) => r.swapRequestId?.toString() === swapRequestId && r.reviewerId.toString() === req.user._id.toString()
    );
    if (already) return res.status(409).json({ message: 'You have already reviewed this swap' });

    reviewee.reviews.push({ reviewerId: req.user._id, swapRequestId, rating, comment });
    reviewee.recomputeReputation();
    await reviewee.save();

    res.status(201).json({
      avgRating:  reviewee.avgRating,
      swapCount:  reviewee.swapCount,
      trustBadge: reviewee.trustBadge,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/users/:id/reviews ───────────────────────────────────────────
router.get('/:id/reviews', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('reviews avgRating swapCount trustBadge')
      .populate('reviews.reviewerId', 'name avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ reviews: user.reviews, avgRating: user.avgRating, trustBadge: user.trustBadge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
