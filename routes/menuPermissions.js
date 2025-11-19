const express = require('express');
const router = express.Router();
const con = require("../models/db");

// Test endpoint to verify database connection and menu items
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 API: Testing database connection...');

    // Test basic connection
    const [connectionTest] = await con.execute('SELECT 1 as test');
    console.log('✅ API: Database connection successful:', connectionTest);

    // Test menu_items table
    const [menuItemsTest] = await con.execute('SELECT COUNT(*) as count FROM menu_items');
    console.log('✅ API: Menu items count:', menuItemsTest[0].count);

    // Test role_permissions table
    const [permissionsTest] = await con.execute('SELECT COUNT(*) as count FROM role_permissions');
    console.log('✅ API: Role permissions count:', permissionsTest[0].count);

    // Test specific role permissions
    const [roleTest] = await con.execute('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1');
    console.log('✅ API: Admin role permissions count:', roleTest[0].count);

    res.json({
      success: true,
      message: 'Database test successful',
      data: {
        connection: 'OK',
        menuItems: menuItemsTest[0].count,
        rolePermissions: permissionsTest[0].count,
        adminPermissions: roleTest[0].count
      }
    });
  } catch (error) {
    console.error('💥 API: Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});



// Get user menu permissions based on role_id
router.get('/user-permissions/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;

    console.log('🔍 API: Fetching menu permissions for role_id:', roleId);

    // Fixed query - INNER JOIN ensures we only get items with permissions
    const query = `
      SELECT
        mi.id,
        mi.name,
        mi.path,
        mi.icon,
        mi.parent_id,
        mi.sort_order,
        rp.can_view,
        rp.can_create,
        rp.can_edit,
        rp.can_delete
      FROM menu_items mi
      INNER JOIN role_permissions rp ON mi.id = rp.menu_item_id AND rp.role_id = ?
      WHERE mi.is_active = 1 AND rp.can_view = 1
      ORDER BY mi.sort_order ASC, mi.name ASC
    `;

    console.log('🔍 API: Executing query with role_id:', roleId);

    const [results] = await con.execute(query, [roleId]);

    console.log('📊 API: Query returned', results ? results.length : 0, 'results');

    if (!results || results.length === 0) {
      console.log('⚠️ API: No permissions found for role_id:', roleId);
      return res.json({
        success: true,
        data: [],
        total: 0,
        topLevel: 0,
        message: 'No menu permissions found for this role'
      });
    }

    // Organize menu items into hierarchical structure
    const menuItems = [];
    const menuMap = new Map();

    console.log('🔧 API: Processing results into hierarchical structure...');

    // First pass: create all menu items
    results.forEach(item => {
      const menuItem = {
        id: item.id,
        name: item.name,
        path: item.path,
        icon: item.icon,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        permissions: {
          can_view: item.can_view || 0,
          can_create: item.can_create || 0,
          can_edit: item.can_edit || 0,
          can_delete: item.can_delete || 0
        },
        children: []
      };
      menuMap.set(item.id, menuItem);
    });

    console.log('🔧 API: Created menu map with', menuMap.size, 'items');

    // Second pass: organize hierarchy
    menuMap.forEach(item => {
      if (item.parent_id === null) {
        menuItems.push(item);
        console.log('🔧 API: Added root item:', item.name);
      } else {
        const parent = menuMap.get(item.parent_id);
        if (parent) {
          parent.children.push(item);
          console.log('🔧 API: Added child item:', item.name, 'to parent:', parent.name);
        } else {
          console.warn('⚠️ API: Parent not found for item:', item.name, 'parent_id:', item.parent_id);
        }
      }
    });

    console.log('✅ API: Final menu structure created with', menuItems.length, 'root items');

    res.json({
      success: true,
      data: menuItems,
      total: results.length,
      topLevel: menuItems.length
    });
  } catch (error) {
    console.error('💥 API: Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions',
      error: error.message,
      roleId: req.params.roleId
    });
  }
});

// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const query = `
      SELECT id, name, path, icon, parent_id, sort_order, is_active
      FROM menu_items
      ORDER BY sort_order ASC, name ASC
    `;
    
    const [results] = await con.execute(query);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
});

// Get all roles with their permissions
router.get('/roles-permissions', async (req, res) => {
  try {
    const rolesQuery = `
      SELECT role_id, role_name, status
      FROM roles
      WHERE status = 1
      ORDER BY role_name ASC
    `;
    
    const [roles] = await con.execute(rolesQuery);

    const permissionsQuery = `
      SELECT
        rp.role_id,
        rp.menu_item_id,
        rp.can_view,
        rp.can_create,
        rp.can_edit,
        rp.can_delete,
        mi.name as menu_name,
        mi.path as menu_path,
        mi.icon as menu_icon
      FROM role_permissions rp
      JOIN menu_items mi ON rp.menu_item_id = mi.id
      WHERE mi.is_active = 1
      ORDER BY rp.role_id, mi.sort_order
    `;

    const [permissions] = await con.execute(permissionsQuery);

    // Group permissions by role
    const rolesWithPermissions = roles.map(role => ({
      ...role,
      permissions: permissions.filter(p => p.role_id === role.role_id)
    }));

    res.json({
      success: true,
      data: rolesWithPermissions
    });
  } catch (error) {
    console.error('Error fetching roles permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles permissions',
      error: error.message
    });
  }
});

// Update role permissions
router.put('/role-permissions/:roleId', async (req, res) => {
  const { roleId } = req.params;
  const { permissions } = req.body;

  console.log('🔄 API: Updating role permissions for role:', roleId);
  console.log('📝 API: Permissions data:', permissions);

  // Get a connection from the pool for transaction
  const connection = await con.getConnection();

  try {
    // Start transaction (use query for transaction control)
    await connection.query('START TRANSACTION');
    console.log('✅ API: Transaction started');

    try {
      // Delete existing permissions for this role
      await connection.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
      console.log('✅ API: Deleted existing permissions for role:', roleId);

      // Insert new permissions
      if (permissions && permissions.length > 0) {
        const insertQuery = `
          INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const permission of permissions) {
          await connection.execute(insertQuery, [
            roleId,
            permission.menu_item_id,
            permission.can_view ? 1 : 0,
            permission.can_create ? 1 : 0,
            permission.can_edit ? 1 : 0,
            permission.can_delete ? 1 : 0
          ]);
        }
        console.log(`✅ API: Inserted ${permissions.length} permissions for role:`, roleId);
      }

      // Commit transaction (use query for transaction control)
      await connection.query('COMMIT');
      console.log('✅ API: Transaction committed successfully');

      res.json({
        success: true,
        message: 'Role permissions updated successfully'
      });

    } catch (error) {
      // Rollback transaction on error (use query for transaction control)
      await connection.query('ROLLBACK');
      console.error('💥 API: Transaction rolled back due to error');
      throw error;
    }

  } catch (error) {
    console.error('💥 API: Failed to update role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role permissions',
      error: error.message
    });
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
});

