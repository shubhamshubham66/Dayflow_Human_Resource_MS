import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Hash, User, Mail, Lock, Shield, Send, CheckCircle, Smartphone } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import useFormValidation from '../hooks/useFormValidation';
import {
  required,
  minLength,
  maxLength,
  isEmail,
  isStrongPassword,
  matchesField,
  isValidEmployeeId,
} from '../utils/validators';
import authService from '../services/authService';

/**
 * Sign Up Page — Email OTP + Mobile OTP verification
 * 1. Email: "Send OTP" → 6-digit code arrives by email → enter it
 * 2. Mobile: "Send OTP" → SMS via Firebase → enter code → "Verify"
 * 3. Submit → backend checks the email OTP and the Firebase phone token
 */

// Friendly messages for common Firebase phone-auth errors
const firebaseErrorMessage = (error) => {
  const map = {
    'auth/invalid-phone-number': 'Invalid mobile number.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/quota-exceeded': 'SMS limit reached for today. Please try again tomorrow.',
    'auth/invalid-verification-code': 'Wrong OTP. Please check and try again.',
    'auth/code-expired': 'OTP expired. Please request a new one.',
    'auth/captcha-check-failed': 'Captcha check failed. Please refresh and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
  };
  return map[error?.code] || error?.message || 'Mobile verification failed.';
};
const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // only set in dev when email isn't configured
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Phone OTP State
  const [phone, setPhone] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Email OTP resend countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Phone OTP resend countdown
  useEffect(() => {
    if (phoneTimer > 0) {
      const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phoneTimer]);

  // Clean up invisible reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  // Form validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
  } = useFormValidation(
    {
      employeeId: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    {
      employeeId: [required('Employee ID'), minLength('Employee ID', 2), maxLength('Employee ID', 20)],
      fullName: [required('Full Name'), minLength('Full Name', 2), maxLength('Full Name', 100)],
      email: [required('Email'), isEmail()],
      password: [required('Password'), isStrongPassword()],
      confirmPassword: [required('Confirm Password'), matchesField('Passwords', 'password')],
      role: [required('Role')],
    }
  );

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Admin / HR' },
  ];

  // Password strength
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    if (password.length >= 12) strength++;
    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-amber-500' },
      { level: 3, label: 'Good', color: 'bg-primary-500' },
      { level: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(values.password);

  // Send OTP handler
  const handleSendOtp = async () => {
    // Validate email first
    if (!values.email || !/^\S+@\S+\.\S+$/.test(values.email)) {
      toast.error('Please enter a valid email address first.');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      const data = await authService.sendOtp(values.email);
      setDevOtp(data.devOtp || '');
      setOtpSent(true);
      setOtpInput('');
      setOtpTimer(data.resendIn || 60);
      toast.success(data.devOtp ? 'Dev mode: OTP shown below.' : 'OTP sent! Check your email inbox.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send OTP';
      if (error.response?.data?.retryAfter) setOtpTimer(error.response.data.retryAfter);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Send mobile OTP via Firebase
  const handleSendPhoneOtp = async () => {
    setPhoneError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSendingPhoneOtp(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      confirmationRef.current = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaRef.current);
      setPhoneOtpSent(true);
      setPhoneOtp('');
      setPhoneTimer(60);
      toast.success(`OTP sent to +91 ${phone}`);
    } catch (error) {
      console.error('Phone OTP error:', error);
      const msg = firebaseErrorMessage(error);
      setPhoneError(msg);
      toast.error(msg);
      // reCAPTCHA can't be reused after an error — reset it
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  // Verify mobile OTP and get a Firebase ID token for the backend
  const handleVerifyPhoneOtp = async () => {
    setPhoneError('');
    if (phoneOtp.length !== 6) {
      setPhoneError('OTP must be 6 digits');
      return;
    }
    setVerifyingPhoneOtp(true);
    try {
      const result = await confirmationRef.current.confirm(phoneOtp);
      const token = await result.user.getIdToken();
      setFirebaseIdToken(token);
      setPhoneVerified(true);
      setPhoneTimer(0);
      toast.success('Mobile number verified!');
    } catch (error) {
      const msg = firebaseErrorMessage(error);
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setOtpError('');

    if (!validateAll()) return;

    if (!phoneVerified || !firebaseIdToken) {
      setPhoneError('Please verify your mobile number first.');
      toast.error('Please verify your mobile number first.');
      return;
    }

    // Check email OTP
    if (!otpSent) {
      toast.error('Please send OTP first by clicking "Send OTP".');
      return;
    }
    if (!otpInput) {
      setOtpError('Please enter the OTP');
      return;
    }
    if (otpInput.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register({
        employeeId: values.employeeId,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        otp: otpInput,
        firebaseIdToken,
      });

      // Phone is saved in our DB now — end the temporary Firebase session
      signOut(auth).catch(() => {});

      toast.success('Account created successfully!');
      navigate('/signin', {
        state: { message: 'Account created! You can now sign in.' },
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timer
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Dayflow and streamline your HR experience"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-down">
            {serverError}
          </div>
        )}

        {/* Employee ID */}
        <Input
          label="Employee ID"
          name="employeeId"
          placeholder="e.g., EMP-001"
          icon={Hash}
          value={values.employeeId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.employeeId ? errors.employeeId : ''}
        />

        {/* Full Name */}
        <Input
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          icon={User}
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.fullName ? errors.fullName : ''}
        />

        {/* Email + Send OTP button */}
        <div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@company.com"
            icon={Mail}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || (otpTimer > 0)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {sendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend in ${formatTimer(otpTimer)}` : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
        </div>

        {/* Email OTP Input */}
        {otpSent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-down">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                OTP sent to {values.email}
              </p>
            </div>

            {/* Dev-only fallback when the server has no email credentials */}
            {devOtp && (
              <div className="bg-white rounded-lg p-3 text-center mb-3 border border-amber-200">
                <p className="text-xs text-amber-600 mb-1">Dev mode (email not configured) — your OTP:</p>
                <p className="text-2xl font-bold text-primary-600 tracking-[0.3em] font-mono">{devOtp}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter email OTP</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpInput(val);
                  setOtpError('');
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono font-bold tracking-[0.2em]
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all
                  ${otpError ? 'border-red-400' : 'border-gray-200'}
                `}
              />
              {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
              <p className="text-xs text-gray-400 mt-1">Didn't get it? Check spam, or resend after the timer.</p>
            </div>
          </div>
        )}

        {/* Mobile Number + Firebase OTP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
              <Smartphone className="w-4 h-4 text-gray-400" />
              +91
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              disabled={phoneVerified}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                setPhoneError('');
              }}
              placeholder="9876543210"
              maxLength={10}
              className={`flex-1 min-w-0 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all disabled:bg-green-50
                ${phoneError ? 'border-red-400' : phoneVerified ? 'border-green-400' : 'border-gray-200'}`}
            />
          </div>

          {phoneVerified ? (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Mobile number verified
            </p>
          ) : (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={sendingPhoneOtp || phoneTimer > 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingPhoneOtp
                  ? 'Sending...'
                  : phoneTimer > 0
                    ? `Resend in ${formatTimer(phoneTimer)}`
                    : phoneOtpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          )}

          {phoneOtpSent && !phoneVerified && (
            <div className="mt-3 flex gap-2 animate-slide-down">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={phoneOtp}
                onChange={(e) => {
                  setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setPhoneError('');
                }}
                placeholder="SMS OTP"
                maxLength={6}
                className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-lg text-center font-mono font-bold tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleVerifyPhoneOtp}
                disabled={verifyingPhoneOtp || phoneOtp.length !== 6}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingPhoneOtp ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}

          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}

          {/* Invisible reCAPTCHA required by Firebase phone auth */}
          <div id="recaptcha-container" />
        </div>

        {/* Password */}
        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min 8 chars, 1 number, 1 special char"
            icon={Lock}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
          />
          {values.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.label && (
                <p className="text-xs text-gray-500 mt-1">Strength: {passwordStrength.label}</p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          icon={Lock}
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
        />

        {/* Role */}
        <Select
          label="Role"
          name="role"
          icon={Shield}
          options={roleOptions}
          placeholder="Select your role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.role ? errors.role : ''}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          icon={UserPlus}
          className="mt-6"
          disabled={!otpSent || otpInput.length !== 6 || !phoneVerified}
        >
          Create Account
        </Button>

        {/* Sign In link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary-500 font-medium hover:text-primary-600 transition-colors">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
