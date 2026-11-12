require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startHoldCleanupJob } = require('./jobs/expireHolds.job');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().then(() => {
  // Start background hold cleanup job (every 60 seconds)
  startHoldCleanupJob(60000);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
