const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Jivhala Motors Backend...');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Create vehicles subdirectory
const vehiclesDir = path.join(uploadsDir, 'vehicles');
if (!fs.existsSync(vehiclesDir)) {
  fs.mkdirSync(vehiclesDir, { recursive: true });
  console.log('✅ Created vehicles uploads directory');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory');
}

// Check if .env file exists
const envFile = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envFile)) {
  const envExample = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log('✅ Created .env file from example');
    console.log('⚠️  Please update your .env file with actual values');
  }
}

console.log('🚀 Backend setup complete!');
console.log('\nNext steps:');
console.log('1. Update your .env file with actual database and email credentials');
console.log('2. Install MongoDB locally or set up MongoDB Atlas');
console.log('3. Run "npm run dev" to start development server');
