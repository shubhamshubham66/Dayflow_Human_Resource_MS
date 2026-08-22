import api from './api';

const payrollService = {
  getMyPayroll: async (params = {}) => {
    const response = await api.get('/payroll/my', { params });
    return response.data;
  },
  getSlip: async (id) => {
    const response = await api.get(`/payroll/slip/${id}`);
    return response.data;
  },
  getAllPayroll: async (params = {}) => {
    const response = await api.get('/payroll/all', { params });
    return response.data;
  },
  generate: async (data) => {
    const response = await api.post('/payroll/generate', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/payroll/${id}/status`, { status });
    return response.data;
  },
};

export default payrollService;
