const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post(
  '/apply',
  [
    body('leaveType')
      .isIn(['paid', 'sick', 'unpaid', 'casual', 'maternity', 'paternity'])
      .withMessage('Invalid leave type'),
    body('startDate')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('Invalid end date format'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
  ],
  validate,
  applyLeave
);

router.get('/my', getMyLeaves);
router.put('/:id/cancel', cancelLeave);

// Admin routes
router.get('/all', authorize('admin'), getAllLeaves);
router.put(
  '/:id/review',
  authorize('admin'),
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be approved or rejected'),
  ],
  validate,
  reviewLeave
);

module.exports = router;
