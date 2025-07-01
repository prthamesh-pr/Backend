#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

async function validateDatabase() {
  log(colors.blue, '🔍 Validating Database Connection...\n');

  // Check environment variables
  if (!process.env.MONGODB_URI) {
    log(colors.red, '❌ MONGODB_URI is not set in environment variables');
    log(colors.yellow, '   Please check your .env file');
    process.exit(1);
  }

  log(colors.cyan, `📍 MongoDB URI: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✅ Successfully connected to MongoDB');

    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    log(colors.cyan, `📚 Database: ${dbName}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(colors.cyan, `📋 Collections found: ${collections.length}`);
    
    collections.forEach(col => {
      log(colors.cyan, `   - ${col.name}`);
    });

    // Test basic operations
    log(colors.blue, '\n🧪 Testing basic operations...');
    
    // Check if we can perform basic operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    const testDoc = await testCollection.findOne({ test: true });
    await testCollection.deleteOne({ test: true });
    
    if (testDoc) {
      log(colors.green, '✅ Read/Write operations working correctly');
    }

    // Check indexes
    log(colors.blue, '\n📊 Checking indexes...');
    
    try {
      const User = require('../models/User');
      const Vehicle = require('../models/Vehicle');
      
      const userIndexes = await User.collection.getIndexes();
      const vehicleIndexes = await Vehicle.collection.getIndexes();
      
      log(colors.cyan, `User indexes: ${Object.keys(userIndexes).length}`);
      log(colors.cyan, `Vehicle indexes: ${Object.keys(vehicleIndexes).length}`);
    } catch (modelError) {
      log(colors.yellow, '⚠️  Could not load models for index checking');
      log(colors.cyan, '   This is normal if models don\'t exist yet');
    }

    log(colors.green, '\n🎉 Database validation completed successfully!');
    log(colors.blue, '\n💡 Your database is ready for use.');

  } catch (error) {
    log(colors.red, '❌ Database connection failed:');
    log(colors.red, `   ${error.message}`);
    
    if (error.message.includes('IP')) {
      log(colors.yellow, '\n🔧 SOLUTION: IP Whitelist Issue');
      log(colors.yellow, '   1. Go to MongoDB Atlas Dashboard');
      log(colors.yellow, '   2. Navigate to Network Access');
      log(colors.yellow, '   3. Add your current IP address');
      log(colors.yellow, '   4. Or use 0.0.0.0/0 for development (not recommended for production)');
    } else if (error.message.includes('authentication')) {
      log(colors.yellow, '\n🔧 SOLUTION: Authentication Issue');
      log(colors.yellow, '   1. Check your username and password in .env file');
      log(colors.yellow, '   2. Ensure the database user exists in MongoDB Atlas');
      log(colors.yellow, '   3. Verify user permissions (readWrite on the database)');
    } else if (error.message.includes('timeout')) {
      log(colors.yellow, '\n🔧 SOLUTION: Connection Timeout');
      log(colors.yellow, '   1. Check your internet connection');
      log(colors.yellow, '   2. Verify MongoDB Atlas cluster is running');
      log(colors.yellow, '   3. Check if firewall is blocking the connection');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run validation
validateDatabase().catch(error => {
  log(colors.red, `Unexpected error: ${error.message}`);
  process.exit(1);
});
