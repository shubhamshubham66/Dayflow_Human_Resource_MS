const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Change password
 * @route   PUT /api/settings/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must contain at least 1 number.' });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must contain at least 1 special character.' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/settings/notification-preferences
 * @access  Private
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const { emailNotifications, leaveUpdates, attendanceReminders, payrollAlerts } = req.body;

    // Store in user metadata (we'll use a simple approach)
    await User.findByIdAndUpdate(req.user._id, {
      'notificationPreferences': {
        emailNotifications: emailNotifications !== false,
        leaveUpdates: leaveUpdates !== false,
        attendanceReminders: attendanceReminders !== false,
        payrollAlerts: payrollAlerts !== false,
      },
    });

    res.status(200).json({ success: true, message: 'Preferences updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update preferences.' });
  }
};

module.exports = { changePassword, updateNotificationPreferences };
