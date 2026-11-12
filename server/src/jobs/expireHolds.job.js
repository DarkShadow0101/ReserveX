const { cleanupExpiredHolds } = require('../services/booking.service');

let intervalId = null;

// Starts recurring background job to clean up expired booking holds
function startHoldCleanupJob(intervalMs = 60000) {
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      const result = await cleanupExpiredHolds();
      if (result.expiredCount > 0) {
        console.log(`[expireHoldsJob] Cleaned up ${result.expiredCount} expired booking hold(s).`);
      }
    } catch (err) {
      console.error('[expireHoldsJob] Error releasing expired holds:', err.message);
    }
  }, intervalMs);
}

function stopHoldCleanupJob() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = {
  startHoldCleanupJob,
  stopHoldCleanupJob,
  runCleanupNow: cleanupExpiredHolds
};
