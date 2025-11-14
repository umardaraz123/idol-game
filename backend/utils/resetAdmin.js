import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    console.log('🔧 Resetting admin user...');
    
    await connectDB();

    // Delete existing admin
    await Admin.deleteOne({ email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com' });
    console.log('🗑️ Deleted existing admin user');

    // Create new admin (password will be hashed by pre-save hook)
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'idolbeadmin@idolbe.com',
      password: process.env.ADMIN_PASSWORD || 'theidol234',
      name: 'Idol Be Admin',
      role: 'admin',
      isActive: true,
      permissions: ['content_manage', 'user_manage', 'media_upload', 'system_config']
    });

    console.log('✅ Admin user recreated successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'theidol234'}`);
    console.log('\n🎉 You can now login to the admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin user:', error.message);
    process.exit(1);
  }
};

resetAdmin();
