/**
 * Material Routes
 * RESTful API endpoints for material management
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const MaterialController = require('../controllers/materialController');
const MaterialAttachmentController = require('../controllers/materialAttachmentController');
const GatePassController = require('../controllers/gatePassController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadMaterialAttachments } = require('../middleware/materialUploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// ============================================================================
// MATERIAL MANAGEMENT ROUTES
// ============================================================================

/**
 * GET /api/materials
 * Get all materials with filtering, sorting, and pagination
 */
router.get('/', authenticateToken, (req, res) => MaterialController.getAllMaterials(req, res));

/**
 * GET /api/materials/:id
 * Get material by ID
 */
router.get('/:id', authenticateToken, (req, res) => MaterialController.getMaterialById(req, res));

/**
 * POST /api/materials
 * Create new material
 */
router.post('/', authenticateToken, (req, res) => MaterialController.createMaterial(req, res));

/**
 * POST /api/materials/tenant
 * Create new material - Tenant self-registration
 */
router.post('/tenant', authenticateToken, (req, res) => MaterialController.createTenantMaterial(req, res));

/**
 * PUT /api/materials/:id
 * Update material
 */
router.put('/:id', authenticateToken, (req, res) => MaterialController.updateMaterial(req, res));

/**
 * DELETE /api/materials/:id
 * Delete material (soft delete)
 */
router.delete('/:id', authenticateToken, (req, res) => MaterialController.deleteMaterial(req, res));

/**
 * GET /api/materials/dashboard/stats
 * Get material dashboard statistics
 */
router.get('/dashboard/stats', authenticateToken, (req, res) => MaterialController.getDashboardStats(req, res));

/**
 * PUT /api/materials/:id/approve
 * Approve/reject material
 */
router.put('/:id/approve', authenticateToken, (req, res) => MaterialController.approveMaterial(req, res));

/**
 * PUT /api/materials/:id/status
 * Update material status
 */
router.put('/:id/status', authenticateToken, (req, res) => MaterialController.updateMaterialStatus(req, res));

/**
 * PUT /api/materials/:id/checkout
 * Check out material
 */
router.put('/:id/checkout', authenticateToken, (req, res) => MaterialController.checkoutMaterial(req, res));

/**
 * PUT /api/materials/:id/checkin
 * Check in material
 */
router.put('/:id/checkin', authenticateToken, (req, res) => MaterialController.checkinMaterial(req, res));

/**
 * GET /api/materials/:id/timeline
 * Get material timeline
 */
router.get('/:id/timeline', authenticateToken, (req, res) => MaterialController.getMaterialTimeline(req, res));

/**
 * POST /api/materials/validate-qr
 * Validate material QR code for gate pass
 */
router.post('/validate-qr', authenticateToken, (req, res) => MaterialController.validateQRCode(req, res));

// ============================================================================
// ATTACHMENT ROUTES
// ============================================================================

/**
 * POST /api/materials/:id/attachments
 * Upload attachments (photos/documents) for material
 */
router.post('/:id/attachments', authenticateToken, uploadMaterialAttachments, (req, res) => MaterialAttachmentController.uploadAttachments(req, res));

/**
 * GET /api/materials/:id/attachments
 * Get all attachments for material
 */
router.get('/:id/attachments', authenticateToken, (req, res) => MaterialAttachmentController.getAttachments(req, res));

/**
 * DELETE /api/materials/:id/attachments/:attachmentId
 * Delete specific attachment
 */
router.delete('/:id/attachments/:attachmentId', authenticateToken, (req, res) => MaterialAttachmentController.deleteAttachment(req, res));

/**
 * GET /api/materials/:id/attachments/:attachmentId/download
 * Download specific attachment
 */
router.get('/:id/attachments/:attachmentId/download', authenticateToken, (req, res) => MaterialAttachmentController.downloadAttachment(req, res));

// ============================================================================
// GATE PASS ROUTES
// ============================================================================

/**
 * GET /api/materials/:id/gate-logs
 * Get gate pass logs for specific material
 */
router.get('/:id/gate-logs', authenticateToken, (req, res) => GatePassController.getMaterialGateLogs(req, res));

// TODO: Implement trackMaterial method in controller
// router.get('/tracking/:trackingNumber', verifyToken, MaterialController.trackMaterial);

module.exports = router;
