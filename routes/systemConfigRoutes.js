const express = require('express');
const router = express.Router();
const SystemConfigController = require('../controllers/systemConfigController');

// System Configuration Routes
router.get('/settings', SystemConfigController.getSettings);
router.put('/settings/:id', SystemConfigController.updateSetting);

// Feature Flags Routes
router.get('/feature-flags', SystemConfigController.getFeatureFlags);
router.put('/feature-flags/:id/toggle', SystemConfigController.toggleFeatureFlag);

// System Config for Frontend
router.get('/system', SystemConfigController.getSystemConfig);

// Categories and Audit
router.get('/categories', SystemConfigController.getCategories);
router.get('/audit-log', SystemConfigController.getAuditLog);

module.exports = router;
