/**
 * Gate Pass Controller
 * Handles gate pass validation and logging
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const QRCode = require('qrcode');

class GatePassController extends BaseController {
  /**
   * Validate gate pass QR code
   * @route POST /api/gate-pass/validate
   * @access Private
   */
  static async validateGatePass(req, res) {
    try {
      const { qr_code_data, gate_id, action, notes } = req.body;

      if (!qr_code_data) {
        return this.error(res, 'QR code data is required', 400);
      }

      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(qr_code_data);
      } catch (parseError) {
        return this.error(res, 'Invalid QR code format', 400);
      }

      const { material_id, tracking_number } = qrData;

      if (!material_id || !tracking_number) {
        return this.error(res, 'Invalid QR code data', 400);
      }

      // Get material details
      const materialQuery = `
        SELECT 
          m.*,
          t.name as tenant_name,
          u.user_name as created_by_name
        FROM materials m
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON m.created_by = u.user_id
        WHERE m.id = ? AND m.tracking_number = ? AND m.deleted_at IS NULL
      `;

      const materials = await this.executeQuery(materialQuery, [material_id, tracking_number]);

      if (materials.length === 0) {
        return this.error(res, 'Material not found or QR code invalid', 404);
      }

      const material = materials[0];

      // Check if material is approved
      if (material.status !== 'approved' && material.status !== 'in_transit') {
        return this.error(res, `Material cannot pass gate. Current status: ${material.status}`, 400);
      }

      // Log gate pass validation
      const logQuery = `
        INSERT INTO gate_pass_logs 
        (material_id, gate_id, action, validated_by, validated_at, notes)
        VALUES (?, ?, ?, ?, NOW(), ?)
      `;

      const result = await this.executeQuery(logQuery, [
        material_id,
        gate_id || 'main_gate',
        action || 'entry',
        req.user?.user_id || null,
        notes || null
      ]);

      // Update material status if needed
      if (action === 'entry' && material.status === 'approved') {
        await this.executeQuery(
          'UPDATE materials SET status = ?, updated_at = NOW() WHERE id = ?',
          ['in_transit', material_id]
        );
      } else if (action === 'exit' && material.status === 'in_transit') {
        await this.executeQuery(
          'UPDATE materials SET status = ?, updated_at = NOW() WHERE id = ?',
          ['delivered', material_id]
        );
      }

      // Add timeline entry
      await this.addToTimeline(
        material_id,
        'gate_pass_validated',
        `Gate pass validated at ${gate_id || 'main gate'} - ${action || 'entry'}${notes ? ': ' + notes : ''}`,
        req.user?.user_id || null
      );

      return this.success(res, {
        log_id: result.insertId,
        material: {
          id: material.id,
          tracking_number: material.tracking_number,
          name: material.material_name,
          status: action === 'entry' ? 'in_transit' : (action === 'exit' ? 'delivered' : material.status),
          tenant: material.tenant_name,
          recipient: material.recipient_name
        },
        validation: {
          gate_id: gate_id || 'main_gate',
          action: action || 'entry',
          validated_by: req.user?.user_name || 'System',
          validated_at: new Date().toISOString()
        }
      }, 'Gate pass validated successfully');

    } catch (error) {
      return this.error(res, 'Failed to validate gate pass', 500, error);
    }
  }

  /**
   * Get gate pass logs for a material
   * @route GET /api/materials/:id/gate-logs
   * @access Private
   */
  static async getMaterialGateLogs(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          gpl.*,
          u.user_name as validated_by_name
        FROM gate_pass_logs gpl
        LEFT JOIN users u ON gpl.validated_by = u.user_id
        WHERE gpl.material_id = ?
        ORDER BY gpl.validated_at DESC
      `;

      const logs = await this.executeQuery(query, [id]);

      return this.success(res, logs, 'Gate pass logs retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve gate logs', 500, error);
    }
  }

  /**
   * Get all gate pass logs with filtering
   * @route GET /api/gate-pass/logs
   * @access Private
   */
  static async getAllGateLogs(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'validated_at', 'gate_id', 'action'
      ]);

      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (req.query.gate_id) {
        whereClause += ' AND gpl.gate_id = ?';
        queryParams.push(req.query.gate_id);
      }

      if (req.query.action) {
        whereClause += ' AND gpl.action = ?';
        queryParams.push(req.query.action);
      }

      if (req.query.date_from) {
        whereClause += ' AND gpl.validated_at >= ?';
        queryParams.push(req.query.date_from);
      }

      if (req.query.date_to) {
        whereClause += ' AND gpl.validated_at <= ?';
        queryParams.push(req.query.date_to);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM gate_pass_logs gpl ${whereClause}`;
      const countResult = await this.executeQuery(countQuery, queryParams);
      const total = countResult[0].count;

      // Get logs
      const query = `
        SELECT 
          gpl.*,
          m.tracking_number,
          m.material_name,
          m.status as material_status,
          t.name as tenant_name,
          u.user_name as validated_by_name
        FROM gate_pass_logs gpl
        LEFT JOIN materials m ON gpl.material_id = m.id
        LEFT JOIN tenants t ON m.tenant_id = t.id
        LEFT JOIN users u ON gpl.validated_by = u.user_id
        ${whereClause}
        ORDER BY gpl.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const logs = await this.executeQuery(query, queryParams);

      return this.paginated(res, logs, total, page, limit, 'Gate pass logs retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve gate logs', 500, error);
    }
  }

  /**
   * Get gate pass statistics
   * @route GET /api/gate-pass/stats
   * @access Private
   */
  static async getGatePassStats(req, res) {
    try {
      const { gate_id, date_from, date_to } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (gate_id) {
        whereClause += ' AND gate_id = ?';
        params.push(gate_id);
      }

      if (date_from) {
        whereClause += ' AND validated_at >= ?';
        params.push(date_from);
      }

      if (date_to) {
        whereClause += ' AND validated_at <= ?';
        params.push(date_to);
      }

      // Total validations
      const totalQuery = `SELECT COUNT(*) as count FROM gate_pass_logs ${whereClause}`;
      const totalResult = await this.executeQuery(totalQuery, params);

      // By action
      const actionQuery = `
        SELECT action, COUNT(*) as count
        FROM gate_pass_logs
        ${whereClause}
        GROUP BY action
      `;
      const actionStats = await this.executeQuery(actionQuery, params);

      // By gate
      const gateQuery = `
        SELECT gate_id, COUNT(*) as count
        FROM gate_pass_logs
        ${whereClause}
        GROUP BY gate_id
      `;
      const gateStats = await this.executeQuery(gateQuery, params);

      // Today's count
      const todayQuery = `
        SELECT COUNT(*) as count
        FROM gate_pass_logs
        ${whereClause} AND DATE(validated_at) = CURDATE()
      `;
      const todayResult = await this.executeQuery(todayQuery, params);

      const stats = {
        total_validations: totalResult[0].count,
        today_validations: todayResult[0].count,
        by_action: actionStats,
        by_gate: gateStats,
        last_updated: new Date().toISOString()
      };

      return this.success(res, stats, 'Gate pass statistics retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve statistics', 500, error);
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
}

module.exports = GatePassController;
