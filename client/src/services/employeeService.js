import api from './api';

/**
 * Employee Service - API calls for employee CRUD operations
 */
const employeeService = {
  /**
   * Get all employees (admin) with search/filter/pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  /**
   * Get single employee by ID
   */
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  /**
   * Get own profile
   */
  getMyProfile: async () => {
    const response = await api.get('/employees/me/profile');
    return response.data;
  },

  /**
   * Update employee profile
   */
  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default employeeService;
