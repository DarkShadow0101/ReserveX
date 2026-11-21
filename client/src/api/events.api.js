import apiClient from './client';

export const eventsApi = {
  getPublicEvents: async (params) => {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },
  getPublicEventById: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
  getEventForOrganizer: async (id) => {
    const res = await apiClient.get(`/events/${id}/manage`);
    return res.data;
  },
  updateEvent: async (id, data) => {
    const res = await apiClient.patch(`/events/${id}`, data);
    return res.data;
  },
  publishEvent: async (id) => {
    const res = await apiClient.patch(`/events/${id}/publish`);
    return res.data;
  },
  cancelEvent: async (id) => {
    const res = await apiClient.patch(`/events/${id}/cancel`);
    return res.data;
  }
};
