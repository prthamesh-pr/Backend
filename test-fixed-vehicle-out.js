const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const VEHICLE_ID = '6863b63cafde8efa1bb6555d';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function testFixedVehicleOut() {
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
    
    // Create form data like the mobile app would send
    const formData = new FormData();
    formData.append('buyerName', 'Test Buyer');
    formData.append('address', 'Test Address');
    formData.append('mobileNo', '9876543210');
    formData.append('price', '50000');
    formData.append('rtoCharges', '5000');
    formData.append('commission', '2000');
    formData.append('token', '10000');
    formData.append('receivedPrice', '40000');
    formData.append('balance', '3000');
    formData.append('aadharCard', '123456789012');
    formData.append('panCard', '');
    formData.append('dlNumber', '');
    formData.append('idProofType', 'Aadhaar');
    
    // Try with a valid image first
    const photoPath = path.join(__dirname, 'uploads', 'vehicles', 'photos-1751351698214-254301451.jpg');
    if (fs.existsSync(photoPath)) {
      formData.append('buyerPhoto', fs.createReadStream(photoPath), 'test_buyer_photo.jpg');
      console.log('📷 Adding valid image file');
    } else {
      console.log('📷 No photo found, testing without photo');
    }

    console.log('🚗 Testing vehicle out API with fixed error handling...');

    // Make the API call
    const response = await axios.post(
      `${BASE_URL}/api/vehicles/${VEHICLE_ID}/out`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData.getHeaders()
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

testFixedVehicleOut();
