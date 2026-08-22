import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/LoadingSpinner';

/**
 * Protected Route wrapper.
 * - Redirects unauthenticated users to /signin
 * - Optionally restricts by role (admin-only routes, etc.)
 * - Shows loading spinner while auth state is being determined
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Still checking auth state - show loader
  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Not authenticated - redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Role check - if allowedRoles specified, verify user has correct role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their correct dashboard
    const redirectPath = user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
