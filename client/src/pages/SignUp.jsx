import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, IdCard, User, Mail, Lock, Shield } from 'lucide-react';
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
 * Sign Up Page
 * Fields: Employee ID, Full Name, Email, Password, Confirm Password, Role
 * Includes full client-side validation + server-side error handling
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation setup
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
      employeeId: [required('Employee ID'), minLength('Employee ID', 2), maxLength('Employee ID', 20), isValidEmployeeId()],
      fullName: [required('Full Name'), minLength('Full Name', 2), maxLength('Full Name', 100)],
      email: [required('Email'), isEmail()],
      password: [required('Password'), isStrongPassword()],
      confirmPassword: [required('Confirm Password'), matchesField('Passwords', 'password')],
      role: [required('Role')],
    }
  );

  // Role options for dropdown
  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Admin / HR' },
  ];

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    if (password.length >= 12) strength++;

    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: 'bg-danger-500' },
      { level: 2, label: 'Fair', color: 'bg-warning-500' },
      { level: 3, label: 'Good', color: 'bg-primary-500' },
      { level: 4, label: 'Strong', color: 'bg-success-500' },
    ];
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(values.password);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      await authService.register({
        employeeId: values.employeeId,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
      });

      toast.success('Registration successful! Check your email for verification.');
      navigate('/signin', {
        state: { message: 'Account created! Please verify your email before signing in.' },
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please try again.';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Dayflow and streamline your HR experience"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error alert */}
        {serverError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-600 animate-slide-down">
            {serverError}
          </div>
        )}

        {/* Employee ID */}
        <Input
          label="Employee ID"
          name="employeeId"
          placeholder="e.g., EMP-001"
          icon={IdCard}
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

        {/* Email */}
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
          {/* Password strength bar */}
          {values.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      level <= passwordStrength.level
                        ? passwordStrength.color
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.label && (
                <p className="text-xs text-gray-500 mt-1">
                  Strength: {passwordStrength.label}
                </p>
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

        {/* Role Selection */}
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
        >
          Create Account
        </Button>

        {/* Sign In link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
