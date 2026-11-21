import apiClient from './client';

export const ticketTypesApi = {
  getTicketTypesForEvent: async (eventId, manage = false) => {
    const res = await apiClient.get(`/events/${eventId}/ticket-types`, {
      params: manage ? { manage: 'true' } : {}
    });
    return res.data;
  },
  createTicketType: async (eventId, data) => {
    const res = await apiClient.post(`/events/${eventId}/ticket-types`, data);
    return res.data;
  },
  updateTicketType: async (id, data) => {
    const res = await apiClient.patch(`/ticket-types/${id}`, data);
    return res.data;
  },
  toggleTicketTypeStatus: async (id) => {
    const res = await apiClient.patch(`/ticket-types/${id}/toggle`);
    return res.data;
  }
};
