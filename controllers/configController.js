/**
 * Configuration Controller
 * Unified configuration API that delegates to appropriate controllers
 * This provides a single endpoint for all frontend configuration needs
 */

const MenuController = require('./menuController');
const DynamicConfigController = require('./dynamicConfigController');
const SystemConfigController = require('./systemConfigController');

class ConfigController {
  // Delegate to MenuController
  static async getMenuConfiguration(req, res) {
    return MenuController.getUserPermissions(req, res);
  }

  static async getPermissionMatrix(req, res) {
    return MenuController.getPermissionMatrix(req, res);
  }

  static async getRoles(req, res) {
    return MenuController.getRoles(req, res);
  }

  // Delegate to DynamicConfigController
  static async getSystemConfig(req, res) {
    return DynamicConfigController.getSystemConfig(req, res);
  }

  static async updateSystemConfig(req, res) {
    return DynamicConfigController.updateSystemConfig(req, res);
  }

  static async getFeatureFlags(req, res) {
    return DynamicConfigController.getFeatureFlags(req, res);
  }

  static async updateFeatureFlag(req, res) {
    return DynamicConfigController.toggleFeatureFlag(req, res);
  }

  static async getUISettings(req, res) {
    return DynamicConfigController.getUIConfig(req, res);
  }

  static async getBusinessRules(req, res) {
    return DynamicConfigController.getBusinessRules(req, res);
  }

  static async getThemeSettings(req, res) {
    return DynamicConfigController.getThemeConfig(req, res);
  }

  static async updateSystemSetting(req, res) {
    return DynamicConfigController.updateSystemSetting(req, res);
  }

  static async getAuditLog(req, res) {
    return DynamicConfigController.getAuditLog(req, res);
  }

  // Simple implementations for basic data
  static async getTenants(req, res) {
    try {
      res.json({
        success: true,
        data: [],
        message: 'Tenants endpoint - use /api/tenants for full functionality'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tenants',
        error: error.message
      });
    }
  }

  static async getDepartments(req, res) {
    try {
      res.json({
        success: true,
        data: [],
        message: 'Departments endpoint - use /api/departments for full functionality'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching departments',
        error: error.message
      });
    }
  }
}

module.exports = ConfigController;
