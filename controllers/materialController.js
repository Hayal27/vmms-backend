/**
 * Enterprise Material Management Controller
 * Extends BaseController for standardized operations
 * Complete CRUD with QR codes, tracking, and gate pass validation
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const ValidationService = require('../services/ValidationService');
const AppConfig = require('../config/appConfig');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const EmailService = require('../services/EmailService');

class MaterialController extends BaseController {
  /**
   * Get all materials with advanced filtering, sorting, and pagination
   * @route GET /api/materials
   * @access Private
   */
  static async getAllMaterials(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'material_name', 'tracking_number', 'status', 'priority', 'created_at', 'updated_at'
      ]);

      // Build dynamic WHERE clause
      let whereClause = 'WHERE m.deleted_at IS NULL';
      const queryParams = [];
      
      if (req.query.search) {
        whereClause += ' AND (m.material_name LIKE ? OR m.tracking_number LIKE ? OR m.description LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (req.query.status) {
        whereClause += ' AND m.status = ?';
        queryParams.push(req.query.status);
      }
      
      if (req.query.category) {
        whereClause += ' AND m.category = ?';
        queryParams.push(req.query.category);
      }
      
      if (req.query.priority) {
        whereClause += ' AND m.priority = ?';
        queryParams.push(req.query.priority);
      }
      
      if (req.query.tenant_id) {
        whereClause += ' AND m.tenant_id = ?';
        queryParams.push(req.query.tenant_id);
      }

      // Get total count
      const total = await this.getCount('materials m', whereClause, queryParams);

      // Get materials with relationships
      const query = `
        SELECT 
          m.*,
          t.name as tenant_name,
          u.user_name as created_by_name,
          a.user_name as approved_by_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON m.created_by = u.user_id
        LEFT JOIN users a ON m.approved_by = a.user_id
        ${whereClause}
        ORDER BY m.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const materials = await this.executeQuery(query, queryParams);

      // Fetch material items for each material
      for (const material of materials) {
        const itemsQuery = `
          SELECT * FROM material_items 
          WHERE material_id = ?
          ORDER BY created_at ASC
        `;
        material.material_items = await this.executeQuery(itemsQuery, [material.id]);
      }

      return this.paginated(res, materials, total, page, limit, 'Materials retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch materials', 500, error);
    }
  }

  /**
   * Get material by ID with timeline and attachments
   * @route GET /api/materials/:id
   * @access Private
   */
  static async getMaterialById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Material ID is required', 400);
      }

      const query = `
        SELECT 
          m.*,
          t.name as tenant_name,
          u.user_name as created_by_name,
          a.user_name as approved_by_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON m.created_by = u.user_id
        LEFT JOIN users a ON m.approved_by = a.user_id
        WHERE m.id = ? AND m.deleted_at IS NULL
      `;
      
      const materials = await this.executeQuery(query, [id]);
      
      if (materials.length === 0) {
        return this.error(res, 'Material not found', 404);
      }

      // Get timeline (with error handling for missing table)
      let timeline = [];
      try {
        const timelineQuery = `
          SELECT mt.*, u.user_name
          FROM material_timeline mt
          LEFT JOIN users u ON mt.user_id = u.user_id
          WHERE mt.material_id = ?
          ORDER BY mt.created_at DESC
        `;
        timeline = await this.executeQuery(timelineQuery, [id]);
      } catch (error) {
        console.log('Timeline table not found or error fetching timeline:', error.message);
      }

      // Get attachments (with error handling for missing table)
      let attachments = [];
      try {
        const attachmentsQuery = `
          SELECT * FROM material_attachments 
          WHERE material_id = ?
          ORDER BY created_at DESC
        `;
        attachments = await this.executeQuery(attachmentsQuery, [id]);
      } catch (error) {
        console.log('Attachments table not found or error fetching attachments:', error.message);
      }

      // Get material items
      const itemsQuery = `
        SELECT * FROM material_items 
        WHERE material_id = ?
        ORDER BY created_at ASC
      `;
      const materialItems = await this.executeQuery(itemsQuery, [id]);

      const material = {
        ...materials[0],
        timeline,
        attachments,
        material_items: materialItems
      };
      
      return this.success(res, material, 'Material retrieved successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to fetch material', 500, error);
    }
  }

  /**
   * Create new material with QR code generation
   * @route POST /api/materials
   * @access Private
   */
  static async createMaterial(req, res) {
    try {
      const materialData = req.body;
      
      console.log('📦 Material data received from frontend:', JSON.stringify(materialData, null, 2));
      console.log('📦 Material items count:', materialData.material_items?.length || 0);
      
      // Validate required fields for material dispense application
      this.validateRequired(materialData, [
        'company_name', 'due_date', 'vehicle_plate_no', 'requester_name', 'requester_phone'
      ]);
      
      // Sanitize input - all fields from material dispense application form
      const allowedFields = [
        'company_name', 'due_date', 'due_time', 'vehicle_plate_no',
        'requester_name', 'requester_phone', 'approver_name',
        'tenant_id', 'notes'
      ];
      const sanitized = this.sanitizeInput(materialData, allowedFields);
      
      // Set material_name from company_name for compatibility
      if (!sanitized.material_name && sanitized.company_name) {
        sanitized.material_name = `Material Dispense - ${sanitized.company_name}`;
      }
      
      // Extract material items if provided
      const materialItems = materialData.material_items || [];
      
      // Calculate total quantity and unit from material items
      if (materialItems.length > 0) {
        const totalQuantity = materialItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        sanitized.quantity = totalQuantity;
        sanitized.unit = materialItems.length === 1 ? materialItems[0].measurement : 'items';
        console.log('📊 Calculated quantity:', totalQuantity, 'unit:', sanitized.unit);
      }
      
      console.log('✅ Sanitized data to insert:', JSON.stringify(sanitized, null, 2));
      
      // Generate tracking number and material ID
      const material_id = uuidv4();
      const tracking_number = await this.generateTrackingNumber();
      
      // Insert material
      const fields = Object.keys(sanitized);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(sanitized);
      
      const query = `
        INSERT INTO materials (
          id, tracking_number, ${fields.join(', ')}, 
          status, created_by, created_at, updated_at
        ) VALUES (?, ?, ${placeholders}, 'pending', ?, NOW(), NOW())
      `;
      
      console.log('🔍 SQL Query:', query);
      console.log('🔍 Query values:', [material_id, tracking_number, ...values, req.user?.user_id || 1]);
      
      await this.executeQuery(query, [
        material_id, 
        tracking_number, 
        ...values, 
        req.user?.user_id || 1
      ]);
      
      console.log('✅ Material record inserted successfully');

      // Insert material items if provided
      if (materialItems.length > 0) {
        console.log(`📦 Inserting ${materialItems.length} material items...`);
        for (const item of materialItems) {
          console.log('  - Item:', item.item_name, 'Qty:', item.quantity, item.measurement);
          const itemQuery = `
            INSERT INTO material_items (
              material_id, item_name, measurement, quantity, 
              is_returnable, is_non_returnable, description, 
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;
          
          const itemResult = await this.executeQuery(itemQuery, [
            material_id,
            item.item_name,
            item.measurement,
            item.quantity,
            item.is_returnable ? 1 : 0,
            item.is_non_returnable ? 1 : 0,
            item.description || null
          ]);
          console.log('    ✅ Item inserted with ID:', itemResult.insertId);
        }
        console.log(`✅ All ${materialItems.length} material items inserted successfully`);
      }

      // Generate QR Code with material details
      const qr_code = await this.generateQRCode(material_id, tracking_number, {
        status: 'pending',
        company_name: sanitized.company_name,
        quantity: sanitized.quantity,
        unit: sanitized.unit,
        vehicle_plate_no: sanitized.vehicle_plate_no,
        due_date: sanitized.due_date
      });
      
      // Update material with QR code
      await this.executeQuery(
        'UPDATE materials SET qr_code = ? WHERE id = ?', 
        [qr_code, material_id]
      );

      // Add to timeline
      await this.addToTimeline(
        material_id, 
        'created', 
        'Material dispense application registered in system', 
        req.user?.user_id || 1
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'create',
        'material',
        material_id,
        sanitized,
        req.ip
      );

      // Send email notifications
      try {
        // Get current user's email from employees table
        let userEmail = null;
        if (req.user?.user_id) {
          const userResult = await this.executeQuery(
            'SELECT e.email FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?',
            [req.user.user_id]
          );
          userEmail = userResult.length > 0 ? userResult[0].email : null;
        }

        // Prepare material data for email
        const emailMaterialData = {
          id: material_id,
          tracking_number,
          qr_code,
          ...sanitized,
          material_items: materialItems,
          status: 'pending'
        };

        // Send email notifications
        const emailResult = await EmailService.sendMaterialApplicationNotification(
          emailMaterialData,
          userEmail
        );

        console.log('📧 Email notification result:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send email notifications:', emailError);
        // Don't fail the entire request if email fails
      }

      return this.success(res, {
        id: material_id,
        tracking_number,
        qr_code
      }, 'Material dispense application created successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to create material', 500, error);
    }
  }

  /**
   * Update material
   * @route PUT /api/materials/:id
   * @access Private
   */
  static async updateMaterial(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return this.error(res, 'Material ID is required', 400);
      }

      // Check if material exists
      const exists = await this.exists('materials', 'id', id);
      if (!exists) {
        return this.error(res, 'Material not found', 404);
      }

      // Sanitize input
      const allowedFields = [
        'material_name', 'description', 'category', 'priority', 'quantity', 'unit',
        'estimated_value', 'sender_name', 'sender_contact', 'recipient_name',
        'recipient_contact', 'notes', 'current_location'
      ];
      const sanitized = this.sanitizeInput(updateData, allowedFields);
      
      if (Object.keys(sanitized).length === 0) {
        return this.error(res, 'No valid fields to update', 400);
      }

      // Build update query
      const setClause = Object.keys(sanitized).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(sanitized), id];
      
      const query = `
        UPDATE materials 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await this.executeQuery(query, values);
      
      if (result.affectedRows === 0) {
        return this.error(res, 'No changes were made', 400);
      }

      // Add to timeline
      await this.addToTimeline(
        id, 
        'updated', 
        'Material information updated', 
        req.user?.user_id || 1
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'update',
        'material',
        id,
        sanitized,
        req.ip
      );

      return this.success(res, { id }, 'Material updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update material', 500, error);
    }
  }

  /**
   * Delete material (soft delete)
   * @route DELETE /api/materials/:id
   * @access Private
   */
  static async deleteMaterial(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Material ID is required', 400);
      }

      const success = await this.softDelete('materials', id, 'id');
      
      if (!success) {
        return this.error(res, 'Material not found', 404);
      }

      // Add to timeline
      await this.addToTimeline(
        id, 
        'deleted', 
        'Material deleted from system', 
        req.user?.user_id || 1
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'delete',
        'material',
        id,
        {},
        req.ip
      );

      return this.success(res, { id }, 'Material deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete material', 500, error);
    }
  }

  /**
   * Update material status
   * @route PATCH /api/materials/:id/status
   * @access Private
   */
  static async updateMaterialStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!id || !status) {
        return this.error(res, 'Material ID and status are required', 400);
      }

      const validStatuses = [
        'pending', 'pending_approval', 'approved', 'rejected', 
        'in_transit', 'delivered', 'cancelled'
      ];
      
      if (!validStatuses.includes(status)) {
        return this.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const query = `
        UPDATE materials 
        SET status = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await this.executeQuery(query, [status, id]);
      
      if (result.affectedRows === 0) {
        return this.error(res, 'Material not found', 404);
      }

      // Add to timeline
      await this.addToTimeline(
        id,
        'status_updated',
        `Status updated to ${status}${notes ? ': ' + notes : ''}`,
        req.user?.user_id || 1
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'status_update',
        'material',
        id,
        { status, notes },
        req.ip
      );

      return this.success(res, { id, status }, 'Material status updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update material status', 500, error);
    }
  }

  /**
   * Approve or reject material
   * @route POST /api/materials/:id/approve
   * @access Private
   */
  static async approveMaterial(req, res) {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      
      if (!['approve', 'reject'].includes(action)) {
        return this.error(res, 'Action must be "approve" or "reject"', 400);
      }

      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const query = `
        UPDATE materials 
        SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await this.executeQuery(query, [
        status, 
        req.user?.user_id || 1, 
        id
      ]);
      
      if (result.affectedRows === 0) {
        return this.error(res, 'Material not found', 404);
      }

      // Add to timeline
      await this.addToTimeline(
        id,
        action === 'approve' ? 'approved' : 'rejected',
        `Material ${action}ed${notes ? ': ' + notes : ''}`,
        req.user?.user_id || 1
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        action,
        'material',
        id,
        { action, notes },
        req.ip
      );

      // Send email notification to applicant
      try {
        // Get material data for email
        const materialResult = await this.executeQuery(
          'SELECT * FROM materials WHERE id = ?',
          [id]
        );

        if (materialResult.length > 0) {
          const materialData = materialResult[0];
          
          // Get approver name
          let approverName = 'Gate Officer';
          if (req.user?.user_id) {
            const approverResult = await this.executeQuery(
              'SELECT e.name FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?',
              [req.user.user_id]
            );
            approverName = approverResult.length > 0 ? approverResult[0].name : 'Gate Officer';
          }

          // Send approval/rejection notification
          const emailResult = await EmailService.sendApprovalNotification(
            materialData,
            action,
            notes,
            approverName
          );

          console.log('📧 Approval email notification result:', emailResult);
        }
      } catch (emailError) {
        console.error('❌ Failed to send approval email notification:', emailError);
        // Don't fail the entire request if email fails
      }

      return this.success(res, { id, status }, `Material ${action}ed successfully`);

    } catch (error) {
      return this.error(res, `Failed to ${req.body.action} material`, 500, error);
    }
  }

  /**
   * Validate QR code for gate pass
   * @route POST /api/materials/validate-qr
   * @access Private
   */
  static async validateQRCode(req, res) {
    try {
      const { qr_code, gate_id, action } = req.body;

      if (!qr_code) {
        return this.error(res, 'QR code is required', 400);
      }

      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(qr_code);
      } catch (parseError) {
        return this.error(res, 'Invalid QR code format', 400);
      }

      const { material_id, tracking_number } = qrData;

      // Get material details
      const query = `
        SELECT m.*, t.name as tenant_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        WHERE m.id = ? AND m.tracking_number = ? AND m.deleted_at IS NULL
      `;

      const materials = await this.executeQuery(query, [material_id, tracking_number]);

      if (materials.length === 0) {
        return this.error(res, 'Material not found or QR code invalid', 404);
      }

      const material = materials[0];

      // Check if material is approved
      if (material.status !== 'approved') {
        return this.error(res, `Material is not approved. Current status: ${material.status}`, 400);
      }

      // Log gate pass activity
      const logQuery = `
        INSERT INTO gate_pass_logs (material_id, gate_id, action, validated_at)
        VALUES (?, ?, ?, NOW())
      `;

      await this.executeQuery(logQuery, [
        material_id, 
        gate_id || 'main_gate', 
        action || 'entry'
      ]);

      // Add to timeline
      await this.addToTimeline(
        material_id,
        'gate_pass_validated',
        `Gate pass validated at ${gate_id || 'main gate'} for ${action || 'entry'}`,
        req.user?.user_id || 1
      );

      return this.success(res, {
        material: {
          id: material.id,
          name: material.material_name,
          tracking_number: material.tracking_number,
          status: material.status,
          tenant: material.tenant_name
        },
        validation: {
          gate_id: gate_id || 'main_gate',
          action: action || 'entry',
          validated_at: new Date().toISOString()
        }
      }, 'QR code validated successfully');

    } catch (error) {
      return this.error(res, 'Failed to validate QR code', 500, error);
    }
  }

  /**
   * Get material statistics
   * @route GET /api/materials/stats
   * @access Private
   */
  static async getMaterialStats(req, res) {
    try {
      const { tenant_id } = req.query;
      let whereClause = 'WHERE deleted_at IS NULL';
      const params = [];

      if (tenant_id) {
        whereClause += ' AND tenant_id = ?';
        params.push(tenant_id);
      }

      // Status distribution
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM materials
        ${whereClause}
        GROUP BY status
      `;
      const statusStats = await this.executeQuery(statusQuery, params);

      // Category distribution
      const categoryQuery = `
        SELECT category, COUNT(*) as count
        FROM materials
        ${whereClause}
        GROUP BY category
      `;
      const categoryStats = await this.executeQuery(categoryQuery, params);

      // Priority distribution
      const priorityQuery = `
        SELECT priority, COUNT(*) as count
        FROM materials
        ${whereClause}
        GROUP BY priority
      `;
      const priorityStats = await this.executeQuery(priorityQuery, params);

      // Recent count (last 7 days)
      const recentQuery = `
        SELECT COUNT(*) as count
        FROM materials
        ${whereClause} AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `;
      const recentStats = await this.executeQuery(recentQuery, params);

      // Total count
      const total = await this.getCount('materials', whereClause, params);

      const stats = {
        total,
        statusDistribution: statusStats,
        categoryDistribution: categoryStats,
        priorityDistribution: priorityStats,
        recentCount: recentStats[0].count,
        last_updated: new Date().toISOString()
      };

      return this.success(res, stats, 'Statistics retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch statistics', 500, error);
    }
  }

  /**
   * Get dashboard statistics
   * @route GET /api/materials/dashboard
   * @access Private
   */
  static async getDashboardStats(req, res) {
    try {
      const { tenant_id } = req.query;
      let whereClause = 'WHERE deleted_at IS NULL';
      const params = [];

      if (tenant_id) {
        whereClause += ' AND tenant_id = ?';
        params.push(tenant_id);
      }

      // Total materials
      const total = await this.getCount('materials', whereClause, params);

      // Pending approvals
      const pendingQuery = `
        SELECT COUNT(*) as count
        FROM materials
        ${whereClause} AND status = 'pending_approval'
      `;
      const pendingResult = await this.executeQuery(pendingQuery, params);

      // In transit
      const transitQuery = `
        SELECT COUNT(*) as count
        FROM materials
        ${whereClause} AND status = 'in_transit'
      `;
      const transitResult = await this.executeQuery(transitQuery, params);

      // Delivered
      const deliveredQuery = `
        SELECT COUNT(*) as count
        FROM materials
        ${whereClause} AND status = 'delivered'
      `;
      const deliveredResult = await this.executeQuery(deliveredQuery, params);

      // Recent (last 7 days)
      const recentQuery = `
        SELECT COUNT(*) as count
        FROM materials
        ${whereClause} AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `;
      const recentResult = await this.executeQuery(recentQuery, params);

      const dashboard = {
        totalMaterials: total,
        pendingApprovals: pendingResult[0].count,
        inTransit: transitResult[0].count,
        delivered: deliveredResult[0].count,
        recentMaterials: recentResult[0].count,
        lastUpdated: new Date().toISOString()
      };

      return this.success(res, dashboard, 'Dashboard data retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch dashboard data', 500, error);
    }
  }

  /**
   * Get material timeline
   * @route GET /api/materials/:id/timeline
   * @access Private
   */
  static async getMaterialTimeline(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT mt.*, u.user_name
        FROM material_timeline mt
        LEFT JOIN users u ON mt.user_id = u.user_id
        WHERE mt.material_id = ?
        ORDER BY mt.created_at DESC
      `;

      const timeline = await this.executeQuery(query, [id]);

      return this.success(res, timeline, 'Timeline retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch timeline', 500, error);
    }
  }

  // Helper Methods

  /**
   * Generate unique tracking number for materials
   * Format: MAT-YYYYMMDD-XXXXX
   */
  static async generateTrackingNumber(connection = null) {
    try {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format

      // Get the latest tracking number for today
      const query = `
        SELECT tracking_number
        FROM materials
        WHERE tracking_number LIKE 'MAT-${dateStr}-%'
        ORDER BY tracking_number DESC
        LIMIT 1
      `;

      const results = await (connection ? connection.execute(query) : this.executeQuery(query));
      let nextNumber = 10000; // Start from 10000

      if (results.length > 0 && results[0].length > 0) {
        const latestTracking = results[0][0].tracking_number;
        const parts = latestTracking.split('-');
        if (parts.length === 3 && parts[0] === 'MAT' && parts[1] === dateStr) {
          const currentNumber = parseInt(parts[2]);
          nextNumber = currentNumber + 1;
        }
      }

      // Generate tracking number and check for uniqueness
      let trackingNumber;
      let attempts = 0;
      const maxAttempts = 1000;

      do {
        trackingNumber = `MAT-${dateStr}-${nextNumber.toString().padStart(5, '0')}`;
        attempts++;

        // Check if this tracking number already exists
        const checkQuery = 'SELECT 1 FROM materials WHERE tracking_number = ? LIMIT 1';
        const checkResults = await (connection ? connection.execute(checkQuery, [trackingNumber]) : this.executeQuery(checkQuery, [trackingNumber]));

        if (checkResults.length === 0 || checkResults[0].length === 0) {
          // Tracking number is unique, break the loop
          break;
        }

        // If not unique, increment and try again
        nextNumber++;
        if (attempts >= maxAttempts) {
          throw new Error('Failed to generate unique tracking number after maximum attempts');
        }
      } while (true);

      console.log(`✅ Generated unique tracking number: ${trackingNumber}`);
      return trackingNumber;

    } catch (error) {
      console.error('❌ Error generating tracking number:', error);
      throw error;
    }
  }

  /**
   * Generate QR Code for material with detailed information
   */
  static async generateQRCode(material_id, tracking_number, materialDetails = {}) {
    try {
      const qrData = {
        material_id,
        tracking_number,
        type: 'material',
        status: materialDetails.status || 'pending',
        company_name: materialDetails.company_name || '',
        quantity: materialDetails.quantity || 0,
        unit: materialDetails.unit || 'items',
        vehicle_plate_no: materialDetails.vehicle_plate_no || '',
        due_date: materialDetails.due_date || null,
        tenant_id: materialDetails.tenant_id || null,
        generated_at: new Date().toISOString()
      };

      console.log('🔲 Generating QR Code with data:', qrData);

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 200,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Add entry to material timeline
   */
  static async addToTimeline(material_id, action, description, user_id) {
    const query = `
      INSERT INTO material_timeline (material_id, action, description, user_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    await this.executeQuery(query, [material_id, action, description, user_id]);
  }

  /**
   * Get materials for specific tenant user (filtered by user_id)
   * @route GET /api/materials-tenant
   * @access Private (Tenant Users)
   */
  static async getTenantMaterials(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'material_name', 'tracking_number', 'status', 'priority', 'created_at', 'updated_at'
      ]);

      // Get user_id from query params or from authenticated user
      const userId = req.query.user_id || req.user?.user_id;

      if (!userId) {
        return this.error(res, 'User ID is required', 400);
      }

      // Build dynamic WHERE clause for tenant user materials
      let whereClause = 'WHERE m.deleted_at IS NULL AND m.created_by = ?';
      const queryParams = [userId];

      if (req.query.search) {
        whereClause += ' AND (m.material_name LIKE ? OR m.tracking_number LIKE ? OR m.description LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (req.query.status) {
        whereClause += ' AND m.status = ?';
        queryParams.push(req.query.status);
      }

      if (req.query.category) {
        whereClause += ' AND m.category = ?';
        queryParams.push(req.query.category);
      }

      if (req.query.priority) {
        whereClause += ' AND m.priority = ?';
        queryParams.push(req.query.priority);
      }

      // Get total count
      const total = await this.getCount('materials m', whereClause, queryParams);

      // Get materials with relationships
      const query = `
        SELECT
          m.*,
          t.name as tenant_name,
          u.user_name as created_by_name,
          a.user_name as approved_by_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON m.created_by = u.user_id
        LEFT JOIN users a ON m.approved_by = a.user_id
        ${whereClause}
        ORDER BY m.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const materials = await this.executeQuery(query, queryParams);

      // Fetch material items for each material
      for (const material of materials) {
        const itemsQuery = `
          SELECT * FROM material_items
          WHERE material_id = ?
          ORDER BY created_at ASC
        `;
        material.material_items = await this.executeQuery(itemsQuery, [material.id]);
      }

      return this.paginated(res, materials, total, page, limit, 'Tenant materials retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant materials', 500, error);
    }
  }

  /**
   * Get specific material for tenant user (with user validation)
   * @route GET /api/materials-tenant/:id
   * @access Private (Tenant Users)
   */
  static async getTenantMaterialById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.query.user_id || req.user?.user_id;

      if (!id) {
        return this.error(res, 'Material ID is required', 400);
      }

      if (!userId) {
        return this.error(res, 'User ID is required', 400);
      }

      const query = `
        SELECT
          m.*,
          t.name as tenant_name,
          u.user_name as created_by_name,
          a.user_name as approved_by_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON m.created_by = u.user_id
        LEFT JOIN users a ON m.approved_by = a.user_id
        WHERE m.id = ? AND m.created_by = ? AND m.deleted_at IS NULL
      `;

      const materials = await this.executeQuery(query, [id, userId]);

      if (materials.length === 0) {
        return this.error(res, 'Material not found or access denied', 404);
      }

      const material = materials[0];

      // Get material items
      const itemsQuery = `
        SELECT * FROM material_items
        WHERE material_id = ?
        ORDER BY created_at ASC
      `;
      material.material_items = await this.executeQuery(itemsQuery, [id]);

      // Get timeline (with error handling for missing table)
      let timeline = [];
      try {
        const timelineQuery = `
          SELECT mt.*, u.user_name
          FROM material_timeline mt
          LEFT JOIN users u ON mt.user_id = u.user_id
          WHERE mt.material_id = ?
          ORDER BY mt.created_at DESC
        `;
        timeline = await this.executeQuery(timelineQuery, [id]);
      } catch (error) {
        console.log('Timeline table not found or error fetching timeline:', error.message);
      }

      // Get attachments (with error handling for missing table)
      let attachments = [];
      try {
        const attachmentsQuery = `
          SELECT * FROM material_attachments
          WHERE material_id = ?
          ORDER BY created_at DESC
        `;
        attachments = await this.executeQuery(attachmentsQuery, [id]);
      } catch (error) {
        console.log('Attachments table not found or error fetching attachments:', error.message);
      }

      material.timeline = timeline;
      material.attachments = attachments;

      return this.success(res, material, 'Tenant material retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant material', 500, error);
    }
  }

  /**
   * Create new material - Tenant self-registration
   * @route POST /api/materials/tenant
   * @access Private (Tenant users only)
   */
  static async createTenantMaterial(req, res) {
    try {
      const materialData = req.body;

      console.log('🏢 Tenant material data received:', JSON.stringify(materialData, null, 2));
      console.log('👤 User info:', req.user);

      // Validate required fields
      this.validateRequired(materialData, [
        'company_name', 'due_date', 'material_items'
      ]);

      // Validate material items
      if (!Array.isArray(materialData.material_items) || materialData.material_items.length === 0) {
        return this.error(res, 'At least one material item is required', 400);
      }

      // Sanitize input
      const allowedFields = [
        'company_name', 'due_date', 'due_time', 'vehicle_plate_no', 'tenant_id'
      ];
      const sanitized = this.sanitizeInput(materialData, allowedFields);

      // Auto-fill tenant_id from authenticated user
      if (!sanitized.tenant_id && req.user?.tenant_id) {
        sanitized.tenant_id = req.user.tenant_id;
      }

      // Set material_name
      sanitized.material_name = `Material Entry - ${sanitized.company_name}`;

      // Extract material items
      const materialItems = materialData.material_items;

      // Calculate total quantity
      const totalQuantity = materialItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      sanitized.quantity = totalQuantity;
      sanitized.unit = materialItems.length === 1 ? materialItems[0].measurement : 'items';

      // Auto-fill requester info
      if (req.user) {
        sanitized.requester_name = req.user.user_name || req.user.name || 'Tenant User';
        sanitized.requester_phone = req.user.phone || 'N/A';
      }

      console.log('✅ Sanitized tenant material data:', JSON.stringify(sanitized, null, 2));

      // Generate material ID and tracking number
      const material_id = uuidv4();
      let tracking_number;

      // Use transaction to ensure atomicity
      const connection = await this.getConnection();

      try {
        await connection.beginTransaction();

        // Generate unique tracking number
        tracking_number = await this.generateTrackingNumber(connection);

        // Insert material
        const fields = Object.keys(sanitized);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(sanitized);

        const query = `
          INSERT INTO materials (
            id, tracking_number, ${fields.join(', ')},
            status, created_by, created_at, updated_at
          ) VALUES (?, ?, ${placeholders}, 'pending', ?, NOW(), NOW())
        `;

        await connection.execute(query, [
          material_id,
          tracking_number,
          ...values,
          req.user?.user_id || 1
        ]);

        console.log('✅ Tenant material record inserted with tracking number:', tracking_number);

        // Insert material items
        for (const item of materialItems) {
          const itemQuery = `
            INSERT INTO material_items (
              material_id, item_name, measurement, quantity,
              is_returnable, is_non_returnable, description,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;

          await connection.execute(itemQuery, [
            material_id,
            item.item_name,
            item.measurement,
            item.quantity,
            item.is_returnable ? 1 : 0,
            item.is_non_returnable ? 1 : 0,
            item.description || null
          ]);
        }

        console.log(`✅ All ${materialItems.length} material items inserted`);
        await connection.commit();

      } catch (error) {
        await connection.rollback();
        console.error('❌ Transaction failed, rolling back:', error.message);
        throw error;
      } finally {
        connection.release();
      }

      // Generate QR Code
      const qr_code = await this.generateQRCode(material_id, tracking_number, {
        status: 'pending',
        company_name: sanitized.company_name,
        tenant_id: sanitized.tenant_id
      });

      // Update material with QR code
      if (qr_code) {
        await this.executeQuery('UPDATE materials SET qr_code = ? WHERE id = ?', [qr_code, material_id]);
        console.log('✅ QR code updated in material record');
      }

      // Add to timeline
      await this.addToTimeline(
        material_id,
        'created',
        `Material registered by tenant: ${sanitized.company_name}`,
        req.user?.user_id || 1
      );

      return this.success(res, {
        id: material_id,
        tracking_number,
        qr_code,
        status: 'pending',
        message: 'Material registered successfully. Pending approval.'
      }, 'Tenant material registered successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to register tenant material', 500, error);
    }
  }

  /**
   * Check out material
   * @route PUT /api/materials/:id/checkout
   * @access Private
   */
  static async checkoutMaterial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.user_id;

      // Validate material exists
      const material = await this.executeQuery(
        'SELECT * FROM materials WHERE id = ? AND deleted_at IS NULL',
        [id]
      );

      if (!material.length) {
        return this.error(res, 'Material not found', 404);
      }

      const materialData = material[0];

      // Business Rule 1: Only approved materials can be checked out
      if (materialData.status !== 'approved') {
        return this.error(res, 'Only approved materials can be checked out', 400);
      }

      // Business Rule 2: Check material type restrictions
      const materialType = this.getMaterialType(materialData);
      
      // Entry materials cannot be checked out (only checked in)
      if (materialType === 'entry' && !materialData.is_gust_entry) {
        return this.error(res, 'Entry materials can only be checked in, not checked out', 400);
      }

      // Check if already checked out
      if (materialData.checked_out === 1) {
        return this.error(res, 'Material is already checked out', 400);
      }

      // Update material checkout status
      await this.executeQuery(
        `UPDATE materials SET 
         checked_out = 1, 
         checked_out_at = NOW(), 
         checked_out_by = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [userId, id]
      );

      // Add to timeline
      await this.addToTimeline(
        id,
        'checkout',
        `Material checked out by user ID: ${userId}`,
        userId
      );

      return this.success(res, {
        id,
        checked_out: true,
        checked_out_at: new Date().toISOString(),
        message: 'Material checked out successfully'
      });

    } catch (error) {
      console.error('❌ Failed to checkout material:', error);
      return this.error(res, 'Failed to checkout material', 500);
    }
  }

  /**
   * Check in material
   * @route PUT /api/materials/:id/checkin
   * @access Private
   */
  static async checkinMaterial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.user_id;

      // Validate material exists
      const material = await this.executeQuery(
        'SELECT * FROM materials WHERE id = ? AND deleted_at IS NULL',
        [id]
      );

      if (!material.length) {
        return this.error(res, 'Material not found', 404);
      }

      const materialData = material[0];

      // Business Rule 1: Only approved materials can be checked in
      if (materialData.status !== 'approved') {
        return this.error(res, 'Only approved materials can be checked in', 400);
      }

      // Business Rule 2: Check material type restrictions
      const materialType = this.getMaterialType(materialData);
      
      // Dispensing materials cannot be checked in (only checked out)
      if (materialType === 'dispensing' && !materialData.is_gust_entry) {
        return this.error(res, 'Dispensing materials can only be checked out, not checked in', 400);
      }

      // Allow check-in for all eligible material types without requiring checkout first

      // Update material checkin status
      await this.executeQuery(
        `UPDATE materials SET 
         checked_out = 0,
         checked_in = 1,
         checked_in_at = NOW(),
         checked_in_by = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [userId, id]
      );

      // Add to timeline
      await this.addToTimeline(
        id,
        'checkin',
        `Material checked in by user ID: ${userId}`,
        userId
      );

      return this.success(res, {
        id,
        checked_out: false,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        message: 'Material checked in successfully'
      });

    } catch (error) {
      console.error('❌ Failed to checkin material:', error);
      return this.error(res, 'Failed to checkin material', 500);
    }
  }

  /**
   * Determine material type based on material data
   * @param {Object} material - Material data object
   * @returns {string} - 'entry', 'dispensing', or 'gust'
   */
  static getMaterialType(material) {
    // Check if it's a Gust material
    if (material.is_gust_entry === 1 || material.is_gust_entry === true) {
      return 'gust';
    }

    // Check if material name contains keywords
    const name = (material.material_name || material.company_name || '').toLowerCase();
    const description = (material.description || '').toLowerCase();
    
    if (name.includes('dispense') || name.includes('checkout') || name.includes('check-out')) {
      return 'dispensing';
    }
    
    if (name.includes('entry') || name.includes('incoming') || name.includes('registration')) {
      return 'entry';
    }
    
    // Check if it has tenant_id (tenant materials are typically entry)
    if (material.tenant_id && material.tenant_id !== null) {
      return 'entry';
    }
    
    // Default to dispensing if unclear
    return 'dispensing';
  }
}

module.exports = MaterialController;
