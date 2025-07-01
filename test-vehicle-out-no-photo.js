const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const VEHICLE_ID = '6863b58cad5566d7aba21e4e';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function testVehicleOutNoPhoto() {
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
    
    // Test data
    const testData = {
      buyerName: 'Test Buyer',
      address: 'Test Address',
      mobileNo: '9876543210',
      price: 50000,
      rtoCharges: 5000,
      commission: 2000,
      token: 10000,
      receivedPrice: 40000,
      balance: 3000,
      aadharCard: '123456789012',
      panCard: '',
      dlNumber: '',
      idProofType: 'Aadhaar'
    };

    console.log('🚗 Testing vehicle out API without photo...');

    // Make the API call
    const response = await axios.post(
      `${BASE_URL}/api/vehicles/${VEHICLE_ID}/out`,
      testData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Vehicle out successful!');
    console.log('Response:', response.data.message);
    console.log('Vehicle Status:', response.data.vehicle.status);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.message || error.message);
    console.log('Error Code:', error.response?.data?.error);
    
    if (error.response?.data?.errors) {
      console.log('Validation Errors:', error.response.data.errors);
    }
  }
}

testVehicleOutNoPhoto();
