/**
 * Tenant Users Routes
 * Centralized tenant users management endpoints
 * 
 * @author VMMS Development Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * GET /api/tenant-users
 * Get all tenant users across all tenants (centralized view)
 * Professional approach for managing tenant staff across the IT Park
 */
router.get('/', verifyToken, (req, res) => tenantController.getAllTenantUsers(req, res));

module.exports = router;
