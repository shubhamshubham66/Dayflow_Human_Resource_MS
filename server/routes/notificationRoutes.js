const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getMyNotifications, markAsRead, getUnreadCount } = require('../controllers/notificationController');

const router = express.Router();
router.use(authenticate);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-read', markAsRead);

module.exports = router;
