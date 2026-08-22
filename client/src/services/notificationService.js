import api from './api';

const notificationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (ids = []) => {
    const response = await api.put('/notifications/mark-read', { ids });
    return response.data;
  },
};

export default notificationService;
