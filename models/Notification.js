const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'NEW_SWAP_REQUEST',
  'REQUEST_ACCEPTED',
  'REQUEST_DECLINED',
  'SWAP_COMPLETED',
  'NEW_MESSAGE',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    message: { type: String, required: true, maxlength: 500 },
    relatedSwap: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
