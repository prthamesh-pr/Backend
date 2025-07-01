const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const createDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (only in development)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      console.log('Cleared existing users');
    }

    // Create demo admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@jivhalamotors.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin'
    });

    // Create demo regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = new User({
      username: 'dealer',
      email: 'dealer@jivhalamotors.com',
      password: userPassword,
      name: 'Vehicle Dealer',
      role: 'user'
    });

    await adminUser.save();
    await regularUser.save();

    console.log('Demo users created successfully!');
    console.log('');
    console.log('Admin Login:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('Dealer Login:');
    console.log('  Username: dealer');
    console.log('  Password: user123');
    console.log('');

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDemoUsers();
