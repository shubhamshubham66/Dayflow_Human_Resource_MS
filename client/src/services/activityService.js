import api from './api';

/**
 * Activity Service - API calls for activity/notification feeds
 */
const activityService = {
  /**
   * Get current user's activities
   */
  getMyActivities: async (params = {}) => {
    const response = await api.get('/activities/my', { params });
    return response.data;
  },

  /**
   * Get admin activity feed
   */
  getAdminActivities: async (params = {}) => {
    const response = await api.get('/activities/admin', { params });
    return response.data;
  },

  /**
   * Mark activities as read
   */
  markAsRead: async (activityIds = []) => {
    const response = await api.put('/activities/mark-read', { activityIds });
    return response.data;
  },
};

export default activityService;
