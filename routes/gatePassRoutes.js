/**
 * Gate Pass Routes
 * RESTful API endpoints for gate pass validation and logging
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const GatePassController = require('../controllers/gatePassController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// GATE PASS MANAGEMENT ROUTES
// ============================================================================

/**
 * POST /api/gate-pass/validate
 * Validate gate pass QR code and log entry/exit
 */
router.post('/validate', verifyToken, GatePassController.validateGatePass);

/**
 * GET /api/gate-pass/logs
 * Get all gate pass logs with filtering
 */
router.get('/logs', verifyToken, GatePassController.getAllGateLogs);

/**
 * GET /api/gate-pass/stats
 * Get gate pass statistics
 */
router.get('/stats', verifyToken, GatePassController.getGatePassStats);

module.exports = router;
