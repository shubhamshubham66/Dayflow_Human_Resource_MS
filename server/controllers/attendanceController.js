const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');

/**
 * Helper: Get start of day (midnight) for a given date
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * @desc    Check in for today
 * @route   POST /api/attendance/check-in
 * @access  Private
 */
const checkIn = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const userId = req.user._id;

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employee: userId,
      date: today,
    });

    if (attendance && attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today.',
      });
    }

    const now = new Date();

    if (attendance) {
      // Record exists (maybe pre-created as absent), update it
      attendance.checkIn.time = now;
      attendance.checkIn.ip = req.ip || '';
      attendance.status = 'present';
    } else {
      // Create new record
      attendance = new Attendance({
        employee: userId,
        date: today,
        checkIn: { time: now, ip: req.ip || '' },
        status: 'present',
      });
    }

    await attendance.save();

    // Log activity
    await Activity.create({
      user: userId,
      type: 'attendance_checkin',
      title: 'Checked In',
      description: `Checked in at ${now.toLocaleTimeString()}`,
      visibility: 'admin',
    });

    res.status(200).json({
      success: true,
      message: 'Checked in successfully.',
      data: attendance,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for today.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Check-in failed. Please try again.',
    });
  }
};

/**
 * @desc    Check out for today
 * @route   POST /api/attendance/check-out
 * @access  Private
 */
const checkOut = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const userId = req.user._id;

    const attendance = await Attendance.findOne({
      employee: userId,
      date: today,
    });

    if (!attendance || !attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You need to check in first before checking out.',
      });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today.',
      });
    }

    const now = new Date();
    attendance.checkOut.time = now;
    attendance.checkOut.ip = req.ip || '';

    // Calculate total hours
    attendance.calculateHours();

    // Determine status based on hours worked
    if (attendance.totalHours < 4) {
      attendance.status = 'half-day';
    } else {
      attendance.status = 'present';
    }

    await attendance.save();

    // Log activity
    await Activity.create({
      user: userId,
      type: 'attendance_checkout',
      title: 'Checked Out',
      description: `Checked out at ${now.toLocaleTimeString()} (${attendance.totalHours}h worked)`,
      visibility: 'admin',
    });

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours: ${attendance.totalHours}h`,
      data: attendance,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-out failed. Please try again.',
    });
  }
};

/**
 * @desc    Get today's attendance status for current user
 * @route   GET /api/attendance/today
 * @access  Private
 */
const getTodayStatus = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    res.status(200).json({
      success: true,
      data: attendance || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s status.',
    });
  }
};

/**
 * @desc    Get my attendance records (monthly view)
 * @route   GET /api/attendance/my?month=2024-03
 * @access  Private
 */
const getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query; // Format: YYYY-MM
    let startDate, endDate;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0, 23, 59, 59); // Last day of month
    } else {
      // Default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const records = await Attendance.find({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate summary stats
    const summary = {
      totalDays: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
      leave: records.filter((r) => r.status === 'leave').length,
      totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };

    res.status(200).json({
      success: true,
      data: records,
      summary,
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records.',
    });
  }
};

/**
 * @desc    Get all employees' attendance (admin)
 * @route   GET /api/attendance/all?date=2024-03-15&department=Engineering
 * @access  Private/Admin
 */
const getAllAttendance = async (req, res) => {
  try {
    const { date, month, department, search, page = 1, limit = 20 } = req.query;
    let startDate, endDate;

    if (date) {
      // Single day view
      startDate = getStartOfDay(new Date(date));
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (month) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1);
      endDate = new Date(year, mon, 0, 23, 59, 59);
    } else {
      // Default: today
      startDate = getStartOfDay(new Date());
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Build query
    const matchQuery = {
      date: { $gte: startDate, $lte: endDate },
    };

    // Get records with populated employee data
    let query = Attendance.find(matchQuery)
      .populate({
        path: 'employee',
        select: 'fullName employeeId email department designation profilePicture',
        match: {},
      })
      .sort({ date: -1, 'checkIn.time': -1 });

    const records = await query;

    // Filter by department or search (post-populate filtering)
    let filteredRecords = records.filter((r) => r.employee !== null);

    if (department) {
      filteredRecords = filteredRecords.filter(
        (r) => r.employee.department && r.employee.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecords = filteredRecords.filter(
        (r) =>
          r.employee.fullName.toLowerCase().includes(searchLower) ||
          r.employee.employeeId.toLowerCase().includes(searchLower) ||
          r.employee.email.toLowerCase().includes(searchLower)
      );
    }

    // Paginate
    const total = filteredRecords.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRecords = filteredRecords.slice(skip, skip + parseInt(limit));

    // Summary for the day/period
    const summary = {
      total: filteredRecords.length,
      present: filteredRecords.filter((r) => r.status === 'present').length,
      absent: filteredRecords.filter((r) => r.status === 'absent').length,
      halfDay: filteredRecords.filter((r) => r.status === 'half-day').length,
      leave: filteredRecords.filter((r) => r.status === 'leave').length,
    };

    res.status(200).json({
      success: true,
      data: paginatedRecords,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records.',
    });
  }
};

/**
 * @desc    Admin: Mark attendance for an employee (manual override)
 * @route   POST /api/attendance/mark
 * @access  Private/Admin
 */
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, notes } = req.body;

    const targetDate = getStartOfDay(new Date(date));

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: targetDate,
    });

    if (attendance) {
      attendance.status = status;
      attendance.notes = notes || '';
      attendance.markedBy = req.user._id;
    } else {
      attendance = new Attendance({
        employee: employeeId,
        date: targetDate,
        status,
        notes: notes || '',
        markedBy: req.user._id,
      });
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully.',
      data: attendance,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance.',
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
};
