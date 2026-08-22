import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle,
  LogOut,
  Bell,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';

/**
 * Employee Dashboard — Phase 2 Enhanced
 * Quick-access cards: Profile, Attendance, Leave, Logout
 * Recent Activity feed with notifications
 */
const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getMyActivities({ limit: 8 });
        setActivities(data.data || []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  // Quick access cards
  const quickAccessCards = [
    {
      icon: UserCircle,
      title: 'My Profile',
      description: 'View and update your personal details',
      to: '/profile',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Clock,
      title: 'Attendance',
      description: 'Clock in/out and view records',
      to: '/attendance',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: CalendarDays,
      title: 'Leave Requests',
      description: 'Apply for leave or check status',
      to: '/leave',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: LogOut,
      title: 'Logout',
      description: 'Sign out of your account',
      to: null, // Special handling
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      action: handleLogout,
    },
  ];

  // Summary stats
  const stats = [
    {
      icon: Clock,
      label: "Today's Status",
      value: 'Not Checked In',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
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
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: FileText,
      label: 'Pending Requests',
      value: '0',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  // Activity icon by type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'profile_update':
        return <UserCircle className="w-4 h-4 text-primary-500" />;
      case 'leave_request':
      case 'leave_approved':
      case 'leave_rejected':
        return <CalendarDays className="w-4 h-4 text-purple-500" />;
      case 'attendance_checkin':
      case 'attendance_checkout':
        return <Clock className="w-4 h-4 text-green-500" />;
      case 'account_created':
        return <CheckCircle className="w-4 h-4 text-primary-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Employee'}! 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Here's your work overview for today.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-gray-800 truncate">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickAccessCards.map((card, index) => {
              const CardContent = (
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-100">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {card.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
                  </div>
                </div>
              );

              if (card.action) {
                return (
                  <div key={index} onClick={card.action}>
                    {CardContent}
                  </div>
                );
              }

              return (
                <Link key={index} to={card.to}>
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>

          <Card padding="none" className="overflow-hidden">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      !activity.isRead ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 leading-tight">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                    {!activity.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your activity feed will appear here
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
