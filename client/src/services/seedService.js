import api from './api';

const seedService = {
  seedMyData: async () => {
    const response = await api.post('/seed/my-data');
    return response.data;
  },
};

export default seedService;
