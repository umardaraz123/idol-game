import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

dotenv.config();

const testLogin = async () => {
  try {
    await connectDB();

    const email = 'idolbeadmin@idolbe.com';
    const password = 'theidol234';

    console.log('🔍 Testing login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      process.exit(1);
    }

    console.log('✅ Admin found:');
    console.log('- ID:', admin._id);
    console.log('- Email:', admin.email);
    console.log('- Name:', admin.name);
    console.log('- Role:', admin.role);
    console.log('- Active:', admin.isActive);
    console.log('- Permissions:', admin.permissions);
    console.log('');

    // Test password
    const isMatch = await admin.comparePassword(password);
    console.log('🔑 Password test:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
    
    if (!isMatch) {
      console.log('');
      console.log('Stored password hash:', admin.password.substring(0, 20) + '...');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
