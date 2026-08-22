import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import leaveService from '../services/leaveService';

/**
 * Admin Leave Management Page
 * - Summary stats (pending/approved/rejected counts)
 * - Filter by status
 * - All leave requests table with employee info
 * - Approve/Reject actions with comment modal
 */
const LeaveManage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending'); // Default to pending
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null); // { leaveId, action: 'approved'|'rejected' }
  const [adminComment, setAdminComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Dummy leave data for when API is unavailable
  const dummyLeaves = [
    { _id: 'l1', employee: { fullName: 'Rahul Sharma', employeeId: 'EMP001', department: 'Engineering', profilePicture: null }, leaveType: 'paid', startDate: '2026-08-25', endDate: '2026-08-27', totalDays: 3, reason: 'Family function in hometown', status: 'pending', adminComment: '' },
    { _id: 'l2', employee: { fullName: 'Priya Patel', employeeId: 'EMP002', department: 'Design', profilePicture: null }, leaveType: 'sick', startDate: '2026-08-22', endDate: '2026-08-23', totalDays: 2, reason: 'Fever and cold, doctor advised rest', status: 'pending', adminComment: '' },
    { _id: 'l3', employee: { fullName: 'Amit Kumar', employeeId: 'EMP003', department: 'Marketing', profilePicture: null }, leaveType: 'casual', startDate: '2026-08-20', endDate: '2026-08-20', totalDays: 1, reason: 'Personal errands', status: 'approved', adminComment: 'Approved. Enjoy your day off!' },
    { _id: 'l4', employee: { fullName: 'Sneha Gupta', employeeId: 'EMP004', department: 'HR', profilePicture: null }, leaveType: 'paid', startDate: '2026-09-01', endDate: '2026-09-05', totalDays: 5, reason: 'Vacation trip planned with family', status: 'pending', adminComment: '' },
    { _id: 'l5', employee: { fullName: 'Vikram Singh', employeeId: 'EMP005', department: 'Engineering', profilePicture: null }, leaveType: 'unpaid', startDate: '2026-08-18', endDate: '2026-08-19', totalDays: 2, reason: 'Urgent personal matter', status: 'rejected', adminComment: 'Team needs coverage this week. Please reschedule.' },
    { _id: 'l6', employee: { fullName: 'Anjali Verma', employeeId: 'EMP006', department: 'Finance', profilePicture: null }, leaveType: 'sick', startDate: '2026-08-15', endDate: '2026-08-16', totalDays: 2, reason: 'Migraine, unable to work', status: 'approved', adminComment: 'Take care!' },
    { _id: 'l7', employee: { fullName: 'Rohan Mehta', employeeId: 'EMP007', department: 'Engineering', profilePicture: null }, leaveType: 'casual', startDate: '2026-08-28', endDate: '2026-08-28', totalDays: 1, reason: 'Moving to new apartment', status: 'pending', adminComment: '' },
    { _id: 'l8', employee: { fullName: 'Kavita Joshi', employeeId: 'EMP008', department: 'Sales', profilePicture: null }, leaveType: 'maternity', startDate: '2026-09-10', endDate: '2026-12-10', totalDays: 90, reason: 'Maternity leave as per policy', status: 'approved', adminComment: 'Congratulations! Approved as per company policy.' },
  ];

  const dummySummary = { pending: 4, approved: 3, rejected: 1 };

  // Fetch leaves
  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (filterStatus) params.status = filterStatus;
      const data = await leaveService.getAllLeaves(params);
      setLeaves(data.data || []);
      setSummary(data.summary || { pending: 0, approved: 0, rejected: 0 });
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch leaves, using dummy data:', error);
      // Use dummy data as fallback
      let filtered = dummyLeaves;
      if (filterStatus) filtered = filtered.filter(l => l.status === filterStatus);
      if (search) filtered = filtered.filter(l => l.employee.fullName.toLowerCase().includes(search.toLowerCase()));
      setLeaves(filtered);
      setSummary(dummySummary);
      setPagination({ total: filtered.length, page: 1, limit: 10, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaves(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLeaves]);

  // Open review modal
  const openReviewModal = (leaveId, action) => {
    setReviewModal({ leaveId, action });
    setAdminComment('');
  };

  // Submit review
  const handleReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await leaveService.reviewLeave(reviewModal.leaveId, {
        status: reviewModal.action,
        adminComment,
      });
      toast.success(`Leave request ${reviewModal.action} successfully!`);
      setReviewModal(null);
      setAdminComment('');
      fetchLeaves(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review request');
    } finally {
      setReviewLoading(false);
    }
  };

  // Quick approve/reject (no comment)
  const quickReview = async (leaveId, action) => {
    try {
      await leaveService.reviewLeave(leaveId, { status: action, adminComment: '' });
      toast.success(`Leave request ${action}!`);
      fetchLeaves(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review request');
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Leave type display
  const leaveTypeLabels = {
    paid: 'Paid Leave',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
    casual: 'Casual Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="mt-1 text-gray-500">Review and manage employee leave requests.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card
          className={`text-center cursor-pointer transition-all ${filterStatus === 'pending' ? 'ring-2 ring-amber-400' : 'hover:shadow-card-hover'}`}
          onClick={() => setFilterStatus('pending')}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{summary.pending}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">Pending</p>
        </Card>
        <Card
          className={`text-center cursor-pointer transition-all ${filterStatus === 'approved' ? 'ring-2 ring-green-400' : 'hover:shadow-card-hover'}`}
          onClick={() => setFilterStatus('approved')}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{summary.approved}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">Approved</p>
        </Card>
        <Card
          className={`text-center cursor-pointer transition-all ${filterStatus === 'rejected' ? 'ring-2 ring-red-400' : 'hover:shadow-card-hover'}`}
          onClick={() => setFilterStatus('rejected')}
        >
          <div className="flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{summary.rejected}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">Rejected</p>
        </Card>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">
              {filterStatus ? `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Requests` : 'All Requests'}
            </h2>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Show all
              </button>
            )}
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by employee name..."
            className="w-full sm:w-64"
          />
        </div>

        {/* Table content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : leaves.length > 0 ? (
          <>
            <div className="divide-y divide-gray-50">
              {leaves.map((leave) => (
                <div key={leave._id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Employee info + leave details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          src={leave.employee?.profilePicture}
                          name={leave.employee?.fullName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {leave.employee?.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {leave.employee?.department || leave.employee?.employeeId}
                          </p>
                        </div>
                        {getStatusBadge(leave.status)}
                      </div>

                      {/* Leave details row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ml-11 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {leaveTypeLabels[leave.leaveType] || leave.leaveType}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">
                          {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Reason */}
                      {leave.reason && (
                        <p className="text-xs text-gray-500 mt-2 ml-11 line-clamp-2 italic">
                          "{leave.reason}"
                        </p>
                      )}

                      {/* Admin comment (if already reviewed) */}
                      {leave.adminComment && (
                        <div className="ml-11 mt-2 flex items-start gap-1.5 text-xs text-primary-600">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{leave.adminComment}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions (only for pending) */}
                    {leave.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0 ml-11 lg:ml-0">
                        <button
                          onClick={() => openReviewModal(leave._id, 'approved')}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal(leave._id, 'rejected')}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchLeaves(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchLeaves(pagination.page + 1)}
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
            icon={CalendarDays}
            title="No leave requests"
            description={filterStatus ? `No ${filterStatus} requests found.` : 'No leave requests in the system.'}
          />
        )}
      </Card>

      {/* Review Modal */}
      {reviewModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setReviewModal(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reviewModal.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {reviewModal.action === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {reviewModal.action === 'approved' ? 'Approve' : 'Reject'} Leave Request
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add an optional comment for the employee.
                    </p>
                  </div>
                </div>

                {/* Comment textarea */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Comment (optional)
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder={
                      reviewModal.action === 'approved'
                        ? 'e.g., Approved. Enjoy your time off!'
                        : 'e.g., Please reschedule — team needs coverage this week.'
                    }
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{adminComment.length}/300</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReviewModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewModal.action === 'approved' ? 'primary' : 'danger'}
                    icon={reviewModal.action === 'approved' ? CheckCircle : XCircle}
                    isLoading={reviewLoading}
                    onClick={handleReview}
                  >
                    {reviewModal.action === 'approved' ? 'Approve' : 'Reject'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default LeaveManage;
