const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function findAvailableVehicle() {
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
    
    // Get all vehicles
    const response = await axios.get(`${BASE_URL}/api/vehicles`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('🚗 Found', response.data.vehicles.length, 'vehicles');
    
    // Find vehicles with status 'in'
    const availableVehicles = response.data.vehicles.filter(v => v.status === 'in');
    
    console.log('🟢 Available vehicles (status: in):');
    availableVehicles.forEach(v => {
      console.log(`- ${v._id}: ${v.vehicleNumber} (${v.vehicleName})`);
    });
    
    console.log('🔴 Already sold vehicles (status: out):');
    const soldVehicles = response.data.vehicles.filter(v => v.status === 'out');
    soldVehicles.forEach(v => {
      console.log(`- ${v._id}: ${v.vehicleNumber} (${v.vehicleName})`);
    });
    
  } catch (error) {
    console.log('❌ Error occurred:', error.response?.data?.message || error.message);
  }
}

findAvailableVehicle();
