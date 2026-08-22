import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Plus,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
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
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';

/**
 * Admin Payroll Management Page
 * - View all payroll records with month/year filter
 * - Generate/edit payroll for employees with validation
 * - Mark as paid
 */
const PayrollManage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totals, setTotals] = useState({ totalNet: 0, totalGross: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  // Generate form
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    earnings: { basic: 0, hra: 0, allowances: 0, bonus: 0, overtime: 0 },
    deductions: { tax: 0, insurance: 0, providentFund: 0, other: 0 },
    currency: 'USD',
    notes: '',
  });

  const fetchPayrolls = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await payrollService.getAllPayroll({
        month: selectedMonth, year: selectedYear, search, page, limit: 10,
      });
      setPayrolls(data.data || []);
      setTotals(data.totals || { totalNet: 0, totalGross: 0 });
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (error) {
      console.error('Fetch payroll error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchPayrolls(1), 300);
    return () => clearTimeout(t);
  }, [fetchPayrolls]);

  // Fetch employee list for form
  const openForm = async () => {
    setShowForm(true);
    try {
      const data = await employeeService.getAll({ limit: 100 });
      setEmployees(data.data || []);
    } catch (e) { /* ignore */ }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) { toast.error('Select an employee'); return; }

    const gross = Object.values(form.earnings).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const ded = Object.values(form.deductions).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    if (gross <= 0) { toast.error('Gross salary must be positive'); return; }
    if (ded > gross) { toast.error('Deductions cannot exceed gross salary'); return; }

    setFormLoading(true);
    try {
      await payrollService.generate(form);
      toast.success('Payroll generated successfully!');
      setShowForm(false);
      setForm({ employeeId: '', month: selectedMonth, year: selectedYear, earnings: { basic: 0, hra: 0, allowances: 0, bonus: 0, overtime: 0 }, deductions: { tax: 0, insurance: 0, providentFund: 0, other: 0 }, currency: 'USD', notes: '' });
      fetchPayrolls(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setFormLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await payrollService.updateStatus(id, 'paid');
      toast.success('Marked as paid');
      fetchPayrolls(pagination.page);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const formatCurrency = (amt) => `$${(amt || 0).toLocaleString()}`;
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const gross = Object.values(form.earnings).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const ded = Object.values(form.deductions).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-gray-500">Generate and manage employee payroll.</p>
        </div>
        <Button icon={Plus} onClick={openForm}>Generate Payroll</Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Total Gross</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totals.totalGross)}</p>
          <p className="text-xs text-gray-400">{monthNames[selectedMonth]} {selectedYear}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Total Net Payout</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totals.totalNet)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Records</p>
          <p className="text-xl font-bold text-primary-600 mt-1">{pagination.total}</p>
          <p className="text-xs text-gray-400">employees processed</p>
        </Card>
      </div>

      {/* Generate Form */}
      {showForm && (
        <Card className="mb-6 border-2 border-primary-100 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generate Payroll</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <select value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{monthNames[i + 1]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                  {Array.from({ length: 5 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="INR">INR (₹)</option><option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2">Earnings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(form.earnings).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{key}</label>
                    <input type="number" min="0" value={val} onChange={(e) => setForm({ ...form, earnings: { ...form.earnings, [key]: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2">Deductions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(form.deductions).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{key === 'providentFund' ? 'Provident Fund' : key}</label>
                    <input type="number" min="0" value={val} onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, [key]: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary + Submit */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-500">Gross: <strong className="text-green-600">{formatCurrency(gross)}</strong></span>
                <span className="text-gray-500">Deductions: <strong className="text-red-600">{formatCurrency(ded)}</strong></span>
                <span className="text-gray-500">Net: <strong className="text-primary-600">{formatCurrency(gross - ded)}</strong></span>
              </div>
              <Button type="submit" size="sm" isLoading={formLoading}>Generate</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{monthNames[i + 1]}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              {Array.from({ length: 5 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
            </select>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." className="w-full sm:w-56" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : payrolls.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {payrolls.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar src={p.employee?.profilePicture} name={p.employee?.fullName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.employee?.fullName}</p>
                    <p className="text-xs text-gray-500">{p.employee?.department || p.employee?.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(p.netSalary)}</p>
                    <p className="text-xs text-gray-400">Net</p>
                  </div>
                  {p.status === 'generated' ? (
                    <button onClick={() => markAsPaid(p._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  ) : (
                    <Badge variant="success">Paid</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={DollarSign} title="No payroll records" description="Generate payroll for this period." />
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => fetchPayrolls(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchPayrolls(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default PayrollManage;
