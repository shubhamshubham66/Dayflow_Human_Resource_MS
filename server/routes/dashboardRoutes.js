const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/employeeController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats — admin dashboard statistics
router.get('/stats', authorize('admin'), getDashboardStats);

module.exports = router;
