const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Demo user credentials
const DEMO_USER = {
  username: 'demo',
  email: 'demo@jivhalamotors.com',
  password: 'demo123',
  name: 'Demo User',
  role: 'admin'
};

async function addDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jivhala_motors';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: DEMO_USER.email },
        { username: DEMO_USER.username }
      ]
    });

    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Credentials:');
      console.log('Username/Email:', DEMO_USER.username, 'or', DEMO_USER.email);
      console.log('Password:', DEMO_USER.password);
      process.exit(0);
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, saltRounds);

    // Create demo user
    const demoUser = new User({
      username: DEMO_USER.username,
      email: DEMO_USER.email,
      password: hashedPassword,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
      isActive: true
    });

    await demoUser.save();

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('Demo User Credentials:');
    console.log('=====================');
    console.log('Username:', DEMO_USER.username);
    console.log('Email:', DEMO_USER.email);
    console.log('Password:', DEMO_USER.password);
    console.log('Role:', DEMO_USER.role);
    console.log('');
    console.log('You can now use these credentials to:');
    console.log('1. Test login via Postman');
    console.log('2. Test login via the mobile app');
    console.log('');
    console.log('Login endpoint: POST http://localhost:3000/api/auth/login');
    console.log('Request body:');
    console.log(JSON.stringify({
      username: DEMO_USER.username,
      password: DEMO_USER.password
    }, null, 2));

  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addDemoUser();
