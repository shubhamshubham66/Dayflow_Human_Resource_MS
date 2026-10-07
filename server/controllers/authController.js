const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/sendEmail');
const { verifyPhoneToken } = require('../utils/firebaseAdmin');

// ============================================
// EMAIL OTP SETTINGS
// ============================================
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP, save its hash and email it.
 * Shared by /send-otp and /resend-verification.
 */
const issueEmailOtp = async (email, res) => {
  const normalizedEmail = email.toLowerCase();

  // Resend cooldown
  const existing = await Otp.findOne({ email: normalizedEmail });
  if (existing && existing.lastSentAt) {
    const secondsSince = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince);
      return res.status(429).json({
        success: false,
        message: `Please wait ${wait}s before requesting a new OTP.`,
        retryAfter: wait,
      });
    }
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await Otp.hashOtp(otp);

  await Otp.findOneAndUpdate(
    { email: normalizedEmail },
    {
      otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      lastSentAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sent = await sendOtpEmail(normalizedEmail, otp, OTP_EXPIRY_MINUTES);
  const isDev = process.env.NODE_ENV !== 'production';

  if (!sent && !isDev) {
    await Otp.deleteOne({ email: normalizedEmail });
    return res.status(500).json({ success: false, message: 'Could not send OTP email. Please try again.' });
  }

  if (isDev) console.log(`📧 [dev] OTP for ${normalizedEmail}: ${otp}`);

  return res.status(200).json({
    success: true,
    message: sent ? `OTP sent to ${normalizedEmail}.` : 'Email not configured — dev OTP returned.',
    expiresIn: OTP_EXPIRY_MINUTES * 60,
    resendIn: OTP_RESEND_COOLDOWN_SECONDS,
    // Only in development AND only when email could not be sent
    ...(isDev && !sent ? { devOtp: otp } : {}),
  });
};

/**
 * Check an email OTP. Returns null if valid, or an error message.
 * Deletes the OTP on success or after too many wrong attempts.
 */
const checkEmailOtp = async (email, otp) => {
  const record = await Otp.findOne({ email: email.toLowerCase() });
  if (!record) return 'OTP not found. Please request a new OTP first.';
  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return 'OTP has expired. Please request a new one.';
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await record.deleteOne();
    return 'Too many wrong attempts. Please request a new OTP.';
  }
  const ok = await record.compareOtp(otp);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    const left = OTP_MAX_ATTEMPTS - record.attempts;
    return `Invalid OTP. ${left} attempt${left === 1 ? '' : 's'} left.`;
  }
  await record.deleteOne();
  return null;
};

/**
 * @desc    Send OTP to email for verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }

    return await issueEmailOtp(email, res);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

/**
 * @desc    Verify the email OTP and return a short-lived "email verified" token
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpError = await checkEmailOtp(email, otp);
    if (otpError) {
      return res.status(400).json({ success: false, message: otpError });
    }
    const emailToken = jwt.sign(
      { email: email.toLowerCase(), purpose: 'email-verified' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );
    res.status(200).json({ success: true, message: 'Email verified successfully.', emailToken });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
};

/**
 * @desc    Register a new user (email must be verified first via /verify-otp)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { employeeId, fullName, email, password, role, otp, emailToken, firebaseIdToken } = req.body;

    // 1. Optional: mobile number verified with Firebase (currently disabled in the UI)
    let verifiedPhone = '';
    if (firebaseIdToken) {
      try {
        verifiedPhone = await verifyPhoneToken(firebaseIdToken);
      } catch (err) {
        console.error('Phone token verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Mobile number verification failed or expired. Please verify your number again.',
        });
      }
      const phoneTaken = await User.findOne({ phone: verifiedPhone });
      if (phoneTaken) {
        return res.status(409).json({ success: false, message: 'This mobile number is already registered.' });
      }
    }

    // 2. Email verification: prefer the token from /verify-otp, fall back to a raw OTP
    if (emailToken) {
      try {
        const decoded = jwt.verify(emailToken, process.env.JWT_SECRET);
        if (decoded.purpose !== 'email-verified' || decoded.email !== email.toLowerCase()) {
          throw new Error('Token does not match this email');
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Email verification expired or invalid. Please verify your email again.',
        });
      }
    } else if (otp) {
      const otpError = await checkEmailOtp(email, otp);
      if (otpError) {
        return res.status(400).json({ success: false, message: otpError });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please verify your email first.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId: employeeId.toUpperCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'Employee ID';
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    // Create user (verified since OTP was validated)
    const user = new User({
      employeeId: employeeId.toUpperCase(),
      fullName,
      email,
      password,
      role: role || 'employee',
      phone: verifiedPhone,
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: !!verifiedPhone,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now sign in.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Registration error:', error.message || error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or Employee ID already exists.',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact HR.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/auth/verify-email?token=xxx
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
    }
    res.status(500).json({ success: false, message: 'Token refresh failed.' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    return await issueEmailOtp(email, res);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  refreshToken,
  getMe,
  logout,
  resendVerification,
  sendOtp,
  verifyOtp,
};
