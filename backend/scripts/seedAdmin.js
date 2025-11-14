import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/idolbe');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com' 
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com',
      password: process.env.ADMIN_PASSWORD || 'theidol234',
      name: 'Idol Be Admin',
      role: 'super_admin',
      permissions: ['content_manage', 'user_manage', 'media_upload', 'system_config'],
      isActive: true
    });

    await admin.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password:', process.env.ADMIN_PASSWORD || 'theidol234');
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🛠️ Permissions:', admin.permissions);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 Admin user with this email already exists');
    }
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
console.log('🌱 Starting admin user seed...');
seedAdmin();