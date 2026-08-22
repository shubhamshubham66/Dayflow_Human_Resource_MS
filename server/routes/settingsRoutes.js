const express = require('express');
const { authenticate } = require('../middleware/auth');
const { changePassword, updateNotificationPreferences } = require('../controllers/settingsController');

const router = express.Router();
router.use(authenticate);

router.put('/change-password', changePassword);
router.put('/notification-preferences', updateNotificationPreferences);

module.exports = router;
