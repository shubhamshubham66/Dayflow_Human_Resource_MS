const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Get my salary slips
 * @route   GET /api/payroll/my?year=2024
 * @access  Private
 */
const getMyPayroll = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { employee: req.user._id };

    if (year) {
      filter.year = parseInt(year);
    }

    const payrolls = await Payroll.find(filter)
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll data.' });
  }
};

/**
 * @desc    Get single salary slip
 * @route   GET /api/payroll/slip/:id
 * @access  Private
 */
const getPayrollSlip = async (req, res) => {
  try {
    const slip = await Payroll.findById(req.params.id)
      .populate('employee', 'fullName employeeId email department designation dateOfJoining');

    if (!slip) {
      return res.status(404).json({ success: false, message: 'Salary slip not found.' });
    }

    // Employees can only view their own
    if (req.user.role !== 'admin' && slip.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: slip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary slip.' });
  }
};

/**
 * @desc    Get all payroll records (admin)
 * @route   GET /api/payroll/all?month=3&year=2024&status=generated
 * @access  Private/Admin
 */
const getAllPayroll = async (req, res) => {
  try {
    const { month, year, status, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let payrolls = await Payroll.find(filter)
      .populate('employee', 'fullName employeeId email department designation profilePicture')
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let total = await Payroll.countDocuments(filter);

    // Post-populate search
    if (search) {
      const s = search.toLowerCase();
      payrolls = payrolls.filter(
        (p) => p.employee &&
          (p.employee.fullName.toLowerCase().includes(s) ||
           p.employee.employeeId.toLowerCase().includes(s))
      );
      total = payrolls.length;
    }

    // Total payroll amount for period
    const aggregation = await Payroll.aggregate([
      { $match: filter },
      { $group: { _id: null, totalNet: { $sum: '$netSalary' }, totalGross: { $sum: '$grossSalary' } } },
    ]);

    res.status(200).json({
      success: true,
      data: payrolls,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
      totals: aggregation[0] || { totalNet: 0, totalGross: 0 },
    });
  } catch (error) {
    console.error('Get all payroll error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll records.' });
  }
};

/**
 * @desc    Generate/update payroll for an employee
 * @route   POST /api/payroll/generate
 * @access  Private/Admin
 */
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, earnings, deductions, currency, notes, workingDays } = req.body;

    // Validate employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Calculate totals
    const grossSalary = Object.values(earnings || {}).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const netSalary = grossSalary - totalDeductions;

    if (netSalary < 0) {
      return res.status(400).json({ success: false, message: 'Net salary cannot be negative. Check deductions.' });
    }

    // Upsert payroll record
    const payroll = await Payroll.findOneAndUpdate(
      { employee: employeeId, month: parseInt(month), year: parseInt(year) },
      {
        employee: employeeId,
        month: parseInt(month),
        year: parseInt(year),
        earnings,
        deductions,
        grossSalary,
        totalDeductions,
        netSalary,
        currency: currency || 'USD',
        status: 'generated',
        generatedBy: req.user._id,
        notes: notes || '',
        workingDays: workingDays || { total: 22, present: 0, absent: 0, leaves: 0 },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Notify employee
    await Notification.create({
      recipient: employeeId,
      type: 'payroll_generated',
      title: 'Salary Slip Generated',
      message: `Your salary slip for ${getMonthName(month)} ${year} has been generated.`,
      link: '/payroll',
    });

    res.status(200).json({
      success: true,
      message: 'Payroll generated successfully.',
      data: payroll,
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Payroll already exists for this period.' });
    }
    res.status(500).json({ success: false, message: 'Failed to generate payroll.' });
  }
};

/**
 * @desc    Update payroll status (mark as paid)
 * @route   PUT /api/payroll/:id/status
 * @access  Private/Admin
 */
const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status, paidOn: status === 'paid' ? new Date() : null },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

// Helper: month name
const getMonthName = (month) => {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[parseInt(month)] || '';
};

module.exports = { getMyPayroll, getPayrollSlip, getAllPayroll, generatePayroll, updatePayrollStatus };
