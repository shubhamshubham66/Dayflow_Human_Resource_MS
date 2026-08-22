const mongoose = require('mongoose');

/**
 * Activity Schema - Tracks system-wide and per-user activity/notifications.
 * Used in dashboard feeds for both employees and admins.
 */
const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'login',
        'profile_update',
        'leave_request',
        'leave_approved',
        'leave_rejected',
        'attendance_checkin',
        'attendance_checkout',
        'payroll_generated',
        'document_upload',
        'account_created',
        'role_change',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Who should see this activity (null = only the user themselves, 'admin' = admin feed)
    visibility: {
      type: String,
      enum: ['self', 'admin', 'all'],
      default: 'self',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
