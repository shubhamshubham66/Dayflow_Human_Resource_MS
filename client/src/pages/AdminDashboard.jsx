import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import seedService from '../services/seedService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);

  // Dummy chart data (will be replaced by real API data when available)
  const attendanceChartData = [
    { day: 'Mon', present: 85, absent: 10, leave: 5 },
    { day: 'Tue', present: 90, absent: 5, leave: 5 },
    { day: 'Wed', present: 78, absent: 12, leave: 10 },
    { day: 'Thu', present: 92, absent: 3, leave: 5 },
    { day: 'Fri', present: 70, absent: 15, leave: 15 },
  ];

  const leaveDistData = [
    { name: 'Paid', value: 12, color: '#2f5597' },
    { name: 'Sick', value: 8, color: '#ef4444' },
    { name: 'Casual', value: 5, color: '#f59e0b' },
    { name: 'Unpaid', value: 3, color: '#6b7280' },
  ];

  const weeklyTrendData = [
    { week: 'Week 1', attendance: 88, leaves: 4 },
    { week: 'Week 2', attendance: 92, leaves: 2 },
    { week: 'Week 3', attendance: 85, leaves: 6 },
    { week: 'Week 4', attendance: 90, leaves: 3 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await employeeService.getDashboardStats();
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const fetchEmployees = useCallback(async (page = 1) => {
    setLoadingEmployees(true);
    try {
      const data = await employeeService.getAll({ page, limit: 8, search, sortBy: 'createdAt', sortOrder: 'desc' });
      setEmployees(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 8, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(1), 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const data = await seedService.seedMyData();
      toast.success(data.message || 'Demo data loaded!');
      // Refresh stats
      const statsData = await employeeService.getDashboardStats();
      setStats(statsData.data);
    } catch (error) {
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats?.totalEmployees ?? '--', sub: `${stats?.activeEmployees ?? 0} active`, color: 'text-primary-500', bg: 'bg-primary-50' },
    { icon: CalendarDays, label: 'Pending Leave', value: stats?.pendingLeaveRequests ?? '0', sub: 'Requests to review', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Clock, label: "Today's Attendance", value: stats?.todayAttendancePercent ? `${stats.todayAttendancePercent}%` : '85%', sub: 'Present today', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: TrendingUp, label: 'Departments', value: stats?.departmentBreakdown?.length ?? '4', sub: 'Active departments', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back, {user?.fullName || 'Admin'}.</p>
        </div>
        <Button variant="secondary" size="sm" icon={Database} isLoading={seeding} onClick={handleSeedData}>
          Load Demo Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <Card key={i} hoverable className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Attendance Bar Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Weekly Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="present" name="Present %" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leave" name="Leave %" fill="#2f5597" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Leave Pie Chart */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={leaveDistData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {leaveDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {leaveDistData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trend Line Chart */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#2f5597" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="leaves" name="Leaves" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Employee Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Employees</h2>
            <p className="text-sm text-gray-500">{pagination.total} total</p>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." className="w-full sm:w-64" />
        </div>

        {loadingEmployees ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : employees.length > 0 ? (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/employees/${emp._id}`)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.profilePicture} name={emp.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{emp.fullName}</p>
                            <p className="text-xs text-gray-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{emp.employeeId}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{emp.department || '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={emp.role === 'admin' ? 'info' : 'neutral'}>{emp.role === 'admin' ? 'Admin' : 'Employee'}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-50">
              {employees.map((emp) => (
                <div key={emp._id} onClick={() => navigate(`/employees/${emp._id}`)} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer">
                  <Avatar src={emp.profilePicture} name={emp.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{emp.fullName}</p>
                    <p className="text-xs text-gray-500">{emp.department || emp.employeeId}</p>
                  </div>
                  <Badge variant={emp.role === 'admin' ? 'info' : 'neutral'}>{emp.role === 'admin' ? 'Admin' : 'Employee'}</Badge>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
                <div className="flex gap-1">
                  <button onClick={() => fetchEmployees(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => fetchEmployees(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={Users} title="No employees found" description={search ? `No results for "${search}".` : 'No employees in the system yet. Click "Load Demo Data" above.'} />
        )}
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
