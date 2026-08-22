import api from './api';

const analyticsService = {
  getAttendanceTrends: async () => {
    const response = await api.get('/analytics/attendance-trends');
    return response.data;
  },
  getLeaveDistribution: async (params = {}) => {
    const response = await api.get('/analytics/leave-distribution', { params });
    return response.data;
  },
  getDepartmentHeadcount: async () => {
    const response = await api.get('/analytics/department-headcount');
    return response.data;
  },
  getPayrollSummary: async () => {
    const response = await api.get('/analytics/payroll-summary');
    return response.data;
  },
};

export default analyticsService;
