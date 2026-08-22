import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/LoadingSpinner';

// Pages - Public
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';

// Pages - Employee
import EmployeeDashboard from './pages/EmployeeDashboard';

// Pages - Admin
import AdminDashboard from './pages/AdminDashboard';

// Pages - Shared (role-aware)
import Profile from './pages/Profile';
import EmployeeDetail from './pages/EmployeeDetail';

/**
 * App Root - Defines all routes and access control.
 * Phase 2: Added profile, employee detail, and shared routes.
 *
 * Route Access:
 * - Public: Landing, SignIn, SignUp, VerifyEmail
 * - Employee: /employee-dashboard, /profile
 * - Admin: /admin-dashboard, /employees/:id, /profile
 * - Both: /profile (own profile)
 */
const App = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show full-page loader during initial auth check
  if (isLoading) {
    return <PageLoader message="Loading Dayflow..." />;
  }

  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
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

      {/* ============ PROTECTED: EMPLOYEE ============ */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ============ PROTECTED: ADMIN ============ */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin: View/Edit specific employee */}
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EmployeeDetail />
          </ProtectedRoute>
        }
      />

      {/* ============ PROTECTED: SHARED (BOTH ROLES) ============ */}

      {/* Own profile - accessible by both employees and admins */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['employee', 'admin']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ============ PLACEHOLDER ROUTES (Phase 3 & 4) ============ */}

      {/* Employee routes - placeholders for Phase 3 */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <PlaceholderPage title="Attendance" description="Clock in/out and view your attendance records. Coming in Phase 3." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <PlaceholderPage title="Leave Requests" description="Apply for leave and check request status. Coming in Phase 3." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <PlaceholderPage title="Payroll" description="View payslips and salary details. Coming in Phase 4." />
          </ProtectedRoute>
        }
      />

      {/* Admin routes - placeholders for Phase 3 & 4 */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Navigate to="/admin-dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-manage"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Attendance Management" description="Manage team attendance records. Coming in Phase 3." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-manage"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Leave Management" description="Review and approve/reject leave requests. Coming in Phase 3." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll-manage"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Payroll Management" description="Process payroll and manage compensation. Coming in Phase 4." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Reports & Analytics" description="View HR analytics and generate reports. Coming in Phase 4." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Settings" description="System settings and configuration. Coming soon." />
          </ProtectedRoute>
        }
      />

      {/* ============ CATCH-ALL ============ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Placeholder page for routes that will be built in future phases.
 * Shows a clean "coming soon" state within the dashboard layout.
 */
import DashboardLayout from './components/layout/DashboardLayout';
import Card from './components/ui/Card';
import { Clock } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm">{description}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default App;
