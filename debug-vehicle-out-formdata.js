const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const VEHICLE_ID = '686381926c653459d291d173';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function debugVehicleOutWithFormData() {
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
    formData.append('buyerName', 'eg');
    formData.append('address', 'egw');
    formData.append('mobileNo', '9850264710');
    formData.append('price', '10000');
    formData.append('rtoCharges', '2344');
    formData.append('commission', '5000');
    formData.append('token', '2344');
    formData.append('receivedPrice', '234');
    formData.append('balance', '14766');
    formData.append('aadharCard', '401901507631');
    formData.append('panCard', '');
    formData.append('dlNumber', '');
    formData.append('idProofType', 'Aadhaar');
    
    // Add a buyer photo (use an existing photo from uploads)
    const photoPath = path.join(__dirname, 'uploads', 'vehicles', 'photos-1751351698214-254301451.jpg');
    if (fs.existsSync(photoPath)) {
      formData.append('buyerPhoto', fs.createReadStream(photoPath), 'scaled_F350 copy 2.jpg');
      console.log('📷 Adding buyer photo from:', photoPath);
    } else {
      console.log('📷 No photo found, sending without photo');
    }

    console.log('🚗 Testing vehicle out API with FORM DATA for vehicle ID:', VEHICLE_ID);

    // Make the API call with form data
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

debugVehicleOutWithFormData();
