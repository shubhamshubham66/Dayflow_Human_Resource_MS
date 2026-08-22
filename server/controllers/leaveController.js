const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves/apply
 * @access  Private
 */
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request overlapping these dates.',
      });
    }

    // Calculate total days
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    // Log activity (visible to admin)
    await Activity.create({
      user: req.user._id,
      type: 'leave_request',
      title: 'Leave Request Submitted',
      description: `${req.user.fullName} requested ${totalDays} day(s) of ${leaveType} leave`,
      visibility: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      data: leave,
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request.',
    });
  }
};

/**
 * @desc    Get my leave requests
 * @route   GET /api/leaves/my?status=pending&year=2024
 * @access  Private
 */
const getMyLeaves = async (req, res) => {
  try {
    const { status, year, page = 1, limit = 10 } = req.query;

    const filter = { employee: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);
      filter.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate('reviewedBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Leave.countDocuments(filter),
    ]);

    // Leave balance summary
    const currentYear = new Date().getFullYear();
    const yearFilter = {
      employee: req.user._id,
      startDate: { $gte: new Date(currentYear, 0, 1) },
      status: 'approved',
    };
    const approvedLeaves = await Leave.find(yearFilter);
    const totalUsed = approvedLeaves.reduce((sum, l) => sum + l.totalDays, 0);

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      balance: {
        totalAllowed: 24, // Configurable per company policy
        used: totalUsed,
        remaining: Math.max(0, 24 - totalUsed),
        pending: await Leave.countDocuments({ employee: req.user._id, status: 'pending' }),
      },
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests.',
    });
  }
};

/**
 * @desc    Get all leave requests (admin)
 * @route   GET /api/leaves/all?status=pending&department=Engineering
 * @access  Private/Admin
 */
const getAllLeaves = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Leave.find(filter)
      .populate('employee', 'fullName employeeId email department designation profilePicture')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let leaves = await query;
    let total = await Leave.countDocuments(filter);

    // Post-populate search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      leaves = leaves.filter(
        (l) =>
          l.employee &&
          (l.employee.fullName.toLowerCase().includes(searchLower) ||
           l.employee.employeeId.toLowerCase().includes(searchLower))
      );
      total = leaves.length;
    }

    // Summary counts
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Leave.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'approved' }),
      Leave.countDocuments({ status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests.',
    });
  }
};

/**
 * @desc    Approve or reject a leave request
 * @route   PUT /api/leaves/:id/review
 * @access  Private/Admin
 */
const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".',
      });
    }

    const leave = await Leave.findById(id).populate('employee', 'fullName');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${leave.status}.`,
      });
    }

    // Update leave status
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.adminComment = adminComment || '';
    await leave.save();

    // If approved, mark attendance records as 'leave' for those dates
    if (status === 'approved') {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      // Create/update attendance records for leave days
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayDate = new Date(currentDate);
        dayDate.setHours(0, 0, 0, 0);

        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: dayDate },
          {
            employee: leave.employee._id,
            date: dayDate,
            status: 'leave',
            notes: `${leave.leaveType} leave (approved)`,
            markedBy: req.user._id,
          },
          { upsert: true, new: true }
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Create activity notification for the employee
    await Activity.create({
      user: leave.employee._id,
      type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
      title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: adminComment
        ? `Your leave request was ${status}. Comment: "${adminComment}"`
        : `Your leave request (${leave.startDate.toLocaleDateString()} - ${leave.endDate.toLocaleDateString()}) was ${status}.`,
      visibility: 'self',
    });

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully.`,
      data: leave,
    });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review leave request.',
    });
  }
};

/**
 * @desc    Cancel a leave request (by employee, only if pending)
 * @route   PUT /api/leaves/:id/cancel
 * @access  Private
 */
const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOne({
      _id: id,
      employee: req.user._id,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled.',
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled.',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request.',
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
};
