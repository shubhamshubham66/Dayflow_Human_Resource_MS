const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * @desc    Get all employees (with search, filter, pagination)
 * @route   GET /api/employees
 * @access  Private/Admin
 */
const getEmployees = async (req, res) => {
  try {
    const {
      search = '',
      department = '',
      role = '',
      status = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query filter
    const filter = {};

    // Search by name, email, or employee ID
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by active status
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const [employees, total] = await Promise.all([
      User.find(filter)
        .select('-password -verificationToken -verificationTokenExpires -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees.',
    });
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (Admin can view any, Employee can view self)
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Employees can only view their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.',
      });
    }

    const employee = await User.findById(id).select(
      '-password -verificationToken -verificationTokenExpires -refreshToken'
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee.',
    });
  }
};

/**
 * @desc    Update employee profile
 * @route   PUT /api/employees/:id
 * @access  Private (Employee: limited fields, Admin: all fields)
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Employees can only edit their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own profile.',
      });
    }

    // Fields employees can edit themselves
    const employeeEditableFields = [
      'phone',
      'address',
      'profilePicture',
      'emergencyContact',
    ];

    // Fields only admin can edit
    const adminOnlyFields = [
      'fullName',
      'email',
      'employeeId',
      'role',
      'department',
      'designation',
      'dateOfJoining',
      'employmentType',
      'reportingManager',
      'workLocation',
      'salary',
      'dateOfBirth',
      'gender',
      'isActive',
      'documents',
    ];

    // If employee, filter to allowed fields only
    let sanitizedUpdates = {};
    if (req.user.role === 'admin') {
      // Admin can update everything except password and auth tokens
      const { password, verificationToken, refreshToken, ...allowed } = updates;
      sanitizedUpdates = allowed;
    } else {
      // Employee: only allowed fields
      employeeEditableFields.forEach((field) => {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      });

      // Check if employee tried to edit restricted fields
      const attemptedRestrictedFields = Object.keys(updates).filter(
        (key) => adminOnlyFields.includes(key)
      );
      if (attemptedRestrictedFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: `You cannot edit these fields: ${attemptedRestrictedFields.join(', ')}. Contact HR.`,
        });
      }
    }

    // Update the user
    const employee = await User.findByIdAndUpdate(
      id,
      { $set: sanitizedUpdates },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -verificationTokenExpires -refreshToken');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Log activity
    await Activity.create({
      user: id,
      type: 'profile_update',
      title: 'Profile Updated',
      description: req.user.role === 'admin'
        ? `Profile updated by admin (${req.user.fullName})`
        : 'You updated your profile',
      visibility: 'self',
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email or Employee ID already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentCounts,
      recentJoinees,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { department: { $ne: '' } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName employeeId department designation createdAt profilePicture'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        // Placeholder stats (will be real in Phase 3 & 4)
        pendingLeaveRequests: 0,
        todayAttendancePercent: 0,
        departmentBreakdown: departmentCounts,
        recentJoinees,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats.',
    });
  }
};

/**
 * @desc    Get employee's own profile
 * @route   GET /api/employees/me/profile
 * @access  Private
 */
const getMyProfile = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id).select(
      '-password -verificationToken -verificationTokenExpires -refreshToken'
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  getDashboardStats,
  getMyProfile,
};
