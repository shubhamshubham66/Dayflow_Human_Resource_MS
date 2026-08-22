const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  verifyEmail,
  refreshToken,
  getMe,
  logout,
  resendVerification,
  sendOtp,
} = require('../controllers/authController');

const router = express.Router();

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least 1 number
 * - At least 1 special character
 */
const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/\d/)
  .withMessage('Password must contain at least 1 number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least 1 special character');

// POST /api/auth/send-otp (generate OTP for email)
router.post(
  '/send-otp',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
  ],
  validate,
  sendOtp
);

// POST /api/auth/register
router.post(
  '/register',
  [
    body('employeeId')
      .trim()
      .notEmpty()
      .withMessage('Employee ID is required')
      .isLength({ min: 2, max: 20 })
      .withMessage('Employee ID must be 2-20 characters'),
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    passwordValidation,
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    body('role')
      .optional()
      .isIn(['employee', 'admin'])
      .withMessage('Role must be either employee or admin'),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/verify-email?token=xxx
router.get(
  '/verify-email',
  [
    query('token')
      .notEmpty()
      .withMessage('Verification token is required'),
  ],
  validate,
  verifyEmail
);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// GET /api/auth/me (protected)
router.get('/me', authenticate, getMe);

// POST /api/auth/logout (protected)
router.post('/logout', authenticate, logout);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
  ],
  validate,
  resendVerification
);

module.exports = router;
