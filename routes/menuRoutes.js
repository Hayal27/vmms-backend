const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');

/**
 * Simplified Menu Routes
 * Only includes implemented methods
 */

// ========================================
// CORE MENU API ROUTES
// ========================================

// Main Menu Routes (used by frontend sidebar)
router.get('/user-permissions/:roleId', MenuController.getUserPermissions);

// Menu Permissions Management Routes
router.get('/roles', MenuController.getRoles);
router.get('/permission-matrix', MenuController.getPermissionMatrix);
router.put('/role-permissions/:roleId', MenuController.updateRolePermissions);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Menu API',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

module.exports = router;
