const db = require('../models/db');

class SystemConfigController {
  // Get all system settings by category
  static async getSettings(req, res) {
    try {
      const { category } = req.query;
      
      let query = `
        SELECT 
          id,
          category,
          setting_key,
          setting_value,
          data_type,
          description,
          is_active,
          sort_order,
          created_at,
          updated_at
        FROM system_settings 
        WHERE is_active = 1
      `;
      
      const params = [];
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY category, sort_order, setting_key';

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('Error fetching settings:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching settings',
            error: err.message 
          });
        }

        // Group by category and parse values based on data_type
        const settings = {};
        results.forEach(setting => {
          if (!settings[setting.category]) {
            settings[setting.category] = {};
          }
          
          let parsedValue = setting.setting_value;
          try {
            switch (setting.data_type) {
              case 'number':
                parsedValue = Number(setting.setting_value);
                break;
              case 'boolean':
                parsedValue = setting.setting_value.toLowerCase() === 'true';
                break;
              case 'json':
              case 'array':
                parsedValue = JSON.parse(setting.setting_value);
                break;
              default:
                parsedValue = setting.setting_value;
            }
          } catch (parseErr) {
            console.warn(`Error parsing setting ${setting.setting_key}:`, parseErr);
            parsedValue = setting.setting_value;
          }
          
          settings[setting.category][setting.setting_key] = {
            value: parsedValue,
            data_type: setting.data_type,
            description: setting.description,
            id: setting.id
          };
        });

