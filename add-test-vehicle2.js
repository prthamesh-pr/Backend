const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function addAnotherTestVehicle() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, DEMO_USER);
    
    if (!loginResponse.data.token) {
      console.log('❌ Login failed');
      return;
    }
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Vehicle data
    const vehicleData = {
      vehicleInDate: new Date().toISOString().split('T')[0],
      vehicleNumber: 'TEST456',
      vehicleHP: '25 HP',
      chassisNo: 'TEST456789012345678',
      engineNo: 'TESTENG456789012',
      vehicleName: 'Test Vehicle 2',
      modelYear: 2023,
      ownerName: 'Test Owner 2',
      ownerType: '1st',
      mobileNo: '8888888888',
      insuranceDate: new Date().toISOString().split('T')[0],
      challan: 'TEST002',
      hasRC: true,
      hasPUC: true,
      hasNOC: false
    };

    console.log('🚗 Adding another test vehicle...');
    const response = await axios.post(
      `${BASE_URL}/api/vehicles/in`,
      vehicleData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Test vehicle 2 added successfully');
    console.log('Vehicle ID:', response.data.vehicle._id);
    console.log('Vehicle Number:', response.data.vehicle.vehicleNumber);
    
  } catch (error) {
    console.log('❌ Error adding test vehicle:');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data?.message || error.message);
  }
}

addAnotherTestVehicle();
