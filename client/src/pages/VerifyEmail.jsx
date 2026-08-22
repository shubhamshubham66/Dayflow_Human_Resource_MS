import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import authService from '../services/authService';

/**
 * Email Verification Page
 * Reads the token from URL params and verifies it via API.
 * Shows success/error state accordingly.
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const data = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Verification failed. The link may have expired.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <AuthLayout title="Email Verification">
      <div className="text-center py-6">
        {/* Loading state */}
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Email Verified!
            </h2>
            <p className="text-gray-500">{message}</p>
            <Link to="/signin">
              <Button className="mt-4">
                Continue to Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-danger-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verification Failed
            </h2>
            <p className="text-gray-500">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link to="/signin">
                <Button variant="secondary">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
