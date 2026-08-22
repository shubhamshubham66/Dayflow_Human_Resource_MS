const mongoose = require('mongoose');

/**
 * Attendance Schema for Dayflow HRMS
 * Tracks daily check-in/check-out with status indicators.
 * One record per employee per day.
 */
const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      time: { type: Date, default: null },
      ip: { type: String, default: '' },
    },
    checkOut: {
      time: { type: Date, default: null },
      ip: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave', 'holiday', 'weekend'],
      default: 'absent',
    },
    totalHours: {
      type: Number, // Calculated hours worked
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Set by admin for manual overrides
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
// For efficient date-range queries
attendanceSchema.index({ date: 1, status: 1 });

/**
 * Calculate total hours between check-in and check-out
 */
attendanceSchema.methods.calculateHours = function () {
  if (this.checkIn.time && this.checkOut.time) {
    const diff = this.checkOut.time - this.checkIn.time;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // 2 decimal places
  }
  return this.totalHours;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
