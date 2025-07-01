const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Demo users with different roles
const DEMO_USERS = [
  {
    username: 'admin',
    email: 'admin@jivhalamotors.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    username: 'demo',
    email: 'demo@jivhalamotors.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user'
  },
  {
    username: 'testuser',
    email: 'test@jivhalamotors.com',
    password: 'test123',
    name: 'Test User',
    role: 'user'
  }
];

async function addDemoUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jivhala_motors';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Adding demo users...');
    console.log('===================');

    for (const userData of DEMO_USERS) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.username} already exists, skipping...`);
          continue;
        }

        // Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isActive: true
        });

        await user.save();
        console.log(`✅ Created user: ${userData.username} (${userData.role})`);

      } catch (userError) {
        console.error(`❌ Error creating user ${userData.username}:`, userError.message);
      }
    }

    console.log('');
    console.log('Demo Users Created:');
    console.log('==================');
    
    for (const user of DEMO_USERS) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    }

    console.log('');
    console.log('Testing Information:');
    console.log('===================');
    console.log('Login endpoint: POST http://localhost:3000/api/auth/login');
    console.log('');
    console.log('Example request body (using admin):');
    console.log(JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }, null, 2));
    console.log('');
    console.log('Example request body (using demo user):');
    console.log(JSON.stringify({
      username: 'demo',
      password: 'demo123'
    }, null, 2));

  } catch (error) {
    console.error('Error setting up demo users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('');
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addDemoUsers();
