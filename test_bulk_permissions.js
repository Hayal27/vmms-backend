/**
 * Test script for bulk permissions insertion
 * Run with: node test_bulk_permissions.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://vmms.api.wingtechai.com/api';

// Test credentials - update these based on your setup
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function testBulkPermissions() {
  console.log('🧪 Starting bulk permissions test...\n');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.token) {
      throw new Error('No token received from login');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Prepare permissions data
    console.log('📝 Step 2: Preparing permissions data...');
    const permissions = [
      {
        role_id: 1,
        menu_item_id: 56,
        can_view: 1,
        can_create: 1,
        can_edit: 1,
        can_delete: 1,
        can_approve: 0,
        can_export: 0
      },
      {
        role_id: 1,
        menu_item_id: 57,
        can_view: 1,
        can_create: 1,
        can_edit: 1,
        can_delete: 1,
        can_approve: 0,
        can_export: 0
      },
      {
        role_id: 1,
        menu_item_id: 58,
        can_view: 1,
        can_create: 1,
        can_edit: 1,
        can_delete: 1,
        can_approve: 0,
        can_export: 0
      }
    ];
    console.log(`✅ Prepared ${permissions.length} permissions\n`);

    // Step 3: Send bulk insert request
    console.log('📝 Step 3: Sending bulk permissions request...');
    const response = await axios.post(
      `${API_BASE_URL}/menu-permissions/bulk-permissions`,
      { permissions },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('✅ Bulk permissions processed successfully!');
    console.log('📊 Results:', JSON.stringify(response.data, null, 2));
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Make sure the backend is running on', API_BASE_URL);
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testBulkPermissions();
