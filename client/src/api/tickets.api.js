import apiClient from './client';

export const ticketsApi = {
  getMyTickets: async (params) => {
    const res = await apiClient.get('/tickets/my', { params });
    return res.data;
  },
  getTicketById: async (id) => {
    const res = await apiClient.get(`/tickets/${id}`);
    return res.data;
  },
  getEventTickets: async (eventId, params) => {
    const res = await apiClient.get(`/events/${eventId}/tickets`, { params });
    return res.data;
  },
  checkInTicket: async (qrToken) => {
    // Expected: { qrToken }
    const res = await apiClient.post('/tickets/checkin', { qrToken });
    return res.data;
  }
};
