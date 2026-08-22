const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  getDashboardStats,
  getMyProfile,
} = require('../controllers/employeeController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/employees/me/profile — get own profile (must be before /:id)
router.get('/me/profile', getMyProfile);

// GET /api/employees — list all employees (admin only)
router.get('/', authorize('admin'), getEmployees);

// GET /api/employees/:id — get single employee
router.get('/:id', getEmployeeById);

// PUT /api/employees/:id — update employee profile
router.put('/:id', updateEmployee);

module.exports = router;
