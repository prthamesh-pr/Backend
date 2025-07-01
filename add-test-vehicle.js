const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function addTestVehicle() {
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
      vehicleNumber: 'TEST123',
      vehicleHP: '20 HP',
      chassisNo: 'TEST123456789012345',
      engineNo: 'TESTENG123456789',
      vehicleName: 'Test Vehicle',
      modelYear: 2022,
      ownerName: 'Test Owner',
      ownerType: '1st',
      mobileNo: '9999999999',
      insuranceDate: new Date().toISOString().split('T')[0],
      challan: 'TEST001',
      hasRC: true,
      hasPUC: true,
      hasNOC: false
    };

    console.log('🚗 Adding test vehicle...');
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

    console.log('✅ Test vehicle added successfully');
    console.log('Vehicle ID:', response.data.vehicle._id);
    console.log('Vehicle Number:', response.data.vehicle.vehicleNumber);
    
  } catch (error) {
    console.log('❌ Error adding test vehicle:');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data?.message || error.message);
  }
}

addTestVehicle();
