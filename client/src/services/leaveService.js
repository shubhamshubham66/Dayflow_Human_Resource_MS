import api from './api';

/**
 * Leave Service - API calls for leave management
 */
const leaveService = {
  /**
   * Apply for leave
   */
  apply: async (data) => {
    const response = await api.post('/leaves/apply', data);
    return response.data;
  },

  /**
   * Get my leave requests
   */
  getMyLeaves: async (params = {}) => {
    const response = await api.get('/leaves/my', { params });
    return response.data;
  },

  /**
   * Get all leave requests (admin)
   */
  getAllLeaves: async (params = {}) => {
    const response = await api.get('/leaves/all', { params });
    return response.data;
  },

  /**
   * Approve or reject a leave request (admin)
   */
  reviewLeave: async (id, data) => {
    const response = await api.put(`/leaves/${id}/review`, data);
    return response.data;
  },

  /**
   * Cancel a leave request (employee)
   */
  cancelLeave: async (id) => {
    const response = await api.put(`/leaves/${id}/cancel`);
    return response.data;
  },
};

export default leaveService;
