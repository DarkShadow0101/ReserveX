import apiClient from './client';

export const bookingsApi = {
  createBookingHold: async (bookingData) => {
    // Expected: { eventId, items: [{ ticketTypeId, quantity }] }
    const res = await apiClient.post('/bookings', bookingData);
    return res.data;
  },
  getMyBookings: async (params) => {
    const res = await apiClient.get('/bookings/my', { params });
    return res.data;
  },
  getBookingById: async (id) => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },
  cancelBookingHold: async (id) => {
    const res = await apiClient.post(`/bookings/${id}/cancel`);
    return res.data;
  },
  getEventBookings: async (eventId, params) => {
    const res = await apiClient.get(`/events/${eventId}/bookings`, { params });
    return res.data;
  }
};
