const db = require('../models/db');

/**
 * Build hierarchical menu tree with permissions and professional ordering
 */
function buildMenuTreeWithPermissions(menuItems) {
  const itemMap = {};
  const rootItems = [];

  // Create a map of all items with children array
  menuItems.forEach(item => {
    itemMap[item.id] = { ...item, children: [] };
  });

  // Build the tree structure
  menuItems.forEach(item => {
    if (item.parent_id === null || item.parent_id === 0 || item.parent_id === undefined) {
      rootItems.push(itemMap[item.id]);
    } else if (itemMap[item.parent_id]) {
      itemMap[item.parent_id].children.push(itemMap[item.id]);
    }
  });

  // Sort root items by sort_order
  rootItems.sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name);
  });

  // Sort children for each parent
  rootItems.forEach(parent => {
    if (parent.children && parent.children.length > 0) {
      parent.children.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
    }
  });

  return rootItems;
}

/**
 * Fixed Menu Controller with Promise-based queries
 */
class MenuController {
  
  /**
   * Get user menu permissions based on role_id with hierarchical structure
   */
  static async getUserPermissions(req, res) {
    try {
      const { roleId } = req.params;
      
      console.log('🔍 API: Fetching hierarchical menu permissions for role_id:', roleId);
      
      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'Role ID is required'
        });
      }

      const query = `
        SELECT DISTINCT 
          mi.id,
          mi.name,
          mi.path,
          mi.icon,
          mi.parent_id,
          mi.sort_order,
          mi.component_name,
          mi.module_name,
          mi.description,
          mi.is_active,
          rp.can_view,
          rp.can_create,
          rp.can_edit,
          rp.can_delete,
          rp.can_approve,
          rp.can_export
        FROM menu_items mi
        INNER JOIN role_permissions rp ON mi.id = rp.menu_item_id AND rp.role_id = ?
        WHERE mi.is_active = 1 AND rp.can_view = 1
        ORDER BY 
          CASE WHEN mi.parent_id IS NULL THEN mi.sort_order ELSE 999 END ASC,
          mi.parent_id IS NULL DESC,
          mi.parent_id ASC,
          mi.sort_order ASC,
          mi.name ASC
      `;

      const [results] = await db.execute(query, [roleId]);

      // Build hierarchical menu structure
      const hierarchicalMenu = buildMenuTreeWithPermissions(results);

      console.log(`✅ API: Successfully fetched ${results.length} menu items (${hierarchicalMenu.length} top-level) for role ${roleId}`);
      
      // Log the hierarchical structure for debugging
      hierarchicalMenu.forEach(parent => {
        if (parent.children && parent.children.length > 0) {
          console.log(`📁 ${parent.name}: ${parent.children.length} children`);
        }
      });
      
      res.json({
        success: true,
        data: hierarchicalMenu,
        total: results.length,
        topLevel: hierarchicalMenu.length,
        message: 'Hierarchical menu permissions fetched successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in getUserPermissions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Get permission matrix for all roles and menu items
   */
  static async getPermissionMatrix(req, res) {
    try {
      console.log('🔍 API: Fetching permission matrix');

      // Get all menu items
      const menuQuery = `
        SELECT id, name, path, parent_id, sort_order, module_name
        FROM menu_items 
        WHERE is_active = 1 
        ORDER BY parent_id IS NULL DESC, sort_order ASC, name ASC
      `;
      
      // Get all roles
      const rolesQuery = `
        SELECT role_id, role_name 
        FROM roles 
        WHERE status = 1 
        ORDER BY role_name ASC
      `;
      
      // Get all permissions
      const permissionsQuery = `
        SELECT role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, can_export
        FROM role_permissions
      `;
      
      const [menuItems] = await db.execute(menuQuery);
      const [roles] = await db.execute(rolesQuery);
      const [permissions] = await db.execute(permissionsQuery);

      // Build permission matrix
      const matrix = roles.map(role => {
        const rolePermissions = permissions.filter(p => p.role_id === role.role_id);
        const menuPermissions = menuItems.map(menu => {
          const permission = rolePermissions.find(p => p.menu_item_id === menu.id);
          return {
            menu_item_id: menu.id,
            menu_name: menu.name,
            can_view: permission ? permission.can_view : 0,
            can_create: permission ? permission.can_create : 0,
            can_edit: permission ? permission.can_edit : 0,
            can_delete: permission ? permission.can_delete : 0,
            can_approve: permission ? permission.can_approve : 0,
            can_export: permission ? permission.can_export : 0
          };
        });
        
        return {
          role_id: role.role_id,
          role_name: role.role_name,
          permissions: menuPermissions
        };
      });

      console.log(`✅ API: Successfully fetched permission matrix for ${roles.length} roles and ${menuItems.length} menu items`);
      
      res.json({
        success: true,
        data: {
          roles,
          menu_items: menuItems,
          matrix
        },
        message: 'Permission matrix fetched successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in getPermissionMatrix:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Get all active roles
   */
  static async getRoles(req, res) {
    try {
      console.log('🔍 API: Fetching all roles');

      const query = `
        SELECT role_id, role_name, status, created_at
        FROM roles 
        WHERE status = 1 
        ORDER BY role_name ASC
      `;
      
      const [roles] = await db.execute(query);

      console.log(`✅ API: Successfully fetched ${roles.length} roles`);
      
      res.json({
        success: true,
        data: roles,
        total: roles.length,
        message: 'Roles fetched successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in getRoles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Update role permissions for a specific role
   */
  static async updateRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;

      console.log('🔍 API: Updating role permissions for role_id:', roleId);
      console.log('📦 API: Received permissions count:', permissions?.length);
      console.log('📋 API: First permission sample:', permissions?.[0]);

      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'Role ID is required'
        });
      }

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions array is required'
        });
      }

      console.log('🔄 API: Starting transaction...');
      // Start transaction
      await db.execute('START TRANSACTION');
      console.log('✅ API: Transaction started');

      try {
        // Delete existing permissions for this role
        await db.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        // Insert new permissions
        if (permissions.length > 0) {
          const insertQuery = `
            INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, can_export)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          for (const permission of permissions) {
            await db.execute(insertQuery, [
              roleId,
              permission.menu_item_id,
              permission.can_view ? 1 : 0,
              permission.can_create ? 1 : 0,
              permission.can_edit ? 1 : 0,
              permission.can_delete ? 1 : 0,
              permission.can_approve !== undefined ? (permission.can_approve ? 1 : 0) : 0,
              permission.can_export !== undefined ? (permission.can_export ? 1 : 0) : 0
            ]);
          }
        }

        // Commit transaction
        await db.execute('COMMIT');

        console.log(`✅ API: Successfully updated permissions for role ${roleId}`);
        
        res.json({
          success: true,
          message: 'Role permissions updated successfully',
          data: { role_id: roleId, permissions_count: permissions.length }
        });

      } catch (error) {
        // Rollback transaction on error
        await db.execute('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('💥 API: Error in updateRolePermissions:', error);
      console.error('💥 Error details:', {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sql: error.sql,
        stack: error.stack
      });
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message,
        details: error.sqlMessage || error.message
      });
    }
  }

  /**
   * Get all menu items
   */
  static async getAllMenuItems(req, res) {
    try {
      console.log('🔍 API: Fetching all menu items');

      const query = `
        SELECT 
          id, name, path, icon, parent_id, sort_order, 
          component_name, module_name, description, is_active,
          created_at, updated_at
        FROM menu_items 
        ORDER BY parent_id IS NULL DESC, sort_order ASC, name ASC
      `;
      
      const [menuItems] = await db.execute(query);

      console.log(`✅ API: Successfully fetched ${menuItems.length} menu items`);
      
      res.json({
        success: true,
        data: menuItems,
        total: menuItems.length,
        message: 'Menu items fetched successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in getAllMenuItems:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Get single menu item by ID
   */
  static async getMenuItemById(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 API: Fetching menu item with ID:', id);

      const query = `
        SELECT 
          id, name, path, icon, parent_id, sort_order, 
          component_name, module_name, description, is_active,
          created_at, updated_at
        FROM menu_items 
        WHERE id = ?
      `;
      
      const [menuItems] = await db.execute(query, [id]);

      if (menuItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      console.log(`✅ API: Successfully fetched menu item ${id}`);
      
      res.json({
        success: true,
        data: menuItems[0],
        message: 'Menu item fetched successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in getMenuItemById:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Create new menu item
   */
  static async createMenuItem(req, res) {
    try {
      const { name, path, icon, parent_id, sort_order, component_name, module_name, description, is_active } = req.body;

      console.log('🔍 API: Creating new menu item:', name);

      // Validation
      if (!name || !path || !icon) {
        return res.status(400).json({
          success: false,
          message: 'Name, path, and icon are required'
        });
      }

      const insertQuery = `
        INSERT INTO menu_items (name, path, icon, parent_id, sort_order, component_name, module_name, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(insertQuery, [
        name,
        path,
        icon,
        parent_id || null,
        sort_order || 0,
        component_name || null,
        module_name || null,
        description || null,
        is_active !== undefined ? is_active : 1
      ]);

      console.log(`✅ API: Successfully created menu item with ID ${result.insertId}`);
      
      res.status(201).json({
        success: true,
        data: { id: result.insertId, name, path, icon },
        message: 'Menu item created successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in createMenuItem:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Update menu item
   */
  static async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const { name, path, icon, parent_id, sort_order, component_name, module_name, description, is_active } = req.body;

      console.log('🔍 API: Updating menu item with ID:', id);

      // Check if menu item exists
      const [existing] = await db.execute('SELECT id FROM menu_items WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // Validation
      if (!name || !path || !icon) {
        return res.status(400).json({
          success: false,
          message: 'Name, path, and icon are required'
        });
      }

      const updateQuery = `
        UPDATE menu_items 
        SET name = ?, path = ?, icon = ?, parent_id = ?, sort_order = ?, 
            component_name = ?, module_name = ?, description = ?, is_active = ?
        WHERE id = ?
      `;
      
      await db.execute(updateQuery, [
        name,
        path,
        icon,
        parent_id || null,
        sort_order || 0,
        component_name || null,
        module_name || null,
        description || null,
        is_active !== undefined ? is_active : 1,
        id
      ]);

      console.log(`✅ API: Successfully updated menu item ${id}`);
      
      res.json({
        success: true,
        data: { id, name, path, icon },
        message: 'Menu item updated successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in updateMenuItem:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  /**
   * Delete menu item
   */
  static async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      console.log('🔍 API: Deleting menu item with ID:', id);

      // Check if menu item exists
      const [existing] = await db.execute('SELECT id, name FROM menu_items WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // Check if menu item has children
      const [children] = await db.execute('SELECT COUNT(*) as count FROM menu_items WHERE parent_id = ?', [id]);
      if (children[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete menu item with children. Please delete or reassign child items first.'
        });
      }

      // Delete the menu item (this will cascade delete permissions due to foreign key)
      await db.execute('DELETE FROM menu_items WHERE id = ?', [id]);

      console.log(`✅ API: Successfully deleted menu item ${id}`);
      
      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });

    } catch (error) {
      console.error('💥 API: Error in deleteMenuItem:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
}

module.exports = MenuController;
