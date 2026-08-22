import api from './api';

const settingsService = {
  changePassword: async (data) => {
    const response = await api.put('/settings/change-password', data);
    return response.data;
  },
  updateNotificationPreferences: async (prefs) => {
    const response = await api.put('/settings/notification-preferences', prefs);
    return response.data;
  },
};

export default settingsService;
