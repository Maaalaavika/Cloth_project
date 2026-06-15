const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// POST /api/notifications — create a notification for logged-in user
router.post('/', protect, async (req, res) => {
  try {
    const { type, message, swapId } = req.body;
    const notification = await Notification.create({
      recipient: req.user._id,
      type,
      message,
      relatedSwap: swapId || undefined,
    });
    res.status(201).json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications — list for logged-in user (newest first)
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
