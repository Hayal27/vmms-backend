/**
 * Approval Routes
 * RESTful API endpoints for approval workflow management
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const ApprovalController = require('../controllers/approvalController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// APPROVAL WORKFLOW ROUTES
// ============================================================================

/**
 * GET /api/approvals
 * Get all approvals with filtering and pagination
 */
router.get('/', verifyToken, ApprovalController.getAllApprovals);

/**
 * GET /api/approvals/:id
 * Get approval by ID
 */
router.get('/:id', verifyToken, ApprovalController.getApprovalById);

/**
 * POST /api/approvals
 * Create new approval request
 */
router.post('/', verifyToken, ApprovalController.createApproval);

/**
 * PUT /api/approvals/:id/approve
 * Approve request
 */
router.post('/:id/approve', verifyToken, ApprovalController.approve);

/**
 * PUT /api/approvals/:id/reject
 * Reject request
 */
router.post('/:id/reject', verifyToken, ApprovalController.reject);

/**
 * PUT /api/approvals/:id/escalate
 * Escalate approval
 */
router.post('/:id/escalate', verifyToken, ApprovalController.escalate);

/**
 * GET /api/approvals/inbox/:userId
 * Get user's approval inbox
 */
// TODO: Implement getApprovalInbox method
// router.get('/inbox/:userId', verifyToken, ApprovalController.getApprovalInbox);

/**
 * GET /api/approvals/stats/dashboard
 * Get approval dashboard statistics
 */
router.get('/stats', verifyToken, ApprovalController.getApprovalStats);

/**
 * GET /api/approvals/:id/history
 * Get approval history
 */
router.get('/:id/history', verifyToken, ApprovalController.getApprovalHistory);

module.exports = router;
