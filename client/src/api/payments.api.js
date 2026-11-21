import apiClient from './client';

export const paymentsApi = {
  createPaymentOrder: async (bookingId) => {
    // Expected: { bookingId }
    const res = await apiClient.post('/payments/create-order', { bookingId });
    return res.data;
  },
  verifyPayment: async (verificationData) => {
    // Expected: { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
    const res = await apiClient.post('/payments/verify', verificationData);
    return res.data;
  }
};
