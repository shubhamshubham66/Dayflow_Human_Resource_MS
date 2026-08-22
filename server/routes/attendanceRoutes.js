const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
} = require('../controllers/attendanceController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my', getMyAttendance);

// Admin routes
router.get('/all', authorize('admin'), getAllAttendance);
router.post('/mark', authorize('admin'), markAttendance);

module.exports = router;
