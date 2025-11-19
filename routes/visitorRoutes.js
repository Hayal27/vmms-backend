const express = require('express');
const router = express.Router();
const VisitorController = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all visitors with filtering and pagination
router.get('/', verifyToken, VisitorController.getVisitors);

// Get visitor statistics for dashboard
router.get('/stats', verifyToken, VisitorController.getVisitorStats);

// Get specific visitor by ID
router.get('/:id', verifyToken, VisitorController.getVisitorById);

// Register/create new visitor
router.post('/', verifyToken, VisitorController.createVisitor);

// Update visitor
router.put('/:id', verifyToken, VisitorController.updateVisitor);

// Delete visitor
router.delete('/:id', verifyToken, VisitorController.deleteVisitor);

// Check-in visitor
router.post('/:id/checkin', verifyToken, VisitorController.checkIn);

// Check-out visitor
router.post('/:id/checkout', verifyToken, VisitorController.checkOut);

// Validate visitor QR
router.post('/validate-qr', verifyToken, VisitorController.validateVisitorQR);

module.exports = router;
