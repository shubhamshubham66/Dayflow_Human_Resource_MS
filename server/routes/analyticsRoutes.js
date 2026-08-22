const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAttendanceTrends, getLeaveDistribution, getDepartmentHeadcount, getPayrollSummary } = require('../controllers/analyticsController');

const router = express.Router();
router.use(authenticate);
router.use(authorize('admin'));

router.get('/attendance-trends', getAttendanceTrends);
router.get('/leave-distribution', getLeaveDistribution);
router.get('/department-headcount', getDepartmentHeadcount);
router.get('/payroll-summary', getPayrollSummary);

module.exports = router;
