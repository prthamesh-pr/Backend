const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const DEMO_USER = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// Sample buyer data for testing vehicle out
const sampleBuyerData = {
  buyerName: 'Test Buyer',
  address: 'Test Address, Test City',
  mobileNo: '9876543210',
  price: '50000',
  rtoCharges: '5000',
  commission: '2000',
  token: '10000',
  receivedPrice: '40000',
  balance: '7000',
  aadharCard: '123456789012',
  panCard: 'ABCDE1234F',
  dlNumber: 'DL1234567890123',
  idProofType: 'Aadhaar'
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

async function getVehicles() {
  try {
    console.log('\n📋 Getting vehicles...');
    
    const response = await axios.get(
      `${BASE_URL}/api/vehicles`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.vehicles && response.data.vehicles.length > 0) {
      console.log(`✅ Found ${response.data.vehicles.length} vehicles`);
      
      // Find a vehicle that is 'in' status
      const vehicleIn = response.data.vehicles.find(v => v.status === 'in');
      if (vehicleIn) {
        console.log(`🚗 Found vehicle to test: ${vehicleIn.vehicleNumber} (ID: ${vehicleIn._id})`);
        return vehicleIn;
      } else {
        console.log('⚠️  No vehicles with "in" status found');
        return response.data.vehicles[0]; // Return first vehicle anyway for testing
      }
    } else {
      console.log('❌ No vehicles found');
      return null;
    }
  } catch (error) {
    console.log('❌ Get vehicles failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testVehicleOut(vehicleId) {
  try {
    console.log(`\n🚗 Testing Vehicle Out for vehicle ID: ${vehicleId}...`);
    
    const formData = new FormData();
    
    // Add all buyer data to form
    Object.keys(sampleBuyerData).forEach(key => {
      formData.append(key, sampleBuyerData[key]);
    });
    
    console.log('📝 Buyer data being sent:');
    Object.keys(sampleBuyerData).forEach(key => {
      console.log(`   ${key}: ${sampleBuyerData[key]}`);
    });
    
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
    
    if (response.data.vehicle) {
      console.log('✅ Vehicle marked out successfully');
      console.log('🚗 Vehicle:', response.data.vehicle.vehicleNumber);
      console.log('👤 Buyer:', response.data.vehicle.buyer.buyerName);
      console.log('💰 Price:', response.data.vehicle.buyer.price);
      console.log('📄 Status:', response.data.vehicle.status);
      console.log('📅 Out Date:', response.data.vehicle.outDate);
      return response.data.vehicle;
    } else {
      console.log('❌ Vehicle out failed - no vehicle data returned');
      return null;
    }
  } catch (error) {
    console.log('❌ Vehicle out failed:');
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

async function runTests() {
  console.log('🧪 Starting Vehicle Out API Tests...\n');
  
  try {
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without login');
      return;
    }
    
    // Step 2: Get vehicles
    const vehicle = await getVehicles();
    if (!vehicle) {
      console.log('❌ Cannot proceed without vehicles');
      return;
    }
    
    // Step 3: Test vehicle out
    const vehicleOut = await testVehicleOut(vehicle._id);
    
    if (vehicleOut) {
      console.log('\n🎉 All tests completed successfully!');
    } else {
      console.log('\n❌ Vehicle out test failed');
    }
    
  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }
}

// Run the tests
runTests();
