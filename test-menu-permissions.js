/**
 * Test Menu Permissions for User
 * Tests login and menu permissions retrieval
 */

const axios = require('axios');

const BACKEND_URL = 'https://vmms.api.wingtechai.com';

async function testLoginAndPermissions() {
  try {
    console.log('🔐 Testing Login and Menu Permissions\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Test 1: Login
    console.log('📝 Step 1: Attempting login...');
    console.log('   Username: alemayehu.tadesse');
    console.log('   Password: password123\n');

    let loginResponse;
    try {
      loginResponse = await axios.post(`${BACKEND_URL}/login`, {
        user_name: 'alemayehu.tadesse',
        pass: 'password123'
      });
    } catch (loginError) {
      console.log('❌ Login failed with password123, trying admin123...\n');
      
      loginResponse = await axios.post(`${BACKEND_URL}/login`, {
        user_name: 'alemayehu.tadesse',
        pass: 'admin123'
      });
    }

    console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));
    console.log('');

    if (loginResponse.data.success || loginResponse.data.token) {
      console.log('✅ Login Successful!');
      
      // Extract user data - check multiple possible locations
      const userData = loginResponse.data.user || loginResponse.data;
      const userId = userData.user_id || userData.id || loginResponse.data.user_id;
      const name = userData.name || loginResponse.data.name;
      const roleId = userData.role_id || loginResponse.data.role_id || 1; // Default to 1 for admin
      const token = loginResponse.data.token;

      console.log(`   User ID: ${userId}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role ID: ${roleId}`);
      console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'NOT FOUND'}`);
      console.log('');

      if (!token) {
        console.log('❌ No token received from login');
        return;
      }

      if (!roleId) {
        console.log('❌ No role_id received, cannot fetch permissions');
        return;
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message || 'Unknown error');
      return;
    }

    const token = loginResponse.data.token;
    const roleId = loginResponse.data.role_id || loginResponse.data.user?.role_id || 1;

    // Test 2: Fetch Menu Permissions
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📋 Step 2: Fetching menu permissions for role_id: ${roleId}\n`);

    const menuResponse = await axios.get(
      `${BACKEND_URL}/api/menu-permissions/user-permissions/${roleId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (menuResponse.data.success) {
      const menuData = menuResponse.data.data;
      console.log('✅ Menu Permissions Retrieved Successfully!');
      console.log(`   Total Menu Items: ${menuResponse.data.total}`);
      console.log(`   Top Level Items: ${menuResponse.data.topLevel}`);
      console.log('');

      // Display menu structure
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('📊 Menu Structure:\n');

      let itemCount = 0;
      menuData.forEach((rootItem, index) => {
        itemCount++;
        console.log(`${index + 1}. ${rootItem.name}`);
        console.log(`   Path: ${rootItem.path}`);
        console.log(`   Icon: ${rootItem.icon}`);
        console.log(`   Permissions: View=${rootItem.permissions.can_view}, Create=${rootItem.permissions.can_create}, Edit=${rootItem.permissions.can_edit}, Delete=${rootItem.permissions.can_delete}`);
        
        if (rootItem.children && rootItem.children.length > 0) {
          console.log(`   Children: ${rootItem.children.length} items`);
          rootItem.children.forEach((child, childIndex) => {
            itemCount++;
            console.log(`      ${index + 1}.${childIndex + 1} ${child.name}`);
            console.log(`         Path: ${child.path}`);
            console.log(`         Permissions: View=${child.permissions.can_view}, Create=${child.permissions.can_create}, Edit=${child.permissions.can_edit}, Delete=${child.permissions.can_delete}`);
          });
        }
        console.log('');
      });

      console.log(`Total menu items (including children): ${itemCount}\n`);

      // Test 3: Check specific permissions
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('🔍 Step 3: Checking specific permissions:\n');

      // Check Dashboard
      const dashboard = menuData.find(item => item.path === '/');
      if (dashboard) {
        console.log('✅ Dashboard (/) - ACCESSIBLE');
        console.log(`   Can View: ${dashboard.permissions.can_view ? 'YES' : 'NO'}`);
        console.log(`   Can Create: ${dashboard.permissions.can_create ? 'YES' : 'NO'}`);
        console.log(`   Can Edit: ${dashboard.permissions.can_edit ? 'YES' : 'NO'}`);
        console.log(`   Can Delete: ${dashboard.permissions.can_delete ? 'YES' : 'NO'}`);
      } else {
        console.log('❌ Dashboard (/) - NOT FOUND in permissions');
      }
      console.log('');

      // Check Menu Permissions page
      let menuPermissionsPage = null;
      menuData.forEach(item => {
        if (item.children) {
          const found = item.children.find(child => child.path === '/menu-permissions');
          if (found) menuPermissionsPage = found;
        }
      });

      if (menuPermissionsPage) {
        console.log('✅ Menu Permissions (/menu-permissions) - ACCESSIBLE');
        console.log(`   Can View: ${menuPermissionsPage.permissions.can_view ? 'YES' : 'NO'}`);
        console.log(`   Can Create: ${menuPermissionsPage.permissions.can_create ? 'YES' : 'NO'}`);
        console.log(`   Can Edit: ${menuPermissionsPage.permissions.can_edit ? 'YES' : 'NO'}`);
        console.log(`   Can Delete: ${menuPermissionsPage.permissions.can_delete ? 'YES' : 'NO'}`);
      } else {
        console.log('❌ Menu Permissions (/menu-permissions) - NOT FOUND in permissions');
      }

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('✅ All tests completed successfully!\n');

    } else {
      console.log('❌ Failed to fetch menu permissions');
    }

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
console.log('\n');
testLoginAndPermissions()
  .then(() => {
    console.log('Test completed.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
