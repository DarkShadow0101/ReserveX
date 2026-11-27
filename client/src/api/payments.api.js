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
  },
  completeDemoPayment: async (demoData) => {
    // Non-production sandbox fallback confirmation for order_test_* orders
    const res = await apiClient.post('/payments/demo-complete', demoData);
    return res.data;
  }
};
