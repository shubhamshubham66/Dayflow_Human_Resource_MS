const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMyActivities,
  getAdminActivities,
  markAsRead,
} = require('../controllers/activityController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/activities/my — get current user's activities
router.get('/my', getMyActivities);

// GET /api/activities/admin — admin activity feed
router.get('/admin', authorize('admin'), getAdminActivities);

// PUT /api/activities/mark-read — mark activities as read
router.put('/mark-read', markAsRead);

module.exports = router;
