import api from './api';

/**
 * Attendance Service - API calls for attendance operations
 */
const attendanceService = {
  /**
   * Check in for today
   */
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  /**
   * Check out for today
   */
  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  /**
   * Get today's attendance status
   */
  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  /**
   * Get my attendance records for a month
   * @param {string} month - Format: YYYY-MM
   */
  getMyAttendance: async (month) => {
    const response = await api.get('/attendance/my', { params: { month } });
    return response.data;
  },

  /**
   * Get all employees' attendance (admin)
   */
  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },

  /**
   * Admin: Mark attendance manually
   */
  markAttendance: async (data) => {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  },
};

export default attendanceService;
