/**
 * Notification Routes
 * RESTful API endpoints for notifications
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================

/**
 * GET /api/notifications/:user_id
 * Get user notifications
 */
router.get('/:user_id', verifyToken, NotificationController.getUserNotifications);

/**
 * PUT /api/notifications/:notification_id/read
 * Mark notification as read
 */
router.put('/:notification_id/read', verifyToken, NotificationController.markAsRead);

/**
 * GET /api/notifications/:user_id/count
 * Get notification count
 */
router.get('/:user_id/count', verifyToken, NotificationController.getNotificationCount);

module.exports = router;
