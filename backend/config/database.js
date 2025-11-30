import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS servers to bypass local DNS issues with MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

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
      family: 4, // Force IPv4 - helps with DNS issues
      retryWrites: true,
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
    console.log('');
    console.log('🔧 TROUBLESHOOTING TIPS:');
    console.log('   1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.log('   2. Try using a mobile hotspot - your ISP may be blocking MongoDB DNS');
    console.log('   3. Get the standard connection string (not mongodb+srv://) from Atlas');
    console.log('   4. Change your DNS to Google (8.8.8.8) in Windows Network Settings');
    console.log('');
    // Don't exit - allow server to run without DB for testing
    // process.exit(1);
  }
};

export default connectDB;