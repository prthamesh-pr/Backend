const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

async function addAnotherTestVehicleForError() {
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
      vehicleNumber: 'TEST789',
      vehicleHP: '30 HP',
      chassisNo: 'TEST789012345678901',
      engineNo: 'TESTENG789012345',
      vehicleName: 'Test Vehicle 3',
      modelYear: 2024,
      ownerName: 'Test Owner 3',
      ownerType: '1st',
      mobileNo: '7777777777',
      insuranceDate: new Date().toISOString().split('T')[0],
      challan: 'TEST003',
      hasRC: true,
      hasPUC: true,
      hasNOC: false
    };

    console.log('🚗 Adding test vehicle for error testing...');
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

    console.log('✅ Test vehicle 3 added successfully');
    console.log('Vehicle ID:', response.data.vehicle._id);
    
    return response.data.vehicle._id;
    
  } catch (error) {
    console.log('❌ Error adding test vehicle:');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testInvalidFileUpload() {
  const vehicleId = await addAnotherTestVehicleForError();
  if (!vehicleId) return;

  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, DEMO_USER);
    const authToken = loginResponse.data.token;
    
    // Create a text file to simulate invalid file upload
    const invalidFileContent = 'This is not an image file';
    fs.writeFileSync('test_invalid_file.txt', invalidFileContent);
    
    const formData = new FormData();
    formData.append('buyerName', 'Test Buyer Invalid');
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
    
    // Add the invalid file
    formData.append('buyerPhoto', fs.createReadStream('test_invalid_file.txt'), 'invalid_file.txt');
    
    console.log('🧪 Testing with invalid file type...');
    
    const response = await axios.post(
      `${BASE_URL}/api/vehicles/${vehicleId}/out`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      }
    );

    console.log('❓ Unexpected success - this should have failed');
    
  } catch (error) {
    console.log('✅ Expected error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data?.message);
    console.log('Error Code:', error.response?.data?.error);
    
    // This is the expected behavior - proper error handling
    if (error.response?.status === 400 && 
        error.response?.data?.error === 'INVALID_FILE_TYPE') {
      console.log('🎉 Perfect! The API properly handled the invalid file type.');
    }
  } finally {
    // Clean up the test file
    try {
      fs.unlinkSync('test_invalid_file.txt');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testInvalidFileUpload();