        res.json({
          success: true,
          data: settings,
          total: results.length
        });
      });

    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get feature flags
  static async getFeatureFlags(req, res) {
    try {
      const query = `
        SELECT 
          id,
          feature_name,
          is_enabled,
          config_data,
          target_roles,
          start_date,
          end_date,
          description,
          created_at,
          updated_at
        FROM feature_flags
        WHERE (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY feature_name
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching feature flags:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching feature flags',
            error: err.message 
          });
        }

        // Parse JSON fields
        const featureFlags = results.map(flag => ({
          ...flag,
          config_data: flag.config_data ? JSON.parse(flag.config_data) : null,
          target_roles: flag.target_roles ? JSON.parse(flag.target_roles) : null
        }));

        res.json({
          success: true,
          data: featureFlags,
          total: featureFlags.length
        });
      });

    } catch (error) {
      console.error('Error in getFeatureFlags:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Update system setting
  static async updateSetting(req, res) {
    try {
      const { id } = req.params;
      const { setting_value, description } = req.body;
      const user_id = req.user?.user_id || 1; // Default to admin if not available

      if (setting_value === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Setting value is required' 
        });
      }

      // Get current setting for audit log
      const getCurrentQuery = 'SELECT * FROM system_settings WHERE id = ?';
      
      db.query(getCurrentQuery, [id], (err, currentResults) => {
        if (err) {
          console.error('Error fetching current setting:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching current setting',
            error: err.message 
          });
        }

        if (currentResults.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Setting not found' 
          });
        }

        const currentSetting = currentResults[0];
        
        // Update the setting
        const updateQuery = `
          UPDATE system_settings 
          SET setting_value = ?, 
              description = COALESCE(?, description),
              updated_at = CURRENT_TIMESTAMP,
              updated_by = ?
          WHERE id = ?
        `;

        const values = [
          typeof setting_value === 'object' ? JSON.stringify(setting_value) : setting_value,
          description,
          user_id,
          id
        ];

        db.query(updateQuery, values, (updateErr, result) => {
          if (updateErr) {
            console.error('Error updating setting:', updateErr);
            return res.status(500).json({ 
              success: false, 
              message: 'Error updating setting',
              error: updateErr.message 
            });
          }

          // Log the change
          const auditData = {
            old_value: currentSetting.setting_value,
            new_value: typeof setting_value === 'object' ? JSON.stringify(setting_value) : setting_value,
            setting_key: currentSetting.setting_key,
            category: currentSetting.category
          };

          const auditQuery = `
            INSERT INTO config_audit_log (user_id, category, changes, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `;

          db.query(auditQuery, [user_id, 'system_settings', JSON.stringify(auditData)], (auditErr) => {
            if (auditErr) {
              console.warn('Error logging audit:', auditErr);
            }
          });

          res.json({
            success: true,
            message: 'Setting updated successfully'
          });
        });
      });

    } catch (error) {
      console.error('Error in updateSetting:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Toggle feature flag
  static async toggleFeatureFlag(req, res) {
    try {
      const { id } = req.params;
      const { is_enabled } = req.body;
      const user_id = req.user?.user_id || 1;

      if (is_enabled === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'is_enabled field is required' 
        });
      }

      const query = `
        UPDATE feature_flags 
        SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.query(query, [is_enabled, id], (err, result) => {
        if (err) {
          console.error('Error updating feature flag:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error updating feature flag',
            error: err.message 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Feature flag not found' 
          });
        }

        // Log the change
        const auditData = {
          action: 'toggle_feature_flag',
          feature_flag_id: id,
          new_state: is_enabled
        };

        const auditQuery = `
          INSERT INTO config_audit_log (user_id, category, changes, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.query(auditQuery, [user_id, 'feature_flags', JSON.stringify(auditData)], (auditErr) => {
          if (auditErr) {
            console.warn('Error logging audit:', auditErr);
          }
        });

        res.json({
          success: true,
          message: `Feature flag ${is_enabled ? 'enabled' : 'disabled'} successfully`
        });
      });

    } catch (error) {
      console.error('Error in toggleFeatureFlag:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get system configuration for frontend
  static async getSystemConfig(req, res) {
    try {
      const { role_id } = req.query;

      // Get all settings
      const settingsQuery = `
        SELECT category, setting_key, setting_value, data_type
        FROM system_settings 
        WHERE is_active = 1
        ORDER BY category, sort_order
      `;

      // Get enabled feature flags
      const flagsQuery = `
        SELECT feature_name, is_enabled, config_data, target_roles
        FROM feature_flags
        WHERE (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      `;

      db.query(settingsQuery, (settingsErr, settingsResults) => {
        if (settingsErr) {
          console.error('Error fetching settings:', settingsErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching settings',
            error: settingsErr.message 
          });
        }

        db.query(flagsQuery, (flagsErr, flagsResults) => {
          if (flagsErr) {
            console.error('Error fetching feature flags:', flagsErr);
            return res.status(500).json({ 
              success: false, 
              message: 'Error fetching feature flags',
              error: flagsErr.message 
            });
          }

          // Process settings
          const config = {};
          settingsResults.forEach(setting => {
            if (!config[setting.category]) {
              config[setting.category] = {};
            }
            
            let parsedValue = setting.setting_value;
            try {
              switch (setting.data_type) {
                case 'number':
                  parsedValue = Number(setting.setting_value);
                  break;
                case 'boolean':
                  parsedValue = setting.setting_value.toLowerCase() === 'true';
                  break;
                case 'json':
                case 'array':
                  parsedValue = JSON.parse(setting.setting_value);
                  break;
              }
            } catch (parseErr) {
              console.warn(`Error parsing setting ${setting.setting_key}:`, parseErr);
            }
            
            config[setting.category][setting.setting_key] = parsedValue;
          });

          // Process feature flags
          const features = {};
          flagsResults.forEach(flag => {
            let isEnabled = flag.is_enabled;
            
            // Check role-based targeting
            if (flag.target_roles && role_id) {
              try {
                const targetRoles = JSON.parse(flag.target_roles);
                if (Array.isArray(targetRoles) && !targetRoles.includes(parseInt(role_id))) {
                  isEnabled = false;
                }
              } catch (parseErr) {
                console.warn(`Error parsing target_roles for ${flag.feature_name}:`, parseErr);
              }
            }
            
            features[flag.feature_name] = {
              enabled: isEnabled,
              config: flag.config_data ? JSON.parse(flag.config_data) : null
            };
          });

          res.json({
            success: true,
            data: {
              settings: config,
              features: features,
              timestamp: new Date().toISOString()
            }
          });
        });
      });

    } catch (error) {
      console.error('Error in getSystemConfig:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get configuration categories
  static async getCategories(req, res) {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as setting_count
        FROM system_settings 
        WHERE is_active = 1
        GROUP BY category
        ORDER BY category
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching categories:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching categories',
            error: err.message 
          });
        }

        res.json({
          success: true,
          data: results
        });
      });

    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get audit log
  static async getAuditLog(req, res) {
    try {
      const { page = 1, limit = 50, category } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          cal.*,
          u.user_name,
          e.name as employee_name
        FROM config_audit_log cal
        LEFT JOIN users u ON cal.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE 1=1
      `;

      const params = [];

      if (category) {
        query += ' AND cal.category = ?';
        params.push(category);
      }

      query += ' ORDER BY cal.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('Error fetching audit log:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching audit log',
            error: err.message 
          });
        }

        // Parse changes JSON
        const auditLog = results.map(entry => ({
          ...entry,
          changes: entry.changes ? JSON.parse(entry.changes) : null
        }));

        res.json({
          success: true,
          data: auditLog,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: auditLog.length
          }
        });
      });

    } catch (error) {
      console.error('Error in getAuditLog:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
}

module.exports = SystemConfigController;
