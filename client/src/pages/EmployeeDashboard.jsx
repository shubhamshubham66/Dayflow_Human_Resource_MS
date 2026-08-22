import React from 'react';
import { Clock, CalendarDays, DollarSign, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

/**
 * Employee Dashboard - Landing page for employees after login.
 * Phase 1: Shows welcome message and placeholder cards.
 * Phase 2+: Will be populated with real data.
 */
const EmployeeDashboard = () => {
  const { user } = useAuth();

  // Placeholder stats (will be dynamic in Phase 2+)
  const stats = [
    {
      icon: Clock,
      label: 'Today's Status',
      value: 'Not Checked In',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: CalendarDays,
      label: 'Leave Balance',
      value: '-- days',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: DollarSign,
      label: 'Next Payroll',
      value: '--',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: FileText,
      label: 'Pending Requests',
      value: '--',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Employee'}! 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Here's an overview of your work day.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hoverable className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-800">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Clock In / Clock Out
              </span>
              <p className="text-sm text-gray-500 mt-0.5">Mark your attendance for today</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Request Leave
              </span>
              <p className="text-sm text-gray-500 mt-0.5">Apply for leave or time off</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                View Payslip
              </span>
              <p className="text-sm text-gray-500 mt-0.5">Download your latest payslip</p>
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="flex items-center justify-center h-40 text-gray-400">
            <p className="text-sm">No recent activity to show.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
