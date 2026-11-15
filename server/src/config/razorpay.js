const Razorpay = require('razorpay');

let razorpayInstance = null;

function getRazorpayInstance() {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_reservex_local';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'reservex_rzp_secret_local_test';

    razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }
  return razorpayInstance;
}

module.exports = {
  getRazorpayInstance
};
