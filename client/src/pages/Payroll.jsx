import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import payrollService from '../services/payrollService';

/**
 * Employee Payroll Page
 * - Current salary summary card
 * - List of salary slips by year
 * - Download PDF (simulated)
 */
const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await payrollService.getMyPayroll({ year: selectedYear });
        setPayrolls(data.data || []);
      } catch (error) {
        console.error('Failed to fetch payroll:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedYear]);

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || currency}${(amount || 0).toLocaleString()}`;
  };

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'generated': return <Badge variant="info">Generated</Badge>;
      case 'draft': return <Badge variant="neutral">Draft</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Simulate PDF download
  const handleDownload = (slip) => {
    const content = `
DAYFLOW HRMS - SALARY SLIP
===========================
Employee: ${slip.employee?.fullName || 'N/A'}
Employee ID: ${slip.employee?.employeeId || 'N/A'}
Period: ${monthNames[slip.month]} ${slip.year}
Department: ${slip.employee?.department || 'N/A'}

EARNINGS:
  Basic Salary: ${formatCurrency(slip.earnings?.basic, slip.currency)}
  HRA: ${formatCurrency(slip.earnings?.hra, slip.currency)}
  Allowances: ${formatCurrency(slip.earnings?.allowances, slip.currency)}
  Bonus: ${formatCurrency(slip.earnings?.bonus, slip.currency)}
  Overtime: ${formatCurrency(slip.earnings?.overtime, slip.currency)}
  ─────────────────────
  Gross: ${formatCurrency(slip.grossSalary, slip.currency)}

DEDUCTIONS:
  Tax: ${formatCurrency(slip.deductions?.tax, slip.currency)}
  Insurance: ${formatCurrency(slip.deductions?.insurance, slip.currency)}
  Provident Fund: ${formatCurrency(slip.deductions?.providentFund, slip.currency)}
  Other: ${formatCurrency(slip.deductions?.other, slip.currency)}
  ─────────────────────
  Total Deductions: ${formatCurrency(slip.totalDeductions, slip.currency)}

═══════════════════════
NET SALARY: ${formatCurrency(slip.netSalary, slip.currency)}
═══════════════════════

Status: ${slip.status?.toUpperCase()}
Generated on: ${new Date(slip.createdAt).toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-slip-${monthNames[slip.month]}-${slip.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate yearly totals
  const yearlyTotal = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const latestSlip = payrolls[0];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payroll</h1>
        <p className="mt-1 text-gray-500">View your salary structure and download payslips.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <p className="text-primary-100 text-xs font-medium uppercase">Latest Net Salary</p>
          <p className="text-2xl font-bold mt-1">
            {latestSlip ? formatCurrency(latestSlip.netSalary, latestSlip.currency) : '--'}
          </p>
          <p className="text-primary-200 text-xs mt-1">
            {latestSlip ? `${monthNames[latestSlip.month]} ${latestSlip.year}` : 'No slips yet'}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">YTD Earnings ({selectedYear})</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(yearlyTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{payrolls.length} slip(s) this year</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Latest Gross</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {latestSlip ? formatCurrency(latestSlip.grossSalary, latestSlip.currency) : '--'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Before deductions</p>
        </Card>
      </div>

      {/* Year filter + Slips List */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Salary Slips</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-primary-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          </div>
        ) : payrolls.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {payrolls.map((slip) => (
              <div key={slip._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {monthNames[slip.month]} {slip.year}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">
                        Net: <strong className="text-gray-700">{formatCurrency(slip.netSalary, slip.currency)}</strong>
                      </span>
                      {getStatusBadge(slip.status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(slip)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={DollarSign}
            title="No salary slips"
            description={`No payroll records found for ${selectedYear}.`}
          />
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Payroll;
