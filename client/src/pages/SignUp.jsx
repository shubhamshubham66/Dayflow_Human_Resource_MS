import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Hash, User, Mail, Lock, Send, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useFormValidation from '../hooks/useFormValidation';
import {
  required,
  minLength,
  maxLength,
  isEmail,
  isStrongPassword,
  matchesField,
} from '../utils/validators';
import authService from '../services/authService';

/**
 * Sign Up Page — step by step
 * 1. Employee ID, Full Name, Email → "Send OTP" (code arrives by email)
 * 2. Enter OTP → "Verify"
 * 3. Password + Confirm Password → "Create Account"
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // only set in dev when the server has no email configured
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailToken, setEmailToken] = useState(''); // proof from the server that the email is verified
  const emailVerified = !!emailToken;

  // Resend countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    {
      employeeId: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    {
      employeeId: [required('Employee ID'), minLength('Employee ID', 2), maxLength('Employee ID', 20)],
      fullName: [required('Full Name'), minLength('Full Name', 2), maxLength('Full Name', 100)],
      email: [required('Email'), isEmail()],
      password: [required('Password'), isStrongPassword()],
      confirmPassword: [required('Confirm Password'), matchesField('Passwords', 'password')],
    }
  );

  // Editing the email after sending an OTP starts verification over
  const handleEmailChange = (e) => {
    handleChange(e);
    if (otpSent || emailVerified) {
      setOtpSent(false);
      setEmailToken('');
      setOtpInput('');
      setDevOtp('');
      setOtpError('');
    }
  };

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

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: send OTP
  const handleSendOtp = async () => {
    setServerError('');
    if (!values.employeeId.trim() || !values.fullName.trim()) {
      toast.error('Please fill Employee ID and Full Name first.');
      return;
    }
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
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      if (error.response?.data?.retryAfter) setOtpTimer(error.response.data.retryAfter);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const data = await authService.verifyOtp(values.email, otpInput);
      setEmailToken(data.emailToken);
      setDevOtp('');
      setOtpTimer(0);
      toast.success('Email verified! Now set your password.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not verify OTP. Please try again.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: create account
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!emailVerified) {
      toast.error('Please verify your email first.');
      return;
    }
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      await authService.register({
        employeeId: values.employeeId,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        emailToken,
      });
      toast.success('Account created successfully!');
      navigate('/signin', { state: { message: 'Account created! You can now sign in.' } });
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.errors?.[0]?.message || data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join Dayflow and streamline your HR experience">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-down">
            {serverError}
          </div>
        )}

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

        {/* Email + Send OTP */}
        <div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@company.com"
            icon={Mail}
            value={values.email}
            onChange={handleEmailChange}
            onBlur={handleBlur}
            disabled={emailVerified}
            error={touched.email ? errors.email : ''}
          />

          {emailVerified ? (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4" /> Email verified
            </p>
          ) : (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpTimer > 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingOtp
                  ? 'Sending...'
                  : otpTimer > 0
                    ? `Resend in ${formatTimer(otpTimer)}`
                    : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          )}
        </div>

        {/* OTP entry + Verify */}
        {otpSent && !emailVerified && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-down">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">OTP sent to {values.email}</p>
            </div>

            {devOtp && (
              <div className="bg-white rounded-lg p-3 text-center mb-3 border border-amber-200">
                <p className="text-xs text-amber-600 mb-1">Dev mode (email not configured) — your OTP:</p>
                <p className="text-2xl font-bold text-primary-600 tracking-[0.3em] font-mono">{devOtp}</p>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter email OTP</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyOtp();
                  }
                }}
                placeholder="6-digit OTP"
                maxLength={6}
                className={`flex-1 min-w-0 px-4 py-2.5 border rounded-lg text-center text-lg font-mono font-bold tracking-[0.2em]
                  focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all
                  ${otpError ? 'border-red-400' : 'border-gray-200'}`}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpInput.length !== 6}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                {verifyingOtp ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
            <p className="text-xs text-gray-400 mt-1">Didn't get it? Check spam, or resend after the timer.</p>
          </div>
        )}

        {/* Password — shown only after the email is verified */}
        {emailVerified && (
          <div className="space-y-5 animate-slide-down">
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
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          icon={UserPlus}
          className="mt-6"
          disabled={!emailVerified}
        >
          Create Account
        </Button>

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
