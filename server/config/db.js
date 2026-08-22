const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Uses the MONGODB_URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 8+ handles these options automatically,
      // but we keep them explicit for clarity
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure code - let process manager restart
    process.exit(1);
  }
};

module.exports = connectDB;
