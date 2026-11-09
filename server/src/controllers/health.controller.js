// Controller function for health check
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ReserveX API is healthy and running',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
