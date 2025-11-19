/**
 * Setup Admin Permissions Script
 * Grants full permissions to role_id = 1 (Admin) for all menu items
 */

const mysql = require('mysql2/promise');
const AppConfig = require('./config/appConfig');

async function setupAdminPermissions() {
  let connection;
  
  try {
    // Create database connection using app config
    connection = await mysql.createConnection({
      host: AppConfig.database.host,
      user: AppConfig.database.user,
      password: AppConfig.database.password,
      database: AppConfig.database.database
    });

    console.log('✅ Connected to database');

    // Get all menu items
    const [menuItems] = await connection.execute('SELECT id, name, path FROM menu_items ORDER BY id');
    console.log(`📋 Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      console.log('⚠️  No menu items found');
      return;
    }

    // Clear existing admin permissions
    const [deleteResult] = await connection.execute('DELETE FROM role_permissions WHERE role_id = 1');
    console.log(`🧹 Cleared ${deleteResult.affectedRows} existing admin permissions`);

    // Insert full permissions for all menu items
    const values = menuItems.map(item => [1, item.id, 1, 1, 1, 1]);
    
    const insertSQL = `
      INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
      VALUES ?
    `;

    const [insertResult] = await connection.query(insertSQL, [values]);
    console.log(`✅ Granted full permissions for ${insertResult.affectedRows} menu items`);

    // Verify permissions were created
    const [verifyResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1'
    );
    console.log(`✅ Verified: Admin now has ${verifyResult[0].count} menu permissions`);

    // Show some sample menu items with permissions
    console.log('\n📊 Sample menu items granted to Admin:');
    menuItems.slice(0, 5).forEach(item => {
      console.log(`   ✓ ${item.name} (${item.path})`);
    });
    if (menuItems.length > 5) {
      console.log(`   ... and ${menuItems.length - 5} more`);
    }

    console.log('\n🎉 Admin permissions setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up admin permissions:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupAdminPermissions()
  .then(() => {
    console.log('\n✅ Setup completed. You can now login as admin with full access.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