// Add new menu item
router.post('/menu-items', async (req, res) => {
  try {
    const { name, path, icon, parent_id, sort_order } = req.body;

    console.log('➕ API: Creating new menu item:', { name, path, icon, parent_id, sort_order });

    // Validation
    if (!name || !path) {
      return res.status(400).json({
        success: false,
        message: 'Name and path are required fields'
      });
    }

    const query = `
      INSERT INTO menu_items (name, path, icon, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await con.execute(query, [
      name,
      path,
      icon || '',
      parent_id || null,
      sort_order || 1
    ]);

    console.log('✅ API: Menu item created successfully with ID:', result.insertId);
    res.json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        id: result.insertId,
        name: name,
        path: path,
        icon: icon,
        parent_id: parent_id,
        sort_order: sort_order
      }
    });
  } catch (error) {
    console.error('💥 API: Failed to create menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
});

// Update menu item
router.put('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, path, icon, parent_id, sort_order, is_active } = req.body;

    console.log('🔄 API: Updating menu item:', { id, name, path, icon, parent_id, sort_order, is_active });

    // Prepare parameters: when a field is not provided, pass null so COALESCE() keeps the existing column value
    const isActiveParam = typeof is_active === 'undefined' ? null : (is_active ? 1 : 0);
    const parentIdParam = typeof parent_id === 'undefined' ? null : parent_id;
    const sortOrderParam = typeof sort_order === 'undefined' ? null : sort_order;

    const query = `
      UPDATE menu_items
      SET name = COALESCE(?, name),
          path = COALESCE(?, path),
          icon = COALESCE(?, icon),
          parent_id = COALESCE(?, parent_id),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `;

    await con.execute(query, [
      name || null,
      path || null,
      icon || null,
      parentIdParam,
      sortOrderParam,
      isActiveParam,
      id
    ]);

    console.log('✅ API: Menu item updated successfully');
    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('💥 API: Failed to update menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// Delete menu item
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ API: Deleting menu item with ID:', id);

    // Check if menu item has children
    const [children] = await con.execute('SELECT COUNT(*) as count FROM menu_items WHERE parent_id = ?', [id]);

    if (children[0].count > 0) {
      console.log('⚠️ API: Cannot delete menu item with children');
      return res.status(400).json({
        success: false,
        message: 'Cannot delete menu item with children. Please delete children first.'
      });
    }

    // Delete menu item (this will also delete related permissions due to foreign key constraint)
    await con.execute('DELETE FROM menu_items WHERE id = ?', [id]);

    console.log('✅ API: Menu item deleted successfully');
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('💥 API: Failed to delete menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

// Get permission matrix (all roles vs all menu items)
router.get('/permission-matrix', async (req, res) => {
  try {
    const menuQuery = `
      SELECT id, name, path, icon, parent_id, sort_order, is_active
      FROM menu_items
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `;
    
    const rolesQuery = `
      SELECT role_id, role_name
      FROM roles
      WHERE status = 1
      ORDER BY role_name ASC
    `;
    
    const permissionsQuery = `
      SELECT role_id, menu_item_id, can_view, can_create, can_edit, can_delete
      FROM role_permissions
    `;
    
    // Execute all queries in parallel using Promise.all
    const [
      [menuItems],
      [roles],
      [permissions]
    ] = await Promise.all([
      con.execute(menuQuery),
      con.execute(rolesQuery),
      con.execute(permissionsQuery)
    ]);

    console.log(`📊 Permission Matrix: ${menuItems.length} menus, ${roles.length} roles, ${permissions.length} permissions`);

    // Create permission lookup map
    const permissionMap = new Map();
    permissions.forEach(p => {
      permissionMap.set(`${p.role_id}-${p.menu_item_id}`, p);
    });

    // Build matrix
    const matrix = {
      menuItems,
      roles,
      permissions: roles.map(role => ({
        role_id: role.role_id,
        role_name: role.role_name,
        menuPermissions: menuItems.map(menu => {
          const key = `${role.role_id}-${menu.id}`;
          const permission = permissionMap.get(key);
          return {
            menu_item_id: menu.id,
            menu_name: menu.name,
            can_view: permission ? permission.can_view : 0,
            can_create: permission ? permission.can_create : 0,
            can_edit: permission ? permission.can_edit : 0,
            can_delete: permission ? permission.can_delete : 0
          };
        })
      }))
    };

    res.json({
      success: true,
      data: matrix
    });
  } catch (error) {
    console.error('💥 API: Error fetching permission matrix:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permission matrix',
      error: error.message
    });
  }
});

// Check Dashboard permission for role
router.get('/check-dashboard-permission/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const [dashboardItems] = await con.execute(
      'SELECT mi.id, mi.name, mi.path, rp.can_view FROM menu_items mi LEFT JOIN role_permissions rp ON mi.id = rp.menu_item_id AND rp.role_id = ? WHERE mi.path = "/"',
      [roleId]
    );
    
    res.json({
      success: true,
      data: dashboardItems,
      hasPermission: dashboardItems.length > 0 && dashboardItems[0].can_view === 1
    });
  } catch (error) {
    console.error('Error checking dashboard permission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Setup full admin permissions endpoint
router.post('/setup-admin-permissions', async (req, res) => {
  try {
    console.log('🔧 API: Setting up full admin permissions...');

    // First, get all menu items
    const [menuItems] = await con.execute("SELECT * FROM menu_items ORDER BY id");

    console.log(`📋 API: Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No menu items found to set permissions for'
      });
    }

    // Clear existing admin permissions
    await con.execute("DELETE FROM role_permissions WHERE role_id = 1");
    console.log('🧹 API: Cleared existing admin permissions');

    // Prepare bulk insert for full permissions
    const values = menuItems.map(item =>
      `(1, ${item.id}, 1, 1, 1, 1)`
    ).join(', ');

    const insertSQL = `
      INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
      VALUES ${values}
    `;

    const [result] = await con.execute(insertSQL);

    console.log(`✅ API: Successfully granted full permissions to admin for ${result.affectedRows} menu items`);

    // Return success response with details
    res.json({
      success: true,
      message: `Admin now has full permissions for all ${result.affectedRows} menu items`,
      data: {
        menuItemsCount: menuItems.length,
        permissionsCreated: result.affectedRows,
        permissions: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true
        }
      }
    });
  } catch (error) {
    console.error('💥 API: Error setting up admin permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up admin permissions',
      error: error.message
    });
  }
});

