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
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';

// Pages - Admin
import AdminDashboard from './pages/AdminDashboard';
import AttendanceManage from './pages/AttendanceManage';
import LeaveManage from './pages/LeaveManage';
import PayrollManage from './pages/PayrollManage';
import Reports from './pages/Reports';

// Pages - Shared (role-aware)
import Profile from './pages/Profile';
import EmployeeDetail from './pages/EmployeeDetail';
import Settings from './pages/Settings';

/**
 * App Root - All routes and access control.
 * Phase 4 FINAL: All modules active — Auth, Dashboards, Profile,
 * Attendance, Leave, Payroll, Reports, Settings.
 */
const App = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

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
            <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/signin"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />
          ) : (
            <SignIn />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />
          ) : (
            <SignUp />
          )
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ============ PROTECTED: EMPLOYEE ============ */}
      <Route
        path="/employee-dashboard"
        element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>}
      />
      <Route
        path="/attendance"
        element={<ProtectedRoute allowedRoles={['employee']}><Attendance /></ProtectedRoute>}
      />
      <Route
        path="/leave"
        element={<ProtectedRoute allowedRoles={['employee']}><Leave /></ProtectedRoute>}
      />
      <Route
        path="/payroll"
        element={<ProtectedRoute allowedRoles={['employee']}><Payroll /></ProtectedRoute>}
      />

      {/* ============ PROTECTED: ADMIN ============ */}
      <Route
        path="/admin-dashboard"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/employees/:id"
        element={<ProtectedRoute allowedRoles={['admin']}><EmployeeDetail /></ProtectedRoute>}
      />
      <Route
        path="/employees"
        element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin-dashboard" replace /></ProtectedRoute>}
      />
      <Route
        path="/attendance-manage"
        element={<ProtectedRoute allowedRoles={['admin']}><AttendanceManage /></ProtectedRoute>}
      />
      <Route
        path="/leave-manage"
        element={<ProtectedRoute allowedRoles={['admin']}><LeaveManage /></ProtectedRoute>}
      />
      <Route
        path="/payroll-manage"
        element={<ProtectedRoute allowedRoles={['admin']}><PayrollManage /></ProtectedRoute>}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>}
      />

      {/* ============ PROTECTED: SHARED (BOTH ROLES) ============ */}
      <Route
        path="/profile"
        element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Profile /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Settings /></ProtectedRoute>}
      />

      {/* ============ CATCH-ALL ============ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
