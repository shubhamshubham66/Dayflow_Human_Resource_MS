import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import attendanceService from '../services/attendanceService';

/**
 * Employee Attendance Page
 * - Check-in/out action card with live timer
 * - Monthly calendar view with color-coded status per day
 * - Summary stats (present, absent, half-day, leave)
 */
const Attendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthRecords, setMonthRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  const fetchTodayStatus = useCallback(async () => {
    try {
      const data = await attendanceService.getTodayStatus();
      setTodayStatus(data.data);
    } catch (error) {
      console.error('Failed to fetch today status:', error);
    }
  }, []);

  // Fetch monthly records
  const fetchMonthRecords = useCallback(async () => {
    setLoading(true);
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const data = await attendanceService.getMyAttendance(monthStr);
      setMonthRecords(data.data || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchTodayStatus();
    fetchMonthRecords();
  }, [fetchTodayStatus, fetchMonthRecords]);

  // Check in handler
  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const data = await attendanceService.checkIn();
      setTodayStatus(data.data);
      toast.success('Checked in successfully! ✅');
      fetchMonthRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Check out handler
  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const data = await attendanceService.checkOut();
      setTodayStatus(data.data);
      toast.success(`Checked out! Total: ${data.data.totalHours}h`);
      fetchMonthRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  // Determine check-in/out state
  const isCheckedIn = todayStatus?.checkIn?.time && !todayStatus?.checkOut?.time;
  const isCheckedOut = todayStatus?.checkOut?.time;
  const hasNotCheckedIn = !todayStatus?.checkIn?.time;

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Status badge config
  const statusConfig = {
    present: { label: 'Present', variant: 'success', icon: CheckCircle },
    absent: { label: 'Absent', variant: 'danger', icon: XCircle },
    'half-day': { label: 'Half Day', variant: 'warning', icon: AlertTriangle },
    leave: { label: 'Leave', variant: 'info', icon: CalendarIcon },
    holiday: { label: 'Holiday', variant: 'neutral', icon: CalendarIcon },
    weekend: { label: 'Weekend', variant: 'neutral', icon: null },
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-gray-500">Track your daily attendance and working hours.</p>
      </div>

      {/* Check-in/out Action Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Time & Status */}
            <div>
              <p className="text-primary-100 text-sm font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-4xl font-bold mt-1 font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-primary-100">
                <span>Check-in: <strong className="text-white">{formatTime(todayStatus?.checkIn?.time)}</strong></span>
                <span>Check-out: <strong className="text-white">{formatTime(todayStatus?.checkOut?.time)}</strong></span>
                {todayStatus?.totalHours > 0 && (
                  <span>Hours: <strong className="text-white">{todayStatus.totalHours}h</strong></span>
                )}
              </div>
            </div>

            {/* Right: Action Button */}
            <div className="flex-shrink-0">
              {hasNotCheckedIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all shadow-lg disabled:opacity-50"
                >
                  <LogIn className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Check In'}
                </button>
              )}
              {isCheckedIn && (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all shadow-lg disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Check Out'}
                </button>
              )}
              {isCheckedOut && (
                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg border border-white/30">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MiniStat label="Present" value={summary.present} color="text-green-600" bg="bg-green-50" />
          <MiniStat label="Absent" value={summary.absent} color="text-red-600" bg="bg-red-50" />
          <MiniStat label="Half Day" value={summary.halfDay} color="text-amber-600" bg="bg-amber-50" />
          <MiniStat label="Leave" value={summary.leave} color="text-primary-600" bg="bg-primary-50" />
        </div>
      )}

      {/* Calendar View */}
      <Card padding="none">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            </div>
          ) : (
            <CalendarGrid
              month={currentMonth}
              records={monthRecords}
              statusConfig={statusConfig}
            />
          )}
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
          {Object.entries(statusConfig).filter(([k]) => k !== 'weekend' && k !== 'holiday').map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-full ${
                config.variant === 'success' ? 'bg-green-500' :
                config.variant === 'danger' ? 'bg-red-500' :
                config.variant === 'warning' ? 'bg-amber-500' :
                config.variant === 'info' ? 'bg-primary-500' : 'bg-gray-300'
              }`} />
              {config.label}
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

/**
 * Mini stat card for summary row
 */
const MiniStat = ({ label, value, color, bg }) => (
  <div className={`${bg} rounded-lg px-4 py-3`}>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

/**
 * Calendar Grid Component
 * Renders a month grid with attendance status per day
 */
const CalendarGrid = ({ month, records, statusConfig }) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();

  // Map records by day number for quick lookup
  const recordMap = {};
  records.forEach((rec) => {
    const day = new Date(rec.date).getDate();
    recordMap[day] = rec;
  });

  // Generate grid cells
  const cells = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const record = recordMap[day];
    const dateObj = new Date(year, monthIndex, day);
    const isToday = dateObj.toDateString() === today.toDateString();
    const isFuture = dateObj > today;
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    let status = record?.status || (isFuture ? null : isWeekend ? 'weekend' : null);
    let bgColor = 'bg-white';
    let textColor = 'text-gray-700';
    let dotColor = '';

    if (status && statusConfig[status]) {
      switch (statusConfig[status].variant) {
        case 'success':
          bgColor = 'bg-green-50';
          dotColor = 'bg-green-500';
          break;
        case 'danger':
          bgColor = 'bg-red-50';
          dotColor = 'bg-red-500';
          break;
        case 'warning':
          bgColor = 'bg-amber-50';
          dotColor = 'bg-amber-500';
          break;
        case 'info':
          bgColor = 'bg-primary-50';
          dotColor = 'bg-primary-500';
          break;
        default:
          bgColor = 'bg-gray-50';
          dotColor = 'bg-gray-300';
      }
    }

    if (isFuture) {
      textColor = 'text-gray-300';
      bgColor = '';
    }

    if (isWeekend && !record) {
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-400';
    }

    cells.push(
      <div
        key={day}
        className={`aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all
          ${bgColor} ${isToday ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
          ${!isFuture ? 'hover:shadow-sm' : ''}
        `}
        title={status ? statusConfig[status]?.label : ''}
      >
        <span className={`text-sm font-medium ${textColor}`}>{day}</span>
        {dotColor && (
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5`} />
        )}
        {record?.totalHours > 0 && (
          <span className="text-[10px] text-gray-500 mt-0.5">{record.totalHours}h</span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {cells}
    </div>
  );
};

export default Attendance;
