const express = require('express');
const { authenticate } = require('../middleware/auth');
const { seedMyData } = require('../controllers/seedController');

const router = express.Router();
router.use(authenticate);

// POST /api/seed/my-data — seed dummy data for current user
router.post('/my-data', seedMyData);

module.exports = router;
