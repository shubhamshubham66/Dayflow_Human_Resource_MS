const Activity = require('../models/Activity');

/**
 * @desc    Get recent activities for current user
 * @route   GET /api/activities/my
 * @access  Private
 */
const getMyActivities = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities.',
    });
  }
};

/**
 * @desc    Get admin activity feed (all activities visible to admin)
 * @route   GET /api/activities/admin
 * @access  Private/Admin
 */
const getAdminActivities = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const activities = await Activity.find({
      visibility: { $in: ['admin', 'all'] },
    })
      .populate('user', 'fullName employeeId profilePicture')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({
      visibility: { $in: ['admin', 'all'] },
    });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get admin activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities.',
    });
  }
};

/**
 * @desc    Mark activities as read
 * @route   PUT /api/activities/mark-read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { activityIds } = req.body;

    if (activityIds && activityIds.length > 0) {
      await Activity.updateMany(
        { _id: { $in: activityIds }, user: req.user._id },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Activity.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Activities marked as read.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark activities as read.',
    });
  }
};

module.exports = {
  getMyActivities,
  getAdminActivities,
  markAsRead,
};
