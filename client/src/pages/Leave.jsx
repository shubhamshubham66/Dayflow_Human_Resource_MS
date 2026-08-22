import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import leaveService from '../services/leaveService';

/**
 * Employee Leave Page
 * - Leave balance summary cards
 * - "Apply for Leave" form (modal-style panel)
 * - List of my leave requests with status badges
 * - Cancel pending requests
 */
const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  // Apply form state
  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch leaves
  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const data = await leaveService.getMyLeaves(params);
      setLeaves(data.data || []);
      setBalance(data.balance || null);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.leaveType) errors.leaveType = 'Leave type is required';
    if (!form.startDate) errors.startDate = 'Start date is required';
    if (!form.endDate) errors.endDate = 'End date is required';
    if (!form.reason.trim()) errors.reason = 'Reason is required';

    if (form.startDate && form.endDate) {
      if (new Date(form.endDate) < new Date(form.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(form.startDate) < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    if (form.reason.length > 500) errors.reason = 'Reason cannot exceed 500 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit leave application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await leaveService.apply(form);
      toast.success('Leave request submitted successfully!');
      setShowApplyForm(false);
      setForm({ leaveType: '', startDate: '', endDate: '', reason: '' });
      setFormErrors({});
      fetchLeaves(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel a pending request
  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leaveService.cancelLeave(id);
      toast.success('Leave request cancelled');
      fetchLeaves(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  // Calculate days between dates
  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
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

  // Leave type options
  const leaveTypeOptions = [
    { value: 'paid', label: 'Paid Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
  ];

  // Leave type label
  const getLeaveTypeLabel = (type) => {
    const found = leaveTypeOptions.find((o) => o.value === type);
    return found ? found.label : type;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave & Time Off</h1>
          <p className="mt-1 text-gray-500">Manage your leave requests and check balance.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowApplyForm(true)}>
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Total Allowed</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{balance.totalAllowed}</p>
            <p className="text-xs text-gray-400">days/year</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Used</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{balance.used}</p>
            <p className="text-xs text-gray-400">days taken</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Remaining</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{balance.remaining}</p>
            <p className="text-xs text-gray-400">days left</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{balance.pending}</p>
            <p className="text-xs text-gray-400">awaiting approval</p>
          </Card>
        </div>
      )}

      {/* Apply Form (Slide-in Panel) */}
      {showApplyForm && (
        <Card className="mb-6 border-2 border-primary-100 animate-slide-down">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Apply for Leave</h2>
            <button
              onClick={() => { setShowApplyForm(false); setFormErrors({}); }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Leave Type */}
              <Select
                label="Leave Type"
                name="leaveType"
                options={leaveTypeOptions}
                placeholder="Select type"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                error={formErrors.leaveType}
              />

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all ${
                    formErrors.startDate ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {formErrors.startDate && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{formErrors.startDate}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all ${
                    formErrors.endDate ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {formErrors.endDate && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{formErrors.endDate}
                  </p>
                )}
              </div>

              {/* Days count */}
              <div className="flex flex-col justify-end">
                <div className="px-4 py-3 bg-primary-50 rounded-lg text-center">
                  <p className="text-xs text-primary-600 font-medium">Total Days</p>
                  <p className="text-2xl font-bold text-primary-700">{calculateDays()}</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Remarks</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-3 border rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all ${
                  formErrors.reason ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {formErrors.reason ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{formErrors.reason}
                  </p>
                ) : <span />}
                <p className="text-xs text-gray-400">{form.reason.length}/500</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => { setShowApplyForm(false); setFormErrors({}); }}
              >
                Cancel
              </Button>
              <Button type="submit" icon={Send} isLoading={submitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterStatus === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : leaves.length > 0 ? (
          <>
            <div className="divide-y divide-gray-50">
              {leaves.map((leave) => (
                <div key={leave._id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left: Leave info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {getLeaveTypeLabel(leave.leaveType)}
                        </h3>
                        {getStatusBadge(leave.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-gray-600">{leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}</span>
                      </div>
                      {leave.reason && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{leave.reason}</p>
                      )}
                      {leave.adminComment && (
                        <p className="text-xs text-primary-600 mt-1 bg-primary-50 px-2 py-1 rounded inline-block">
                          Admin: "{leave.adminComment}"
                        </p>
                      )}
                      {leave.reviewedBy && (
                        <p className="text-xs text-gray-400 mt-1">
                          Reviewed by {leave.reviewedBy.fullName} on {new Date(leave.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {leave.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(leave._id)}
                          className="text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
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
            description={filterStatus ? `No ${filterStatus} requests found.` : 'You haven\'t submitted any leave requests yet.'}
            action={
              !showApplyForm && (
                <Button size="sm" icon={Plus} onClick={() => setShowApplyForm(true)}>
                  Apply for Leave
                </Button>
              )
            }
          />
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Leave;
