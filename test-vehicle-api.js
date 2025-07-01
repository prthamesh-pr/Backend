const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Demo credentials (from DEMO_CREDENTIALS.md)
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// Sample vehicle data for testing
const sampleVehicleData = {
  vehicleInDate: '2025-01-01',
  vehicleNumber: 'GJ01AB1234',
  vehicleHP: '15 HP',
  chassisNo: 'MB1234567890123456',
  engineNo: 'ENG123456789',
  vehicleName: 'Maruti Suzuki Swift',
  modelYear: '2020',
  ownerName: 'Rajesh Kumar Patel',
  ownerType: '1st',
  mobileNo: '9876543210',
  insuranceDate: '2025-12-31',
  challan: 'CH001',
  RC: 'true',
  PUC: 'true',
  NOC: 'false'
};

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, DEMO_USER);
    
    if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log('👤 User:', response.data.user.name);
      return true;
    } else {
      console.log('❌ Login failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAddVehicle() {
  try {
    console.log('\\n🚗 Testing Add Vehicle...');
    
    const formData = new FormData();
    
    // Add all vehicle data to form
    Object.keys(sampleVehicleData).forEach(key => {
      formData.append(key, sampleVehicleData[key]);
    });
    
    // Create a dummy image file for testing (if it doesn't exist)
    const dummyImagePath = path.join(__dirname, 'test-vehicle.jpg');
    if (!fs.existsSync(dummyImagePath)) {
      // Create a small dummy file for testing
      fs.writeFileSync(dummyImagePath, 'dummy image data for testing');
    }
    
    // Add photo if file exists
    if (fs.existsSync(dummyImagePath)) {
      formData.append('photos', fs.createReadStream(dummyImagePath));
    }
    
    const response = await axios.post(
      `${BASE_URL}/api/vehicles/in`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      }
    );
    
    if (response.data.vehicle) {
      console.log('✅ Vehicle added successfully');
      console.log('🆔 Vehicle ID:', response.data.vehicle._id);
      console.log('🚗 Vehicle Number:', response.data.vehicle.vehicleNumber);
      console.log('📋 Unique ID:', response.data.vehicle.uniqueId);
      console.log('📸 Photos uploaded:', response.data.vehicle.photos.length);
      
      // Test getting the vehicle
      await testGetVehicle(response.data.vehicle._id);
      
      return response.data.vehicle;
    } else {
      console.log('❌ Vehicle creation failed - no vehicle data returned');
      return null;
    }
  } catch (error) {
    console.log('❌ Add vehicle failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message || error.response.data);
      if (error.response.data.errors) {
        console.log('   Validation Errors:');
        error.response.data.errors.forEach(err => {
          console.log(`     - ${err.msg || err.message}: ${err.param || err.field}`);
        });
      }
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

async function testGetVehicle(vehicleId) {
  try {
    console.log('\\n📖 Testing Get Vehicle...');
    
    const response = await axios.get(
      `${BASE_URL}/api/vehicles/${vehicleId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.vehicle) {
      console.log('✅ Vehicle retrieved successfully');
      console.log('🚗 Vehicle:', response.data.vehicle.vehicleNumber);
      console.log('👤 Owner:', response.data.vehicle.ownerName);
      console.log('📄 Documents:', JSON.stringify(response.data.vehicle.documents));
      return response.data.vehicle;
    } else {
      console.log('❌ Vehicle retrieval failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Get vehicle failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetAllVehicles() {
  try {
    console.log('\\n📋 Testing Get All Vehicles...');
    
    const response = await axios.get(
      `${BASE_URL}/api/vehicles`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.vehicles) {
      console.log('✅ Vehicles list retrieved successfully');
      console.log('📊 Total vehicles:', response.data.vehicles.length);
      console.log('📄 Pagination:', JSON.stringify(response.data.pagination));
      
      if (response.data.vehicles.length > 0) {
        console.log('🚗 Latest vehicle:', response.data.vehicles[0].vehicleNumber);
      }
      
      return response.data.vehicles;
    } else {
      console.log('❌ Vehicles list retrieval failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Get vehicles failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Jivhala Motors API Tests\\n');
  console.log('🎯 Testing Add Vehicle functionality\\n');
  
  // Test 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test 2: Add Vehicle
  const vehicle = await testAddVehicle();
  if (!vehicle) {
    console.log('\\n❌ Add vehicle test failed');
  }
  
  // Test 3: Get All Vehicles
  await testGetAllVehicles();
  
  console.log('\\n🏁 Tests completed');
  
  // Cleanup test file
  const testFile = path.join(__dirname, 'test-vehicle.jpg');
  if (fs.existsSync(testFile)) {
    try {
      fs.unlinkSync(testFile);
      console.log('🧹 Cleaned up test files');
    } catch (err) {
      console.log('⚠️  Could not clean up test file:', err.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testAddVehicle,
  testGetVehicle,
  testGetAllVehicles,
  login
};
