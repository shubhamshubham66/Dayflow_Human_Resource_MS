import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';

/**
 * App Root - Defines all routes and access control.
 * - Public routes: Landing, SignIn, SignUp, VerifyEmail
 * - Protected routes: Dashboards (role-based)
 */
const App = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show full-page loader during initial auth check
  if (isLoading) {
    return <PageLoader message="Loading Dayflow..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'}
              replace
            />
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/signin"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'}
              replace
            />
          ) : (
            <SignIn />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'}
              replace
            />
          ) : (
            <SignUp />
          )
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Routes - Employee */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
