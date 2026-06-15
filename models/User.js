const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reviewSchema = new mongoose.Schema({
  reviewerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swapRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  rating:        { type: Number, required: true, min: 1, max: 5 },
  comment:       { type: String, maxlength: 500 },
  createdAt:     { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId:     { type: String, sparse: true },
    avatar:       { type: String, default: '' },
    bio:          { type: String, maxlength: 300, default: '' },
    city:         { type: String, default: '' },
    pincode:      { type: String, default: '' },
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    sizePreferences: {
      tops:         { type: String, default: '' },
      bottoms:      { type: String, default: '' },
      shoes:        { type: String, default: '' },
      dresses:      { type: String, default: '' },
    },
    wishlist:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClothingListing' }],
    isVerified:      { type: Boolean, default: false },
    verifyToken:     { type: String },
    verifyTokenExp:  { type: Date },
    resetToken:      { type: String },
    resetTokenExp:   { type: Date },

    // Reputation
    reviews:         [reviewSchema],
    avgRating:       { type: Number, default: 0 },
    swapCount:       { type: Number, default: 0 },
    trustBadge:      {
      type: String,
      enum: ['', 'New Swapper', 'Verified Swapper', 'Trusted Trader', 'Top Trader', 'Elite Swapper'],
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Recompute avgRating and trustBadge after reviews change
userSchema.methods.recomputeReputation = function () {
  if (this.reviews.length === 0) {
    this.avgRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.avgRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
  const s = this.swapCount;
  const r = this.avgRating;
  if (s >= 50 && r >= 4.8)       this.trustBadge = 'Elite Swapper';
  else if (s >= 20 && r >= 4.5)  this.trustBadge = 'Top Trader';
  else if (s >= 10 && r >= 4.0)  this.trustBadge = 'Trusted Trader';
  else if (s >= 3  && r >= 3.5)  this.trustBadge = 'Verified Swapper';
  else if (s >= 1)               this.trustBadge = 'New Swapper';
  else                           this.trustBadge = '';
};

module.exports = mongoose.model('User', userSchema);