// Save individual menu item permission
router.put('/individual-permission/:roleId/:menuItemId', async (req, res) => {
  const { roleId, menuItemId } = req.params;
  const { can_view, can_create, can_edit, can_delete } = req.body;

  console.log(`🔧 API: Saving individual permission for role ${roleId}, menu ${menuItemId}`);

  try {
    // First delete existing permission for this role-menu combination
    const deleteQuery = 'DELETE FROM role_permissions WHERE role_id = ? AND menu_item_id = ?';
    await con.execute(deleteQuery, [roleId, menuItemId]);

    // Only insert if view permission is enabled
    if (can_view) {
      const insertQuery = `
        INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await con.execute(insertQuery, [
        roleId,
        menuItemId,
        can_view ? 1 : 0,
        can_create ? 1 : 0,
        can_edit ? 1 : 0,
        can_delete ? 1 : 0
      ]);

      console.log(`✅ API: Individual permission saved for role ${roleId}, menu ${menuItemId}`);
      res.json({
        success: true,
        message: 'Permission saved successfully'
      });
    } else {
      // If view is disabled, just return success (permission was deleted)
      console.log(`✅ API: Permission removed for role ${roleId}, menu ${menuItemId} (view disabled)`);
      res.json({
        success: true,
        message: 'Permission removed successfully'
      });
    }
  } catch (error) {
    console.error('💥 API: Error saving individual permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save permission',
      error: error.message
    });
  }
});

// Bulk insert permissions endpoint - handles ON DUPLICATE KEY UPDATE pattern
router.post('/bulk-permissions', async (req, res) => {
  const { permissions } = req.body;

  console.log('📦 API: Bulk inserting permissions:', permissions);

  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Permissions array is required and must not be empty'
    });
  }

  const connection = await con.getConnection();

  try {
    await connection.query('START TRANSACTION');
    console.log('✅ API: Transaction started for bulk insert');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const perm of permissions) {
      const {
        role_id,
        menu_item_id,
        can_view = 1,
        can_create = 0,
        can_edit = 0,
        can_delete = 0,
        can_approve = 0,
        can_export = 0
      } = perm;

      // Validate required fields
      if (!role_id || !menu_item_id) {
        throw new Error(`Invalid permission: role_id and menu_item_id are required. Got: ${JSON.stringify(perm)}`);
      }

      // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both insert and update
      const query = `
        INSERT INTO role_permissions 
          (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, can_export)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          can_view = VALUES(can_view),
          can_create = VALUES(can_create),
          can_edit = VALUES(can_edit),
          can_delete = VALUES(can_delete),
          can_approve = VALUES(can_approve),
          can_export = VALUES(can_export)
      `;

      const [result] = await connection.execute(query, [
        role_id,
        menu_item_id,
        can_view ? 1 : 0,
        can_create ? 1 : 0,
        can_edit ? 1 : 0,
        can_delete ? 1 : 0,
        can_approve ? 1 : 0,
        can_export ? 1 : 0
      ]);

      // affectedRows = 1 means insert, affectedRows = 2 means update
      if (result.affectedRows === 1) {
        insertedCount++;
      } else if (result.affectedRows === 2) {
        updatedCount++;
      }

      console.log(`✅ API: Processed permission for role ${role_id}, menu ${menu_item_id}`);
    }

    await connection.query('COMMIT');
    console.log('✅ API: Transaction committed successfully');

    res.json({
      success: true,
      message: `Bulk permissions processed successfully`,
      data: {
        total: permissions.length,
        inserted: insertedCount,
        updated: updatedCount
      }
    });

  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('💥 API: Bulk insert failed, transaction rolled back:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to insert bulk permissions',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
