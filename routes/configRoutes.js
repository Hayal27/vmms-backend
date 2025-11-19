/**
 * Configuration Routes
 * Dynamic system configuration API endpoints
 * All frontend configurations come from these endpoints
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const ConfigController = require('../controllers/configController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// SYSTEM CONFIGURATION ROUTES
// ============================================================================

/**
 * GET /api/config/system
 * Get complete system configuration
 * This replaces all hardcoded frontend configs
 */
router.get('/system', ConfigController.getSystemConfig);

/**
 * PUT /api/config/system
 * Update system configuration
 * Requires authentication and admin role
 */
router.put('/system', verifyToken, ConfigController.updateSystemConfig);

/**
 * GET /api/config/menu
 * Get dynamic menu configuration
 * Returns menu items based on user role
 */
router.get('/menu', verifyToken, ConfigController.getMenuConfiguration);

/**
 * GET /api/config/permissions/:roleId
 * Get permissions for specific role
 */
router.get('/permissions/:roleId', verifyToken, ConfigController.getPermissionMatrix);

/**
 * GET /api/config/features
 * Get active feature flags
 */
router.get('/features', ConfigController.getFeatureFlags);

/**
 * GET /api/config/ui/:component?
 * Get UI settings for specific component or all components
 */
router.get('/ui/:component?', ConfigController.getUISettings);

/**
 * GET /api/config/business-rules
 * Get business rules configuration
 */
router.get('/business-rules', verifyToken, ConfigController.getBusinessRules);

/**
 * GET /api/config/themes
 * Get available themes configuration
 */
router.get('/themes', ConfigController.getThemeSettings);

// ============================================================================
// DYNAMIC DATA ROUTES
// ============================================================================

/**
 * GET /api/config/tenants
 * Get tenants configuration
 */
router.get('/tenants', verifyToken, ConfigController.getTenants);

/**
 * GET /api/config/roles
 * Get roles configuration
 */
router.get('/roles', verifyToken, ConfigController.getRoles);

/**
 * GET /api/config/departments
 * Get departments configuration
 */
router.get('/departments', verifyToken, ConfigController.getDepartments);

// ============================================================================
// ADMIN CONFIGURATION ROUTES
// ============================================================================

/**
 * POST /api/config/feature-flags
 * Create or update feature flag
 */
router.post('/feature-flags', verifyToken, ConfigController.updateFeatureFlag);

/**
 * POST /api/config/system-setting
 * Create or update system setting
 */
router.post('/system-setting', verifyToken, ConfigController.updateSystemSetting);

/**
 * GET /api/config/audit-log
 * Get configuration change audit log
 */
router.get('/audit-log', verifyToken, ConfigController.getAuditLog);

module.exports = router;
