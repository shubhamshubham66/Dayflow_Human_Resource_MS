const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const Payroll = require('../models/Payroll');

/**
 * @desc    Seed dummy data for the logged-in user
 * @route   POST /api/seed/my-data
 * @access  Private
 */
const seedMyData = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.fullName;

    // ============================================
    // 1. SEED ATTENDANCE (Last 30 days)
    // ============================================
    const attendanceRecords = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayOfWeek = date.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Random status distribution: 70% present, 10% half-day, 10% absent, 10% leave
      const rand = Math.random();
      let status, checkInTime, checkOutTime, totalHours;

      if (rand < 0.70) {
        status = 'present';
        const inHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
        const inMin = Math.floor(Math.random() * 60);
        checkInTime = new Date(date);
        checkInTime.setHours(inHour, inMin, 0);

        const outHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const outMin = Math.floor(Math.random() * 60);
        checkOutTime = new Date(date);
        checkOutTime.setHours(outHour, outMin, 0);

        totalHours = Math.round(((checkOutTime - checkInTime) / (1000 * 60 * 60)) * 100) / 100;
      } else if (rand < 0.80) {
        status = 'half-day';
        const inHour = 9 + Math.floor(Math.random() * 2);
        checkInTime = new Date(date);
        checkInTime.setHours(inHour, Math.floor(Math.random() * 60), 0);

        checkOutTime = new Date(date);
        checkOutTime.setHours(13, Math.floor(Math.random() * 60), 0);

        totalHours = Math.round(((checkOutTime - checkInTime) / (1000 * 60 * 60)) * 100) / 100;
      } else if (rand < 0.90) {
        status = 'absent';
        checkInTime = null;
        checkOutTime = null;
        totalHours = 0;
      } else {
        status = 'leave';
        checkInTime = null;
        checkOutTime = null;
        totalHours = 0;
      }

      attendanceRecords.push({
        employee: userId,
        date,
        checkIn: { time: checkInTime, ip: '192.168.1.1' },
        checkOut: { time: checkOutTime, ip: '192.168.1.1' },
        status,
        totalHours,
      });
    }

    // Delete old attendance and insert new
    await Attendance.deleteMany({ employee: userId });
    await Attendance.insertMany(attendanceRecords);

    // ============================================
    // 2. SEED LEAVE REQUESTS (6 requests)
    // ============================================
    const leaveTypes = ['paid', 'sick', 'casual', 'unpaid', 'paid', 'sick'];
    const leaveStatuses = ['approved', 'approved', 'pending', 'rejected', 'approved', 'pending'];
    const leaveReasons = [
      'Family vacation planned for the week',
      'Not feeling well, need rest for 2 days',
      'Personal work - bank and documentation',
      'Travel plans for cousin wedding',
      'Annual leave - recharging for next quarter',
      'Doctor appointment and follow-up tests',
    ];

    const leaveRecords = [];
    for (let i = 0; i < 6; i++) {
      const startOffset = 5 + i * 8; // Spread across last 2 months
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - startOffset);
      const duration = 1 + Math.floor(Math.random() * 3); // 1-3 days
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration - 1);

      leaveRecords.push({
        employee: userId,
        leaveType: leaveTypes[i],
        startDate,
        endDate,
        totalDays: duration,
        reason: leaveReasons[i],
        status: leaveStatuses[i],
        reviewedBy: leaveStatuses[i] !== 'pending' ? userId : null,
        reviewedAt: leaveStatuses[i] !== 'pending' ? new Date() : null,
        adminComment: leaveStatuses[i] === 'approved' ? 'Approved. Enjoy!' :
                      leaveStatuses[i] === 'rejected' ? 'Team needs coverage this week.' : '',
      });
    }

    await Leave.deleteMany({ employee: userId });
    await Leave.insertMany(leaveRecords);

    // ============================================
    // 3. SEED PAYROLL (Last 6 months)
    // ============================================
    const payrollRecords = [];
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = now.getFullYear();
      const actualMonth = ((month % 12) + 12) % 12 + 1;
      const actualYear = year + Math.floor(month / 12);

      const basic = 5000 + Math.floor(Math.random() * 2000);
      const hra = Math.floor(basic * 0.4);
      const allowances = 800 + Math.floor(Math.random() * 400);
      const bonus = i === 0 ? 500 : 0;
      const tax = Math.floor(basic * 0.1);
      const insurance = 200;
      const pf = Math.floor(basic * 0.12);

      const gross = basic + hra + allowances + bonus;
      const deductions = tax + insurance + pf;

      payrollRecords.push({
        employee: userId,
        month: actualMonth,
        year: actualYear,
        earnings: { basic, hra, allowances, bonus, overtime: 0 },
        deductions: { tax, insurance, providentFund: pf, other: 0 },
        grossSalary: gross,
        totalDeductions: deductions,
        netSalary: gross - deductions,
        currency: 'USD',
        status: i > 0 ? 'paid' : 'generated',
        paidOn: i > 0 ? new Date(actualYear, actualMonth - 1, 28) : null,
        workingDays: { total: 22, present: 18 + Math.floor(Math.random() * 4), absent: Math.floor(Math.random() * 3), leaves: Math.floor(Math.random() * 2) },
      });
    }

    await Payroll.deleteMany({ employee: userId });
    await Payroll.insertMany(payrollRecords);

    // ============================================
    // 4. SEED NOTIFICATIONS
    // ============================================
    const notifications = [
      { type: 'welcome', title: 'Welcome to Dayflow!', message: 'Your account has been created successfully. Explore your dashboard.' },
      { type: 'leave_approved', title: 'Leave Approved', message: 'Your leave request (3 days) has been approved by HR.' },
      { type: 'payroll_generated', title: 'Salary Slip Ready', message: `Your salary slip for this month is now available.` },
      { type: 'attendance_reminder', title: 'Attendance Reminder', message: 'Don\'t forget to check in today!' },
      { type: 'leave_rejected', title: 'Leave Request Rejected', message: 'Your leave request was rejected. Reason: Team needs coverage.' },
      { type: 'profile_update', title: 'Profile Updated', message: 'Your profile information was updated successfully.' },
    ];

    await Notification.deleteMany({ recipient: userId });
    await Notification.insertMany(
      notifications.map((n, i) => ({
        ...n,
        recipient: userId,
        isRead: i > 2, // First 3 unread
        createdAt: new Date(Date.now() - i * 3600000 * (i + 1)), // Spread over hours
      }))
    );

    // ============================================
    // 5. UPDATE USER PROFILE with dummy data
    // ============================================
    await User.findByIdAndUpdate(userId, {
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      dateOfJoining: new Date('2023-03-15'),
      employmentType: 'full-time',
      reportingManager: 'Sarah Johnson',
      workLocation: 'Remote',
      gender: 'male',
      dateOfBirth: new Date('1995-06-20'),
      address: {
        street: '123 Tech Park Avenue',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94102',
        country: 'United States',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543',
      },
      salary: {
        basic: 6000,
        hra: 2400,
        allowances: 1000,
        deductions: 1200,
        netSalary: 8200,
        currency: 'USD',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Dummy data seeded successfully! Refresh the page to see data.',
      summary: {
        attendance: `${attendanceRecords.length} days`,
        leaves: `${leaveRecords.length} requests`,
        payroll: `${payrollRecords.length} months`,
        notifications: `${notifications.length} notifications`,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Failed to seed data.' });
  }
};

module.exports = { seedMyData };
