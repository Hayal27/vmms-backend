const db = require('../models/db');

/**
 * Dynamic Configuration Controller
 * Serves as the single source of truth for all system configurations
 * Replaces multiple config files with database-driven dynamic configuration
 */
class DynamicConfigController {
  
  // Get complete system configuration
  static async getSystemConfig(req, res) {
    try {
      const queries = {
        settings: `SELECT category, setting_key, setting_value, data_type FROM system_settings WHERE is_active = 1 ORDER BY category, sort_order`,
        features: `SELECT feature_name, is_enabled, config_data, target_roles FROM feature_flags WHERE is_enabled = 1`,
        menuItems: `
          SELECT 
            mi.id, mi.name, mi.path, mi.icon, mi.parent_id, mi.sort_order,
            mi.component_name, mi.description, mi.module_name, mi.requires_auth,
            mi.feature_flag, mi.is_active, mi.meta_data
          FROM menu_items mi 
          WHERE mi.is_active = 1 
          ORDER BY mi.parent_id IS NULL DESC, mi.sort_order ASC
        `,
        roles: `SELECT role_id, role_name, status FROM roles WHERE status = 1`,
        permissions: `
          SELECT rp.role_id, rp.menu_item_id, rp.can_view, rp.can_create, 
                 rp.can_edit, rp.can_delete, rp.can_approve, rp.can_export
          FROM role_permissions rp
          INNER JOIN menu_items mi ON rp.menu_item_id = mi.id
          WHERE mi.is_active = 1
        `
      };

      const results = {};
      
      // Execute all queries
      for (const [key, query] of Object.entries(queries)) {
        results[key] = await this.executeQuery(query);
      }

      // Process and structure the configuration
      const config = this.buildSystemConfiguration(results);

      res.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      });

    } catch (error) {
      console.error('Error in getSystemConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load system configuration',
        error: error.message
      });
    }
  }

  // Get role-specific configuration
  static async getRoleConfig(req, res) {
    try {
      const { role_id } = req.params;

      if (!role_id) {
        return res.status(400).json({
          success: false,
          message: 'Role ID is required'
        });
      }

      const menuQuery = `
        SELECT DISTINCT 
          mi.id, mi.name, mi.path, mi.icon, mi.parent_id, mi.sort_order,
          mi.component_name, mi.description, mi.module_name, mi.requires_auth,
          mi.feature_flag, mi.meta_data,
          JSON_OBJECT(
            'can_view', COALESCE(rp.can_view, 0),
            'can_create', COALESCE(rp.can_create, 0),
            'can_edit', COALESCE(rp.can_edit, 0),
            'can_delete', COALESCE(rp.can_delete, 0),
            'can_approve', COALESCE(rp.can_approve, 0),
            'can_export', COALESCE(rp.can_export, 0)
          ) as permissions
        FROM menu_items mi
        LEFT JOIN role_permissions rp ON mi.id = rp.menu_item_id AND rp.role_id = ?
        WHERE mi.is_active = 1 AND (rp.can_view = 1 OR rp.role_id IS NULL)
        ORDER BY mi.parent_id IS NULL DESC, mi.sort_order ASC
      `;

      const menuItems = await this.executeQuery(menuQuery, [role_id]);
      
      // Parse permissions and build menu tree
      const processedItems = menuItems.map(item => ({
        ...item,
        permissions: typeof item.permissions === 'string' 
          ? JSON.parse(item.permissions) 
          : item.permissions,
        meta_data: typeof item.meta_data === 'string' 
          ? JSON.parse(item.meta_data) 
          : item.meta_data
      }));

      const menuTree = this.buildMenuTree(processedItems);

      res.json({
        success: true,
        data: {
          role_id: parseInt(role_id),
          menu: menuTree,
          permissions: this.extractPermissions(processedItems)
        }
      });

    } catch (error) {
      console.error('Error in getRoleConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load role configuration',
        error: error.message
      });
    }
  }

  // Update system setting
  static async updateSystemSetting(req, res) {
    try {
      const { category, setting_key, setting_value, data_type } = req.body;

      if (!category || !setting_key || setting_value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Category, setting_key, and setting_value are required'
        });
      }

      const query = `
        INSERT INTO system_settings (category, setting_key, setting_value, data_type, updated_by)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        data_type = VALUES(data_type),
        updated_by = VALUES(updated_by),
        updated_at = CURRENT_TIMESTAMP
      `;

      await this.executeQuery(query, [
        category, 
        setting_key, 
        setting_value, 
        data_type || 'string',
        req.user?.user_id || 1
      ]);

      // Log configuration change
      await this.logConfigChange(req.user?.user_id || 1, category, {
        action: 'update_setting',
        setting_key,
        old_value: null, // TODO: Get old value
        new_value: setting_value
      }, req);

      res.json({
        success: true,
        message: 'System setting updated successfully'
      });

    } catch (error) {
      console.error('Error in updateSystemSetting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system setting',
        error: error.message
      });
    }
  }

  // Toggle feature flag
  static async toggleFeatureFlag(req, res) {
    try {
      const { feature_name } = req.params;
      const { is_enabled, config_data, target_roles } = req.body;

      const query = `
        INSERT INTO feature_flags (feature_name, is_enabled, config_data, target_roles)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        is_enabled = VALUES(is_enabled),
        config_data = VALUES(config_data),
        target_roles = VALUES(target_roles),
        updated_at = CURRENT_TIMESTAMP
      `;

      await this.executeQuery(query, [
        feature_name,
        is_enabled ? 1 : 0,
        config_data ? JSON.stringify(config_data) : null,
        target_roles ? JSON.stringify(target_roles) : null
      ]);

      // Log configuration change
      await this.logConfigChange(req.user?.user_id || 1, 'feature_flags', {
        action: 'toggle_feature',
        feature_name,
        is_enabled
      }, req);

      res.json({
        success: true,
        message: `Feature ${feature_name} ${is_enabled ? 'enabled' : 'disabled'} successfully`
      });

    } catch (error) {
      console.error('Error in toggleFeatureFlag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle feature flag',
        error: error.message
      });
    }
  }

  // Get menu configuration for frontend
  static async getMenuConfig(req, res) {
    try {
      const { role_id } = req.query;

      let query = `
        SELECT DISTINCT 
          mi.id, mi.name, mi.path, mi.icon, mi.parent_id, mi.sort_order,
          mi.component_name, mi.description, mi.module_name, mi.requires_auth,
          mi.feature_flag, mi.meta_data, mi.is_active
        FROM menu_items mi
        WHERE mi.is_active = 1
      `;

      let params = [];

      if (role_id) {
        query += `
          AND EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.menu_item_id = mi.id 
            AND rp.role_id = ? 
            AND rp.can_view = 1
          )
        `;
        params.push(role_id);
      }

      query += ` ORDER BY mi.parent_id IS NULL DESC, mi.sort_order ASC`;

      const menuItems = await this.executeQuery(query, params);
      
      // Process meta_data
      const processedItems = menuItems.map(item => ({
        ...item,
        meta_data: typeof item.meta_data === 'string' 
          ? JSON.parse(item.meta_data) 
          : item.meta_data
      }));

      const menuTree = this.buildMenuTree(processedItems);

      res.json({
        success: true,
        data: menuTree,
        total: menuItems.length
      });

    } catch (error) {
      console.error('Error in getMenuConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load menu configuration',
        error: error.message
      });
    }
  }

  // Helper Methods

  static executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static buildSystemConfiguration(results) {
    const config = {
      app: {},
      ui: {},
      security: {},
      business: {},
      notifications: {},
      features: {},
      menu: {},
      roles: {},
      permissions: {}
    };

    // Process system settings
    results.settings.forEach(setting => {
      if (!config[setting.category]) {
        config[setting.category] = {};
      }
      
      let value = setting.setting_value;
      
      // Parse value based on data type
      switch (setting.data_type) {
        case 'boolean':
          value = setting.setting_value === 'true' || setting.setting_value === '1';
          break;
        case 'number':
          value = parseFloat(setting.setting_value);
          break;
        case 'json':
          try {
            value = JSON.parse(setting.setting_value);
          } catch (e) {
            value = setting.setting_value;
          }
          break;
        case 'array':
          try {
            value = JSON.parse(setting.setting_value);
          } catch (e) {
            value = setting.setting_value.split(',');
          }
          break;
        default:
          value = setting.setting_value;
      }
      
      config[setting.category][setting.setting_key] = value;
    });

    // Process feature flags
    results.features.forEach(feature => {
      config.features[feature.feature_name] = {
        enabled: Boolean(feature.is_enabled),
        config: feature.config_data ? JSON.parse(feature.config_data) : {},
        target_roles: feature.target_roles ? JSON.parse(feature.target_roles) : []
      };
    });

    // Process menu items
    config.menu.items = this.buildMenuTree(results.menuItems);

    // Process roles
    config.roles = results.roles.reduce((acc, role) => {
      acc[role.role_id] = {
        id: role.role_id,
        name: role.role_name,
        status: role.status
      };
      return acc;
    }, {});

    // Process permissions
    config.permissions = results.permissions.reduce((acc, perm) => {
      if (!acc[perm.role_id]) {
        acc[perm.role_id] = {};
      }
      acc[perm.role_id][perm.menu_item_id] = {
        can_view: Boolean(perm.can_view),
        can_create: Boolean(perm.can_create),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete),
        can_approve: Boolean(perm.can_approve),
        can_export: Boolean(perm.can_export)
      };
      return acc;
    }, {});

    return config;
  }

  static buildMenuTree(items) {
    const itemMap = {};
    const roots = [];

    // Create a map of all items
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Build the tree
    items.forEach(item => {
      if (item.parent_id === null) {
        roots.push(itemMap[item.id]);
      } else if (itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      }
    });

    return roots;
  }

  static extractPermissions(items) {
    return items.reduce((acc, item) => {
      acc[item.id] = item.permissions;
      return acc;
    }, {});
  }

  static async logConfigChange(userId, category, changes, req) {
    try {
      const query = `
        INSERT INTO config_audit_log (user_id, category, changes, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `;

      await this.executeQuery(query, [
        userId,
        category,
        JSON.stringify(changes),
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown'
      ]);
    } catch (error) {
      console.error('Error logging config change:', error);
    }
  }
}

module.exports = DynamicConfigController;
