const express = require('express');
const router = express.Router();
const DynamicConfigController = require('../controllers/dynamicConfigController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (minimal config for unauthenticated users)
router.get('/public', DynamicConfigController.getSystemConfig);

// Protected routes (require authentication)
router.use(authMiddleware.verifyToken);

// Get complete system configuration
router.get('/system', DynamicConfigController.getSystemConfig);

// Get role-specific configuration
router.get('/role/:role_id', DynamicConfigController.getRoleConfig);

// Get menu configuration
router.get('/menu', DynamicConfigController.getMenuConfig);

// Update system settings (admin only)
router.put('/setting', authMiddleware.requireRole(['Admin']), DynamicConfigController.updateSystemSetting);

// Toggle feature flags (admin only)
router.put('/feature/:feature_name', authMiddleware.requireRole(['Admin']), DynamicConfigController.toggleFeatureFlag);

module.exports = router;
