/**
 * Material Tenant Routes
 * RESTful API endpoints for tenant-specific material management
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const MaterialController = require('../controllers/materialController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// TENANT MATERIAL MANAGEMENT ROUTES
// ============================================================================

/**
 * GET /api/materials-tenant
 * Get materials for specific tenant user (filtered by user_id)
 */
router.get('/', verifyToken, (req, res) => MaterialController.getTenantMaterials(req, res));

/**
 * GET /api/materials-tenant/:id
 * Get specific material for tenant user (with user validation)
 */
router.get('/:id', verifyToken, (req, res) => MaterialController.getTenantMaterialById(req, res));

module.exports = router;
