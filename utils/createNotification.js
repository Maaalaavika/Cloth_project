const Notification = require('../models/Notification');

/**
 * Persist a notification for a user. Safe to call when MongoDB is unavailable (logs and returns null).
 */
async function createNotification(userId, type, message, swapId = null) {
  try {
    return await Notification.create({
      recipient: userId,
      type,
      message,
      relatedSwap: swapId || undefined,
    });
  } catch (err) {
    console.warn('createNotification failed:', err.message);
    return null;
  }
}

module.exports = { createNotification };
