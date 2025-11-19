import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idolbe';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for initial connection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📊 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;