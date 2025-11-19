/**
 * Enterprise Visitor Management Controller
 * Extends BaseController for standardized operations
 * Complete CRUD with check-in/out, QR codes, and visitor passes
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const ValidationService = require('../services/ValidationService');
const AppConfig = require('../config/appConfig');
const QRCode = require('qrcode');

// Dynamic import for ESM uuid module
let uuidv4;
(async () => {
  const uuid = await import('uuid');
  uuidv4 = uuid.v4;
})();

class VisitorController extends BaseController {
  /**
   * Get all visitors with advanced filtering, sorting, and pagination
   * @route GET /api/visitors
   * @access Private
   */
  static async getVisitors(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'name', 'visitor_number', 'status', 'visit_date', 'created_at'
      ]);

      let whereClause = 'WHERE v.deleted_at IS NULL';
      const queryParams = [];
      
      if (req.query.search) {
        whereClause += ' AND (v.name LIKE ? OR v.email LIKE ? OR v.company LIKE ? OR v.visitor_number LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (req.query.status) {
        whereClause += ' AND v.status = ?';
        queryParams.push(req.query.status);
      }
      
      if (req.query.tenant_id) {
        whereClause += ' AND v.tenant_id = ?';
        queryParams.push(req.query.tenant_id);
      }
      
      if (req.query.visit_date) {
        whereClause += ' AND DATE(v.visit_date) = ?';
        queryParams.push(req.query.visit_date);
      }

      const total = await this.getCount('visitors v', whereClause, queryParams);

      const query = `
        SELECT 
          v.*,
          t.name as tenant_name,
          e.name as host_name,
          TIMESTAMPDIFF(MINUTE, v.check_in_time, COALESCE(v.check_out_time, NOW())) as duration_minutes
        FROM visitors v
        LEFT JOIN tenants t ON v.tenant_id = t.id
        LEFT JOIN employees e ON v.host_id = e.employee_id
        ${whereClause}
        ORDER BY v.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const visitors = await this.executeQuery(query, queryParams);

      return this.paginated(res, visitors, total, page, limit, 'Visitors retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch visitors', 500, error);
    }
  }

  /**
   * Get visitor by ID
   * @route GET /api/visitors/:id
   * @access Private
   */
  static async getVisitorById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Visitor ID is required', 400);
      }

      const query = `
        SELECT v.*, t.name as tenant_name, e.name as host_name
        FROM visitors v
        LEFT JOIN tenants t ON v.tenant_id = t.id
        LEFT JOIN employees e ON v.host_id = e.employee_id
        WHERE v.id = ? AND v.deleted_at IS NULL
      `;
      
      const visitors = await this.executeQuery(query, [id]);
      
      if (visitors.length === 0) {
        return this.error(res, 'Visitor not found', 404);
      }

      // Parse metadata if exists
      const visitor = visitors[0];
      if (visitor.metadata && typeof visitor.metadata === 'string') {
        try {
          visitor.metadata = JSON.parse(visitor.metadata);
        } catch (e) {
          visitor.metadata = {};
        }
      }
      
      return this.success(res, visitor, 'Visitor retrieved successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to fetch visitor', 500, error);
    }
  }

  /**
   * Create new visitor (pre-registration)
   * @route POST /api/visitors
   * @access Private/Public
   */
  static async createVisitor(req, res) {
    try {
      const visitorData = req.body;
      
      this.validateRequired(visitorData, ['name', 'email', 'phone', 'tenant_id', 'visit_date']);
      
      const allowedFields = [
        'name', 'email', 'phone', 'company', 'purpose', 'tenant_id', 
        'host_id', 'visit_date', 'expected_duration', 'vehicle_number',
        'id_type', 'id_number', 'photo_url', 'metadata'
      ];
      const sanitized = this.sanitizeInput(visitorData, allowedFields);
      
      const visitor_id = uuidv4();
      const visitor_number = await this.generateVisitorNumber();
      
      // Handle metadata
      if (sanitized.metadata && typeof sanitized.metadata === 'object') {
        sanitized.metadata = JSON.stringify(sanitized.metadata);
      }
      
      const fields = Object.keys(sanitized);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(sanitized);
      
      const query = `
        INSERT INTO visitors (
          id, visitor_number, ${fields.join(', ')}, 
          status, created_by, created_at, updated_at
        ) VALUES (?, ?, ${placeholders}, 'pre_registered', ?, NOW(), NOW())
      `;
      
      await this.executeQuery(query, [
        visitor_id, 
        visitor_number, 
        ...values, 
        req.user?.user_id || 1
      ]);

      // Generate QR code
      const qr_code = await this.generateVisitorQR(visitor_id, visitor_number);
      
      await this.executeQuery(
        'UPDATE visitors SET qr_code = ? WHERE id = ?', 
        [qr_code, visitor_id]
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'create',
        'visitor',
        visitor_id,
        sanitized,
        req.ip
      );

      return this.success(res, {
        id: visitor_id,
        visitor_number,
        qr_code
      }, 'Visitor registered successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to create visitor', 500, error);
    }
  }

  /**
   * Check-in visitor
   * @route POST /api/visitors/:id/checkin
   * @access Private
   */
  static async checkIn(req, res) {
    try {
      const { id } = req.params;
      const { gate_id, temperature, notes } = req.body;
      
      if (!id) {
        return this.error(res, 'Visitor ID is required', 400);
      }

      // Check visitor exists and is pre-registered
      const visitor = await this.getById('visitors', id, 'id');
      if (!visitor) {
        return this.error(res, 'Visitor not found', 404);
      }

      if (visitor.status !== 'pre_registered' && visitor.status !== 'checked_out') {
        return this.error(res, `Cannot check in visitor with status: ${visitor.status}`, 400);
      }

      const query = `
        UPDATE visitors 
        SET status = 'checked_in', 
            check_in_time = NOW(), 
            check_in_gate = ?,
            temperature = ?,
            check_in_notes = ?,
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [gate_id || 'main_gate', temperature, notes, id]);

      await this.logActivity(
        req.user?.user_id || 1,
        'check_in',
        'visitor',
        id,
        { gate_id, temperature, notes },
        req.ip
      );

      return this.success(res, { 
        id, 
        status: 'checked_in',
        check_in_time: new Date().toISOString()
      }, 'Visitor checked in successfully');

    } catch (error) {
      return this.error(res, 'Failed to check in visitor', 500, error);
    }
  }

  /**
   * Check-out visitor
   * @route POST /api/visitors/:id/checkout
   * @access Private
   */
  static async checkOut(req, res) {
    try {
      const { id } = req.params;
      const { gate_id, notes } = req.body;
      
      if (!id) {
        return this.error(res, 'Visitor ID is required', 400);
      }

      const visitor = await this.getById('visitors', id, 'id');
      if (!visitor) {
        return this.error(res, 'Visitor not found', 404);
      }

      if (visitor.status !== 'checked_in') {
        return this.error(res, `Cannot check out visitor with status: ${visitor.status}`, 400);
      }

      const query = `
        UPDATE visitors 
        SET status = 'checked_out', 
            check_out_time = NOW(), 
            check_out_gate = ?,
            check_out_notes = ?,
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [gate_id || 'main_gate', notes, id]);

      await this.logActivity(
        req.user?.user_id || 1,
        'check_out',
        'visitor',
        id,
        { gate_id, notes },
        req.ip
      );

      return this.success(res, { 
        id, 
        status: 'checked_out',
        check_out_time: new Date().toISOString()
      }, 'Visitor checked out successfully');

    } catch (error) {
      return this.error(res, 'Failed to check out visitor', 500, error);
    }
  }

  /**
   * Update visitor
   * @route PUT /api/visitors/:id
   * @access Private
   */
  static async updateVisitor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return this.error(res, 'Visitor ID is required', 400);
      }

      const exists = await this.exists('visitors', 'id', id);
      if (!exists) {
        return this.error(res, 'Visitor not found', 404);
      }

      const allowedFields = [
        'name', 'email', 'phone', 'company', 'purpose', 
        'visit_date', 'expected_duration', 'vehicle_number',
        'id_type', 'id_number', 'photo_url', 'metadata'
      ];
      const sanitized = this.sanitizeInput(updateData, allowedFields);
      
      if (Object.keys(sanitized).length === 0) {
        return this.error(res, 'No valid fields to update', 400);
      }

      if (sanitized.metadata && typeof sanitized.metadata === 'object') {
        sanitized.metadata = JSON.stringify(sanitized.metadata);
      }

      const setClause = Object.keys(sanitized).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(sanitized), id];
      
      const query = `
        UPDATE visitors 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, values);

      await this.logActivity(
        req.user?.user_id || 1,
        'update',
        'visitor',
        id,
        sanitized,
        req.ip
      );

      return this.success(res, { id }, 'Visitor updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update visitor', 500, error);
    }
  }

  /**
   * Delete visitor (soft delete)
   * @route DELETE /api/visitors/:id
   * @access Private
   */
  static async deleteVisitor(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Visitor ID is required', 400);
      }

      const success = await this.softDelete('visitors', id, 'id');
      
      if (!success) {
        return this.error(res, 'Visitor not found', 404);
      }

      await this.logActivity(
        req.user?.user_id || 1,
        'delete',
        'visitor',
        id,
        {},
        req.ip
      );

      return this.success(res, { id }, 'Visitor deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete visitor', 500, error);
    }
  }

  /**
   * Validate visitor QR code
   * @route POST /api/visitors/validate-qr
   * @access Private
   */
  static async validateVisitorQR(req, res) {
    try {
      const { qr_code, gate_id } = req.body;

      if (!qr_code) {
        return this.error(res, 'QR code is required', 400);
      }

      let qrData;
      try {
        qrData = JSON.parse(qr_code);
      } catch (parseError) {
        return this.error(res, 'Invalid QR code format', 400);
      }

      const { visitor_id, visitor_number } = qrData;

      const query = `
        SELECT v.*, t.name as tenant_name, e.name as host_name
        FROM visitors v
        LEFT JOIN tenants t ON v.tenant_id = t.id
        LEFT JOIN employees e ON v.host_id = e.employee_id
        WHERE v.id = ? AND v.visitor_number = ? AND v.deleted_at IS NULL
      `;

      const visitors = await this.executeQuery(query, [visitor_id, visitor_number]);

      if (visitors.length === 0) {
        return this.error(res, 'Visitor not found or QR code invalid', 404);
      }

      const visitor = visitors[0];

      return this.success(res, {
        visitor: {
          id: visitor.id,
          name: visitor.name,
          visitor_number: visitor.visitor_number,
          status: visitor.status,
          tenant: visitor.tenant_name,
          host: visitor.host_name,
          visit_date: visitor.visit_date
        },
        validation: {
          gate_id: gate_id || 'main_gate',
          validated_at: new Date().toISOString(),
          is_valid: true
        }
      }, 'QR code validated successfully');

    } catch (error) {
      return this.error(res, 'Failed to validate QR code', 500, error);
    }
  }

  /**
   * Get visitor statistics
   * @route GET /api/visitors/stats
   * @access Private
   */
  static async getVisitorStats(req, res) {
    try {
      const { tenant_id } = req.query;
      let whereClause = 'WHERE deleted_at IS NULL';
      const params = [];

      if (tenant_id) {
        whereClause += ' AND tenant_id = ?';
        params.push(tenant_id);
      }

      const statsQuery = `
        SELECT status, COUNT(*) as count
        FROM visitors
        ${whereClause}
        GROUP BY status
      `;
      const statusStats = await this.executeQuery(statsQuery, params);

      const todayQuery = `
        SELECT COUNT(*) as count
        FROM visitors
        ${whereClause} AND DATE(visit_date) = CURDATE()
      `;
      const todayStats = await this.executeQuery(todayQuery, params);

      const checkedInQuery = `
        SELECT COUNT(*) as count
        FROM visitors
        ${whereClause} AND status = 'checked_in'
      `;
      const checkedInStats = await this.executeQuery(checkedInQuery, params);

      const total = await this.getCount('visitors', whereClause, params);

      const stats = {
        total,
        statusDistribution: statusStats,
        todayVisitors: todayStats[0].count,
        currentlyCheckedIn: checkedInStats[0].count,
        last_updated: new Date().toISOString()
      };

      return this.success(res, stats, 'Statistics retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch statistics', 500, error);
    }
  }

  // Helper Methods

  /**
   * Generate unique visitor number
   */
  static async generateVisitorNumber() {
    const prefix = 'VIS';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const todayStart = `${year}-${month}-${day} 00:00:00`;
    const todayEnd = `${year}-${month}-${day} 23:59:59`;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM visitors 
      WHERE created_at BETWEEN ? AND ?
    `;
    
    const result = await this.executeQuery(countQuery, [todayStart, todayEnd]);
    const sequence = String(result[0].count + 1).padStart(4, '0');
    
    return `${prefix}-${year}${month}${day}-${sequence}`;
  }

  /**
   * Generate visitor QR code
   */
  static async generateVisitorQR(visitor_id, visitor_number) {
    try {
      const qrData = {
        visitor_id,
        visitor_number,
        type: 'visitor',
        generated_at: new Date().toISOString()
      };

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
}

module.exports = VisitorController;
