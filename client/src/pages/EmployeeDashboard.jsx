import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle,
  LogOut,
  ArrowRight,
  Database,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import seedService from '../services/seedService';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Dummy weekly attendance data for chart
  const weeklyData = [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 9.0 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 8.2 },
    { day: 'Fri', hours: 8.8 },
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getMyActivities({ limit: 5 });
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

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const data = await seedService.seedMyData();
      toast.success(data.message || 'Demo data loaded! Refresh to see.');
    } catch (error) {
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const quickAccessCards = [
    { icon: UserCircle, title: 'My Profile', description: 'View and update personal details', to: '/profile', color: 'text-primary-500', bgColor: 'bg-primary-50' },
    { icon: Clock, title: 'Attendance', description: 'Clock in/out and view records', to: '/attendance', color: 'text-green-500', bgColor: 'bg-green-50' },
    { icon: CalendarDays, title: 'Leave Requests', description: 'Apply for leave or check status', to: '/leave', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { icon: DollarSign, title: 'Payroll', description: 'View salary slips', to: '/payroll', color: 'text-amber-500', bgColor: 'bg-amber-50' },
  ];

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Employee'}! 👋
          </h1>
          <p className="mt-1 text-gray-500">Here is your work overview.</p>
        </div>
        <Button variant="secondary" size="sm" icon={Database} isLoading={seeding} onClick={handleSeedData}>
          Load Demo Data
        </Button>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickAccessCards.map((card, i) => (
          <Link key={i} to={card.to}>
            <Card hoverable className="flex items-center gap-4 h-full group">
              <div className={`w-11 h-11 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{card.title}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Hours Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">This Week - Hours Worked</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="hours" name="Hours" fill="#2f5597" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
          </div>
          {loadingActivities ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {activities.map((act) => (
                <div key={act._id} className="px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-tight">{act.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <p className="text-xs text-gray-500">No recent activity</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click "Load Demo Data" to see sample data</p>
            </div>
          )}
        </Card>
      </div>

      {/* Logout button */}
      <div className="mt-6">
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
