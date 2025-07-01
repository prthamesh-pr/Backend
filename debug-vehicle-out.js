const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const VEHICLE_ID = '686385ac5c0f46489825dcfd';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function debugVehicleOut() {
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
    
    // Test data matching the error log
    const testData = {
      buyerName: 'eg',
      address: 'egw',
      mobileNo: '9850264710',
      price: 10000,
      rtoCharges: 2344,
      commission: 5000,
      token: 2344,
      receivedPrice: 234,
      balance: 14766,
      aadharCard: '401901507631',
      panCard: '',
      dlNumber: '',
      idProofType: 'Aadhaar'
    };

    console.log('🚗 Testing vehicle out API with vehicle ID:', VEHICLE_ID);
    console.log('📝 Test data:', testData);

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

    console.log('✅ Vehicle out successful:', response.data);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.message || error.message);
    console.log('Error Details:', error.response?.data?.error);
    
    if (error.response?.data?.errors) {
      console.log('Validation Errors:', error.response.data.errors);
    }
  }
}

debugVehicleOut();
