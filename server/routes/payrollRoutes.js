const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getMyPayroll, getPayrollSlip, getAllPayroll, generatePayroll, updatePayrollStatus } = require('../controllers/payrollController');

const router = express.Router();
router.use(authenticate);

// Employee
router.get('/my', getMyPayroll);
router.get('/slip/:id', getPayrollSlip);

// Admin
router.get('/all', authorize('admin'), getAllPayroll);
router.post('/generate', authorize('admin'), generatePayroll);
router.put('/:id/status', authorize('admin'), updatePayrollStatus);

module.exports = router;
