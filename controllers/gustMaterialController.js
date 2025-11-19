/**
 * Gust Material Management Controller
 * Independent controller for Gust company material registration
 * Features: Auto-approval, automatic check-in, simplified workflow
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const ValidationService = require('../services/ValidationService');
const AppConfig = require('../config/appConfig');
const QRCode = require('qrcode');
const db = require('../models/db');

// Dynamic import for ESM uuid module
let uuidv4;
(async () => {
  const uuid = await import('uuid');
  uuidv4 = uuid.v4;
})();

class GustMaterialController extends BaseController {
  /**
   * Create new Gust material with auto-approval and check-in
   * @route POST /api/materials/gust
   * @access Private (Gust users only)
   */
  static async createGustMaterial(req, res) {
    try {
      const materialData = req.body;

      console.log('🏢 Gust material data received:', JSON.stringify(materialData, null, 2));
      console.log('👤 User info:', req.user);

      // Validate required fields for Gust materials
      this.validateRequired(materialData, [
        'company_name', 'due_date', 'material_items'
      ]);

      // Validate material items
      if (!Array.isArray(materialData.material_items) || materialData.material_items.length === 0) {
        return this.error(res, 'At least one material item is required', 400);
      }

      // Sanitize input for Gust materials
      const allowedFields = [
        'company_name', 'due_date', 'due_time', 'vehicle_plate_no', 'gust_id'
      ];
      const sanitized = this.sanitizeInput(materialData, allowedFields);

      // Auto-fill Gust_id from authenticated user
      if (!sanitized.gust_id && req.user?.Gust_id) {
        sanitized.gust_id = req.user.Gust_id;
      }

      // Set material_name for Gust entries
      sanitized.material_name = `Gust Material Entry - ${sanitized.company_name}`;

      // Extract material items
      const materialItems = materialData.material_items;

      // Calculate total quantity
      const totalQuantity = materialItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      sanitized.quantity = totalQuantity;
      sanitized.unit = materialItems.length === 1 ? materialItems[0].measurement : 'items';

      // Auto-fill requester info from Gust user
      if (req.user) {
        sanitized.requester_name = req.user.user_name || req.user.name || 'Gust User';
        sanitized.requester_phone = req.user.phone || 'N/A';
      }

      // Gust-specific settings: Auto-approve and check-in
      sanitized.status = 'approved'; // Auto-approve Gust materials
      sanitized.approved_by = req.user?.user_id || null;
      sanitized.approved_at = new Date();
      sanitized.is_gust_entry = 1; // Flag as Gust entry
      sanitized.checked_in = 1; // Auto check-in
      sanitized.checked_in_at = new Date();
      sanitized.checked_in_by = req.user?.user_id || null;

      console.log('✅ Sanitized Gust material data:', JSON.stringify(sanitized, null, 2));

      // Generate unique ID and tracking number
      const materialId = uuidv4();
      const trackingNumber = await this.generateTrackingNumber();

      // Generate QR code
      const qrData = {
        id: materialId,
        tracking_number: trackingNumber,
        type: 'gust_material',
        company_name: sanitized.company_name,
        created_at: new Date().toISOString()
      };
      
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

      // Prepare main material record
      const materialRecord = {
        id: materialId,
        tracking_number: trackingNumber,
        qr_code: qrCodeDataURL,
        created_by: req.user?.user_id || null,
        ...sanitized
      };

      console.log('📦 Final Gust material record:', JSON.stringify(materialRecord, null, 2));

      // Start database transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Insert main material record
        const materialFields = Object.keys(materialRecord);
        const materialPlaceholders = materialFields.map(() => '?').join(', ');
        const materialValues = Object.values(materialRecord);

        const insertMaterialQuery = `
          INSERT INTO materials (${materialFields.join(', ')})
          VALUES (${materialPlaceholders})
        `;

        console.log('🔄 Executing material insert query:', insertMaterialQuery);
        console.log('📊 Material values:', materialValues);

        await connection.execute(insertMaterialQuery, materialValues);

        // Insert material items
        for (const item of materialItems) {
          const itemRecord = {
            material_id: materialId,
            item_name: item.item_name,
            quantity: parseInt(item.quantity) || 0,
            measurement: item.measurement,
            is_returnable: item.is_returnable ? 1 : 0,
            is_non_returnable: item.is_non_returnable ? 1 : 0,
            description: item.description || null
            // Note: id, created_at, updated_at are auto-generated by database
          };

          const itemFields = Object.keys(itemRecord);
          const itemPlaceholders = itemFields.map(() => '?').join(', ');
          const itemValues = Object.values(itemRecord);

          const insertItemQuery = `
            INSERT INTO material_items (${itemFields.join(', ')})
            VALUES (${itemPlaceholders})
          `;

          console.log('🔄 Executing item insert query:', insertItemQuery);
          await connection.execute(insertItemQuery, itemValues);
        }

        // Log activity
        await this.logActivity(req.user?.user_id, 'create', 'gust_material', materialId, req.ip);

        // Commit transaction
        await connection.commit();
        connection.release();

        console.log('✅ Gust material created successfully with ID:', materialId);

        // Return success response
        return this.success(res, {
          id: materialId,
          tracking_number: trackingNumber,
          qr_code: qrCodeDataURL,
          status: 'approved',
          checked_in: true,
          message: 'Gust material registered successfully and automatically approved & checked in'
        }, 'Gust material created successfully', 201);

      } catch (dbError) {
        await connection.rollback();
        connection.release();
        console.error('❌ Database transaction failed:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('❌ Gust material creation failed:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return this.error(res, 'Duplicate entry detected', 409);
      }
      
      if (error.message.includes('required')) {
        return this.error(res, error.message, 400);
      }
      
      return this.error(res, 'Failed to create Gust material', 500);
    }
  }

  /**
   * Get all Gust materials
   * @route GET /api/materials/gust
   * @access Private
   */
  static async getGustMaterials(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'material_name', 'tracking_number', 'status', 'created_at', 'updated_at'
      ]);

      // Build WHERE clause for Gust materials only
      let whereClause = 'WHERE m.deleted_at IS NULL AND m.is_gust_entry = 1';
      const queryParams = [];
      
      if (req.query.search) {
        whereClause += ' AND (m.material_name LIKE ? OR m.tracking_number LIKE ? OR m.company_name LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (req.query.status) {
        whereClause += ' AND m.status = ?';
        queryParams.push(req.query.status);
      }

      if (req.query.checked_in !== undefined) {
        whereClause += ' AND m.checked_in = ?';
        queryParams.push(req.query.checked_in === 'true' ? 1 : 0);
      }

      if (req.query.checked_out !== undefined) {
        whereClause += ' AND m.checked_out = ?';
        queryParams.push(req.query.checked_out === 'true' ? 1 : 0);
      }

      // Filter by Gust ID if user has one
      if (req.user?.Gust_id) {
        whereClause += ' AND m.gust_id = ?';
        queryParams.push(req.user.Gust_id);
      }

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
        ${whereClause}
        ORDER BY m.${sortBy} ${sortOrder}
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM materials m
        ${whereClause}
      `;

      console.log('🔍 Executing Gust materials query:', query);
      console.log('📊 Query params:', queryParams);

      const [materials, countResult] = await Promise.all([
        db.execute(query, queryParams),
        db.execute(countQuery, queryParams)
      ]);

      const total = countResult[0]?.total || 0;

      // Get material items for each material
      for (const material of materials) {
        const itemsQuery = 'SELECT * FROM material_items WHERE material_id = ? AND deleted_at IS NULL';
        const [items] = await db.execute(itemsQuery, [material.id]);
        material.material_items = items;
      }

      return this.success(res, {
        materials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('❌ Failed to fetch Gust materials:', error);
      return this.error(res, 'Failed to fetch Gust materials', 500);
    }
  }

  /**
   * Check out Gust material
   * @route PUT /api/materials/gust/:id/checkout
   * @access Private
   */
  static async checkoutGustMaterial(req, res) {
    try {
      const { id } = req.params;

      // Validate material exists and is Gust material
      const [material] = await db.execute(
        'SELECT * FROM materials WHERE id = ? AND is_gust_entry = 1 AND deleted_at IS NULL',
        [id]
      );

      if (!material.length) {
        return this.error(res, 'Gust material not found', 404);
      }

      const materialData = material[0];

      // Check if already checked out
      if (materialData.checked_out) {
        return this.error(res, 'Material is already checked out', 400);
      }

      // Update material to checked out
      await db.execute(
        `UPDATE materials SET 
         checked_out = 1, 
         checked_out_at = NOW(), 
         checked_out_by = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [req.user?.user_id, id]
      );

      // Log activity
      await this.logActivity(req.user?.user_id, 'checkout', 'gust_material', id, req.ip);

      return this.success(res, {
        id,
        checked_out: true,
        checked_out_at: new Date(),
        message: 'Gust material checked out successfully'
      });

    } catch (error) {
      console.error('❌ Failed to checkout Gust material:', error);
      return this.error(res, 'Failed to checkout Gust material', 500);
    }
  }

  /**
   * Generate unique tracking number for Gust materials
   */
  static async generateTrackingNumber() {
    const prefix = 'GUST';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get next sequence number for today
    const sequenceQuery = `
      SELECT COUNT(*) + 1 as next_seq 
      FROM materials 
      WHERE tracking_number LIKE ? 
      AND DATE(created_at) = CURDATE()
      AND is_gust_entry = 1
    `;
    
    const [result] = await db.execute(sequenceQuery, [`${prefix}-${date}-%`]);
    const sequence = String(result[0]?.next_seq || 1).padStart(4, '0');
    
    return `${prefix}-${date}-${sequence}`;
  }
}

module.exports = GustMaterialController;
