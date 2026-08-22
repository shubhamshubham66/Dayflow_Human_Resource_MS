import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  Building2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';

/**
 * Admin Dashboard — Phase 2
 * Summary widgets, searchable/filterable employee table, click-to-view detail
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Employee table state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dashboard stats
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

  // Fetch employees with debounced search
  const fetchEmployees = useCallback(async (page = 1) => {
    setLoadingEmployees(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
        department: filterDepartment,
        role: filterRole,
        status: filterStatus,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const data = await employeeService.getAll(params);
      setEmployees(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 8, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  }, [search, filterDepartment, filterRole, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(1);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Navigate to employee detail
  const handleViewEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  // Stat cards data
  const statCards = [
    {
      icon: Users,
      label: 'Total Employees',
      value: stats?.totalEmployees ?? '--',
      subLabel: `${stats?.activeEmployees ?? 0} active`,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: CalendarDays,
      label: 'Pending Leave',
      value: stats?.pendingLeaveRequests ?? '0',
      subLabel: 'Requests to review',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Clock,
      label: "Today's Attendance",
      value: stats?.todayAttendancePercent ? `${stats.todayAttendancePercent}%` : '--%',
      subLabel: 'Present today',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Departments',
      value: stats?.departmentBreakdown?.length ?? '--',
      subLabel: 'Active departments',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  // Role badge variant
  const getRoleBadge = (role) => {
    return role === 'admin'
      ? <Badge variant="info">Admin</Badge>
      : <Badge variant="neutral">Employee</Badge>;
  };

  // Status badge
  const getStatusBadge = (isActive) => {
    return isActive
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="danger">Inactive</Badge>;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {user?.fullName || 'Admin'}. Manage your organization.
          </p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} hoverable className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.subLabel}</p>
              </div>
            </div>
            {/* Decorative accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full opacity-30 -translate-y-1/2 translate-x-1/2`} />
          </Card>
        ))}
      </div>

      {/* Employee Table Section */}
      <Card padding="none" className="overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
              <p className="text-sm text-gray-500">
                {pagination.total} total employee{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name, email, ID..."
                className="w-full sm:w-64"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 border rounded-lg transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                title="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Row (expandable) */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 animate-slide-down">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary-500"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary-500"
              >
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {(filterDepartment || filterRole || filterStatus) && (
                <button
                  onClick={() => {
                    setFilterDepartment('');
                    setFilterRole('');
                    setFilterStatus('');
                  }}
                  className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table Content */}
        {loadingEmployees ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : employees.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleViewEmployee(emp._id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.profilePicture} name={emp.fullName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{emp.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600 font-mono">{emp.employeeId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600">{emp.department || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {getRoleBadge(emp.role)}
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(emp.isActive)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEmployee(emp._id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-50">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => handleViewEmployee(emp._id)}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Avatar src={emp.profilePicture} name={emp.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{emp.fullName}</p>
                      {getRoleBadge(emp.role)}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{emp.department || emp.employeeId}</p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchEmployees(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchEmployees(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchEmployees(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={search ? `No results for "${search}". Try a different search term.` : 'No employees in the system yet.'}
          />
        )}
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
