/**
 * Gust Material Routes
 * Independent RESTful API endpoints for Gust material management
 * Features: Auto-approval, check-in/check-out functionality
 * 
 * @author VMMS Development Team
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const GustMaterialController = require('../controllers/gustMaterialController');
const { authenticateToken } = require('../middleware/authMiddleware');
const db = require('../models/db');

// ============================================================================
// GUST MATERIAL MANAGEMENT ROUTES
// ============================================================================

/**
 * POST /api/materials/gust
 * Create new Gust material with auto-approval and check-in
 */
router.post('/', authenticateToken, (req, res) => GustMaterialController.createGustMaterial(req, res));

/**
 * GET /api/materials/gust
 * Get all Gust materials with filtering and pagination
 */
router.get('/', authenticateToken, (req, res) => GustMaterialController.getGustMaterials(req, res));

/**
 * GET /api/materials/gust/:id
 * Get specific Gust material by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get material with related data
    const query = `
      SELECT 
        m.*,
        u1.user_name as created_by_name,
        u2.user_name as approved_by_name,
        u3.user_name as checked_in_by_name,
        u4.user_name as checked_out_by_name
      FROM materials m
      LEFT JOIN users u1 ON m.created_by = u1.user_id
      LEFT JOIN users u2 ON m.approved_by = u2.user_id
      LEFT JOIN users u3 ON m.checked_in_by = u3.user_id
      LEFT JOIN users u4 ON m.checked_out_by = u4.user_id
      WHERE m.id = ? AND m.is_gust_entry = 1 AND m.deleted_at IS NULL
    `;
    
    const [material] = await db.execute(query, [id]);
    
    if (!material.length) {
      return GustMaterialController.error(res, 'Gust material not found', 404);
    }
    
    // Get material items
    const itemsQuery = 'SELECT * FROM material_items WHERE material_id = ? AND deleted_at IS NULL';
    const [items] = await db.execute(itemsQuery, [id]);
    material[0].material_items = items;
    
    return GustMaterialController.success(res, material[0]);
    
  } catch (error) {
    console.error('❌ Failed to fetch Gust material:', error);
    return GustMaterialController.error(res, 'Failed to fetch Gust material', 500);
  }
});

/**
 * PUT /api/materials/gust/:id/checkout
 * Check out Gust material
 */
router.put('/:id/checkout', authenticateToken, (req, res) => GustMaterialController.checkoutGustMaterial(req, res));

/**
 * PUT /api/materials/gust/:id/checkin
 * Check in Gust material (if needed to reverse checkout)
 */
router.put('/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate material exists and is Gust material
    const [material] = await db.execute(
      'SELECT * FROM materials WHERE id = ? AND is_gust_entry = 1 AND deleted_at IS NULL',
      [id]
    );

    if (!material.length) {
      return GustMaterialController.error(res, 'Gust material not found', 404);
    }

    const materialData = material[0];

    // Allow check-in without requiring checkout first

    // Update material to checked in
    await db.execute(
      `UPDATE materials SET 
       checked_out = 0,
       checked_in = 1,
       checked_in_at = NOW(),
       checked_in_by = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [req.user?.user_id, id]
    );

    // Log activity
    await GustMaterialController.logActivity(req.user?.user_id, 'checkin', 'gust_material', id, req.ip);

    return GustMaterialController.success(res, {
      id,
      checked_out: false,
      message: 'Gust material checked in successfully'
    });

  } catch (error) {
    console.error('❌ Failed to check in Gust material:', error);
    return GustMaterialController.error(res, 'Failed to check in Gust material', 500);
  }
});

/**
 * GET /api/materials/gust/dashboard/stats
 * Get Gust material dashboard statistics
 */
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    let whereClause = 'WHERE is_gust_entry = 1 AND deleted_at IS NULL';
    const queryParams = [];

    // Filter by Gust ID if user has one
    if (req.user?.Gust_id) {
      whereClause += ' AND gust_id = ?';
      queryParams.push(req.user.Gust_id);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN checked_out = 1 THEN 1 ELSE 0 END) as checked_out,
        SUM(CASE WHEN checked_in = 1 AND checked_out = 0 THEN 1 ELSE 0 END) as in_facility,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_entries
      FROM materials 
      ${whereClause}
    `;

    const [stats] = await db.execute(statsQuery, queryParams);

    return GustMaterialController.success(res, stats[0] || {
      total: 0,
      pending: 0,
      approved: 0,
      checked_in: 0,
      checked_out: 0,
      in_facility: 0,
      today_entries: 0
    });

  } catch (error) {
    console.error('❌ Failed to fetch Gust material stats:', error);
    return GustMaterialController.error(res, 'Failed to fetch statistics', 500);
  }
});

/**
 * POST /api/materials/gust/validate-qr
 * Validate Gust material QR code
 */
router.post('/validate-qr', authenticateToken, async (req, res) => {
  try {
    const { qr_data } = req.body;

    if (!qr_data) {
      return GustMaterialController.error(res, 'QR code data is required', 400);
    }

    let qrInfo;
    try {
      qrInfo = JSON.parse(qr_data);
    } catch (parseError) {
      return GustMaterialController.error(res, 'Invalid QR code format', 400);
    }

    if (qrInfo.type !== 'gust_material') {
      return GustMaterialController.error(res, 'This is not a Gust material QR code', 400);
    }

    // Find material by tracking number
    const [material] = await db.execute(
      `SELECT m.*, u1.user_name as created_by_name 
       FROM materials m 
       LEFT JOIN users u1 ON m.created_by = u1.user_id
       WHERE m.tracking_number = ? AND m.is_gust_entry = 1 AND m.deleted_at IS NULL`,
      [qrInfo.tracking_number]
    );

    if (!material.length) {
      return GustMaterialController.error(res, 'Gust material not found', 404);
    }

    const materialData = material[0];

    // Get material items
    const [items] = await db.execute(
      'SELECT * FROM material_items WHERE material_id = ? AND deleted_at IS NULL',
      [materialData.id]
    );
    materialData.material_items = items;

    return GustMaterialController.success(res, {
      valid: true,
      material: materialData,
      message: 'Gust material QR code is valid'
    });

  } catch (error) {
    console.error('❌ Failed to validate Gust material QR code:', error);
    return GustMaterialController.error(res, 'Failed to validate QR code', 500);
  }
});

module.exports = router;
