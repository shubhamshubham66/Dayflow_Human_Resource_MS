import React from 'react';
import { Users, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

/**
 * Admin Dashboard - Landing page for admins/HR after login.
 * Phase 1: Shows welcome message and placeholder organization stats.
 * Phase 2+: Will be populated with real data.
 */
const AdminDashboard = () => {
  const { user } = useAuth();

  // Placeholder stats
  const stats = [
    {
      icon: Users,
      label: 'Total Employees',
      value: '--',
      change: '',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Clock,
      label: 'Present Today',
      value: '--',
      change: '',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: CalendarDays,
      label: 'Leave Requests',
      value: '--',
      change: 'Pending',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: TrendingUp,
      label: 'Attendance Rate',
      value: '--%',
      change: 'This month',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Admin Dashboard 🏢
        </h1>
        <p className="mt-1 text-gray-500">
          Welcome back, {user?.fullName || 'Admin'}. Here's your organization overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hoverable className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="flex items-center justify-center h-48 text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm">Activity feed will appear here</p>
              <p className="text-xs text-gray-300 mt-1">Coming in Phase 2</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600 text-sm">
                Manage Employees
              </span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600 text-sm">
                Review Leave Requests
              </span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600 text-sm">
                Run Payroll
              </span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600 text-sm">
                View Reports
              </span>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
