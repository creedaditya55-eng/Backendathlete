const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Please check your MongoDB IP Whitelist in Atlas.');
    // process.exit(1); // Keep server running for dev
  }
};

module.exports = connectDB;
