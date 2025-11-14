import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com' 
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create new admin (password will be hashed by pre-save hook)
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com',
      password: process.env.ADMIN_PASSWORD || 'theidol234',
      name: 'Idol Be Admin',
      role: 'admin',
      isActive: true,
      permissions: ['content_manage', 'user_manage', 'media_upload', 'system_config']
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'theidol234'}`);
    console.log('\n🎉 You can now login to the admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
