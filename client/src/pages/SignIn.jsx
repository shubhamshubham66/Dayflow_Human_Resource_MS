import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import useFormValidation from '../hooks/useFormValidation';
import { required, isEmail } from '../utils/validators';

/**
 * Sign In Page
 * Email + Password with clear error messages.
 * Redirects based on role after successful login.
 */
const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Check for redirect message (from signup)
  const redirectMessage = location.state?.message;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
  } = useFormValidation(
    { email: '', password: '' },
    {
      email: [required('Email'), isEmail()],
      password: [required('Password')],
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      const data = await login({
        email: values.email,
        password: values.password,
      });

      toast.success(`Welcome back, ${data.user.fullName}!`);

      // Role-based redirect
      const redirectTo = data.user.role === 'admin'
        ? '/admin-dashboard'
        : '/employee-dashboard';

      // Check if there's a saved location to redirect back to
      const from = location.state?.from?.pathname;
      navigate(from || redirectTo, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Sign in failed. Please try again.';
      const code = error.response?.data?.code;

      setServerError(message);

      // Special handling for unverified email
      if (code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first. Check your inbox.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Dayflow account"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Success message from signup redirect */}
        {redirectMessage && (
          <div className="p-3 bg-success-50 border border-green-200 rounded-lg text-sm text-green-700 animate-slide-down">
            {redirectMessage}
          </div>
        )}

        {/* Server error alert */}
        {serverError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-600 animate-slide-down">
            {serverError}
          </div>
        )}

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
          autoComplete="email"
        />

        {/* Password */}
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          autoComplete="current-password"
        />

        {/* Forgot password link (placeholder) */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          icon={LogIn}
        >
          Sign In
        </Button>

        {/* Sign Up link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
