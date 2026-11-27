/**
 * Startup Environment Validation
 *
 * Industry best practice ("Fail Fast"):
 * Validate critical secrets and connection strings at process boot rather than
 * letting the app crash unpredictably when the first user hits checkout or auth.
 */
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'QR_SIGNING_SECRET'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. Check server/.env or host environment config.`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('[env] Warning: JWT_SECRET should be at least 32 characters in production.');
    }

    const razorpayMissing = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'].filter(
      (key) => !process.env[key]?.trim()
    );
    if (razorpayMissing.length > 0) {
      console.warn(
        `[env] Warning: Payment gateway variable(s) missing (${razorpayMissing.join(', ')}). Checkout/webhooks will fail until set.`
      );
    }
  }
}

module.exports = {
  validateEnv
};
