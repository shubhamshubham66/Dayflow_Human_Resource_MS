import React, { useState } from 'react';
import {
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import settingsService from '../services/settingsService';

/**
 * Settings Page
 * - Change password with validation
 * - Notification preferences toggles
 * - Account info summary
 */
const Settings = () => {
  const { user } = useAuth();

  // Dummy user data fallback when no user is available
  const displayUser = user || {
    fullName: 'Admin User',
    email: 'admin@dayflow.com',
    employeeId: 'EMP001',
    role: 'admin',
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
  };

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification preferences state
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    leaveUpdates: true,
    attendanceReminders: true,
    payrollAlerts: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(false);

  // Password validation
  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      if (passwordForm.newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters';
      else if (!/\d/.test(passwordForm.newPassword)) errors.newPassword = 'Must contain at least 1 number';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) errors.newPassword = 'Must contain at least 1 special character';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (passwordForm.currentPassword === passwordForm.newPassword && passwordForm.newPassword) {
      errors.newPassword = 'New password must differ from current';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      if (msg.includes('incorrect')) {
        setPasswordErrors({ currentPassword: msg });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle notification preferences save
  const handleSavePrefs = async () => {
    setPrefsLoading(true);
    try {
      await settingsService.updateNotificationPreferences(prefs);
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/\d/.test(pw)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) s++;
    if (pw.length >= 12) s++;
    return s;
  };
  const strength = getStrength(passwordForm.newPassword);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-primary-500', 'bg-green-500'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account security and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password + Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== Change Password ===== */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className={`w-full px-4 py-3 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all ${
                      passwordErrors.currentPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 8 chars, 1 number, 1 special char"
                    className={`w-full px-4 py-3 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all ${
                      passwordErrors.newPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Strength: {strengthLabels[strength] || ''}</p>
                  </div>
                )}
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className={`w-full px-4 py-3 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all ${
                      passwordErrors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={passwordLoading} icon={Lock}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* ===== Notification Preferences ===== */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Notification Preferences</h2>
                <p className="text-xs text-gray-500">Choose what you want to be notified about</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <ToggleRow
                label="Email Notifications"
                description="Receive important updates via email"
                checked={prefs.emailNotifications}
                onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })}
              />
              <ToggleRow
                label="Leave Updates"
                description="Get notified when leave requests are approved or rejected"
                checked={prefs.leaveUpdates}
                onChange={(v) => setPrefs({ ...prefs, leaveUpdates: v })}
              />
              <ToggleRow
                label="Attendance Reminders"
                description="Daily reminder to check in if you haven't yet"
                checked={prefs.attendanceReminders}
                onChange={(v) => setPrefs({ ...prefs, attendanceReminders: v })}
              />
              <ToggleRow
                label="Payroll Alerts"
                description="Notification when a new salary slip is generated"
                checked={prefs.payrollAlerts}
                onChange={(v) => setPrefs({ ...prefs, payrollAlerts: v })}
              />

              <div className="pt-2">
                <Button variant="secondary" onClick={handleSavePrefs} isLoading={prefsLoading} icon={Check}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Account Info */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Account Info</h3>
            </div>

            <div className="space-y-3">
              <InfoRow label="Name" value={displayUser?.fullName} />
              <InfoRow label="Email" value={displayUser?.email} />
              <InfoRow label="Employee ID" value={displayUser?.employeeId} />
              <InfoRow label="Role" value={displayUser?.role === 'admin' ? 'Admin / HR' : 'Employee'} />
              <InfoRow label="Status" value={displayUser?.isActive ? 'Active' : 'Inactive'} />
              <InfoRow label="Member since" value={displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : '--'} />
            </div>
          </Card>

          {/* Security Tips */}
          <Card className="bg-primary-50 border border-primary-100">
            <h3 className="text-sm font-semibold text-primary-800 mb-2">🔐 Security Tips</h3>
            <ul className="space-y-1.5 text-xs text-primary-700">
              <li>• Use a unique password for Dayflow</li>
              <li>• Change your password every 90 days</li>
              <li>• Never share your credentials</li>
              <li>• Log out from shared devices</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

/**
 * Toggle switch row component
 */
const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary-500' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

/**
 * Info display row
 */
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800 capitalize">{value || '--'}</span>
  </div>
);

export default Settings;
