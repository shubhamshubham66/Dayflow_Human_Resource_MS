import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Shield, Send, CheckCircle } from 'lucide-react';
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
} from '../utils/validators';
import authService from '../services/authService';

/**
 * Sign Up Page — With On-Screen OTP Verification
 * Step 1: Fill form + enter email → Click "Send OTP" → OTP shows on screen
 * Step 2: Enter OTP → Submit → Account created
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

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
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    {
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
      setGeneratedOtp(data.otp);
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      toast.success('OTP generated! Enter it below to verify.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to generate OTP';
      toast.error(msg);
      setServerError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setOtpError('');

    if (!validateAll()) return;

    // Check OTP
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
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        otp: otpInput,
      });

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

        {/* OTP Display + Input Section */}
        {otpSent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-down">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">OTP Generated!</p>
            </div>

            {/* Show OTP on screen */}
            <div className="bg-white rounded-lg p-3 text-center mb-3 border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Your verification OTP:</p>
              <p className="text-3xl font-bold text-primary-600 tracking-[0.3em] font-mono">
                {generatedOtp}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Expires in {otpTimer > 0 ? formatTimer(otpTimer) : 'expired'}
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP to verify</label>
              <input
                type="text"
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
                  ${otpInput.length === 6 && otpInput === generatedOtp ? 'border-green-400 bg-green-50' : ''}
                `}
              />
              {otpError && (
                <p className="text-xs text-red-500 mt-1">{otpError}</p>
              )}
              {otpInput.length === 6 && otpInput === generatedOtp && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> OTP verified!
                </p>
              )}
            </div>
          </div>
        )}

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
          disabled={!otpSent || otpInput.length !== 6}
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
