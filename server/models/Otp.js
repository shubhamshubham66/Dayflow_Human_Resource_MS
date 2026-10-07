const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Email OTP Schema
 * - OTP is stored as a bcrypt hash (never plain text)
 * - MongoDB TTL index deletes the document automatically once it expires
 * - Survives server restarts (unlike the old in-memory Map)
 */
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.compareOtp = function (candidate) {
  return bcrypt.compare(candidate, this.otpHash);
};

otpSchema.statics.hashOtp = function (otp) {
  return bcrypt.hash(otp, 10);
};

module.exports = mongoose.model('Otp', otpSchema);
