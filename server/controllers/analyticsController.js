const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Payroll = require('../models/Payroll');

/**
 * @desc    Get attendance trends (last 6 months)
 * @route   GET /api/analytics/attendance-trends
 * @access  Private/Admin
 */
const getAttendanceTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trends = await Attendance.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format for frontend chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = trends.map((t) => ({
      month: `${months[t._id.month - 1]} ${t._id.year}`,
      present: t.present,
      absent: t.absent,
      halfDay: t.halfDay,
      leave: t.leave,
      attendanceRate: t.total > 0 ? Math.round((t.present / t.total) * 100) : 0,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Attendance trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends.' });
  }
};

/**
 * @desc    Get leave type distribution
 * @route   GET /api/analytics/leave-distribution
 * @access  Private/Admin
 */
const getLeaveDistribution = async (req, res) => {
  try {
    const { year } = req.query;
    const matchYear = year ? parseInt(year) : new Date().getFullYear();

    const distribution = await Leave.aggregate([
      {
        $match: {
          status: 'approved',
          startDate: {
            $gte: new Date(matchYear, 0, 1),
            $lte: new Date(matchYear, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const labels = { paid: 'Paid Leave', sick: 'Sick Leave', unpaid: 'Unpaid Leave', casual: 'Casual Leave', maternity: 'Maternity', paternity: 'Paternity' };
    const colors = { paid: '#2f5597', sick: '#ef4444', unpaid: '#6b7280', casual: '#f59e0b', maternity: '#8b5cf6', paternity: '#06b6d4' };

    const formatted = distribution.map((d) => ({
      name: labels[d._id] || d._id,
      value: d.count,
      totalDays: d.totalDays,
      color: colors[d._id] || '#9ca3af',
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Leave distribution error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distribution.' });
  }
};

/**
 * @desc    Get department-wise headcount
 * @route   GET /api/analytics/department-headcount
 * @access  Private/Admin
 */
const getDepartmentHeadcount = async (req, res) => {
  try {
    const headcount = await User.aggregate([
      { $match: { isActive: true, department: { $ne: '' } } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          employees: { $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const colors = ['#2f5597', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
    const formatted = headcount.map((d, i) => ({
      department: d._id,
      total: d.count,
      admins: d.admins,
      employees: d.employees,
      color: colors[i % colors.length],
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Department headcount error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch headcount.' });
  }
};

/**
 * @desc    Get payroll summary for analytics
 * @route   GET /api/analytics/payroll-summary
 * @access  Private/Admin
 */
const getPayrollSummary = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const summary = await Payroll.aggregate([
      {
        $match: {
          $or: [
            { year: { $gt: sixMonthsAgo.getFullYear() } },
            { year: sixMonthsAgo.getFullYear(), month: { $gte: sixMonthsAgo.getMonth() + 1 } },
          ],
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalGross: { $sum: '$grossSalary' },
          totalNet: { $sum: '$netSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = summary.map((s) => ({
      month: `${months[s._id.month - 1]} ${s._id.year}`,
      gross: s.totalGross,
      net: s.totalNet,
      deductions: s.totalDeductions,
      employees: s.count,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payroll summary.' });
  }
};

module.exports = { getAttendanceTrends, getLeaveDistribution, getDepartmentHeadcount, getPayrollSummary };
