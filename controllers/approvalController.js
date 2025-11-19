/**
 * Enterprise Approval Management Controller
 * Extends BaseController for standardized operations
 * Complete workflow with approval, rejection, escalation, and delegation
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const ValidationService = require('../services/ValidationService');
const AppConfig = require('../config/appConfig');

class ApprovalController extends BaseController {
  /**
   * Get all approvals with advanced filtering, sorting, and pagination
   * @route GET /api/approvals
   * @access Private
   */
  static async getAllApprovals(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'status', 'priority', 'created_at', 'due_date'
      ]);

      let whereClause = 'WHERE a.deleted_at IS NULL';
      const queryParams = [];
      
      if (req.query.status) {
        whereClause += ' AND a.status = ?';
        queryParams.push(req.query.status);
      }
      
      if (req.query.entity_type) {
        whereClause += ' AND a.entity_type = ?';
        queryParams.push(req.query.entity_type);
      }
      
      if (req.query.assigned_to) {
        whereClause += ' AND a.assigned_to = ?';
        queryParams.push(req.query.assigned_to);
      }
      
      if (req.query.priority) {
        whereClause += ' AND a.priority = ?';
        queryParams.push(req.query.priority);
      }
      
      if (req.query.search) {
        whereClause += ' AND (a.notes LIKE ? OR e1.name LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      const total = await this.getCount('approvals a', whereClause, queryParams);

      const query = `
        SELECT 
          a.*,
          e1.name as requested_by_name,
          e2.name as assigned_to_name,
          u1.user_name as requested_by_user,
          u2.user_name as assigned_to_user,
          CASE 
            WHEN a.entity_type = 'material' THEN m.material_name
            WHEN a.entity_type = 'visitor' THEN v.name
            WHEN a.entity_type = 'tenant' THEN t.name
            ELSE CONCAT(a.entity_type, ' #', a.entity_id)
          END as entity_name
        FROM approvals a
        LEFT JOIN users u1 ON a.requested_by = u1.user_id
        LEFT JOIN employees e1 ON u1.employee_id = e1.employee_id
        LEFT JOIN users u2 ON a.assigned_to = u2.user_id
        LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id
        LEFT JOIN materials m ON a.entity_type = 'material' AND a.entity_id = m.id
        LEFT JOIN visitors v ON a.entity_type = 'visitor' AND a.entity_id = v.id
        LEFT JOIN tenants t ON a.entity_type = 'tenant' AND a.entity_id = t.id
        ${whereClause}
        ORDER BY 
          CASE WHEN a.priority = 'urgent' THEN 1
               WHEN a.priority = 'high' THEN 2
               WHEN a.priority = 'medium' THEN 3
               ELSE 4 END,
          a.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const approvals = await this.executeQuery(query, queryParams);

      return this.paginated(res, approvals, total, page, limit, 'Approvals retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch approvals', 500, error);
    }
  }

  /**
   * Get approval by ID
   * @route GET /api/approvals/:id
   * @access Private
   */
  static async getApprovalById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Approval ID is required', 400);
      }

      const query = `
        SELECT 
          a.*,
          e1.name as requested_by_name,
          e2.name as assigned_to_name,
          e3.name as approved_by_name
        FROM approvals a
        LEFT JOIN users u1 ON a.requested_by = u1.user_id
        LEFT JOIN employees e1 ON u1.employee_id = e1.employee_id
        LEFT JOIN users u2 ON a.assigned_to = u2.user_id
        LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id
        LEFT JOIN users u3 ON a.approved_by = u3.user_id
        LEFT JOIN employees e3 ON u3.employee_id = e3.employee_id
        WHERE a.id = ? AND a.deleted_at IS NULL
      `;
      
      const approvals = await this.executeQuery(query, [id]);
      
      if (approvals.length === 0) {
        return this.error(res, 'Approval not found', 404);
      }

      // Get approval history
      const historyQuery = `
        SELECT ah.*, u.user_name, e.name as employee_name
        FROM approval_history ah
        LEFT JOIN users u ON ah.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE ah.approval_id = ?
        ORDER BY ah.created_at DESC
      `;
      const history = await this.executeQuery(historyQuery, [id]);

      const approval = {
        ...approvals[0],
        history
      };
      
      return this.success(res, approval, 'Approval retrieved successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to fetch approval', 500, error);
    }
  }

  /**
   * Create new approval
   * @route POST /api/approvals
   * @access Private
   */
  static async createApproval(req, res) {
    try {
      const approvalData = req.body;
      
      this.validateRequired(approvalData, [
        'entity_type', 'entity_id', 'assigned_to', 'approval_type'
      ]);
      
      const allowedFields = [
        'entity_type', 'entity_id', 'assigned_to', 'approval_type',
        'priority', 'notes', 'due_date', 'metadata'
      ];
      const sanitized = this.sanitizeInput(approvalData, allowedFields);
      
      // Handle metadata
      if (sanitized.metadata && typeof sanitized.metadata === 'object') {
        sanitized.metadata = JSON.stringify(sanitized.metadata);
      }
      
      const fields = Object.keys(sanitized);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(sanitized);
      
      const query = `
        INSERT INTO approvals (
          ${fields.join(', ')}, 
          requested_by, status, created_at, updated_at
        ) VALUES (${placeholders}, ?, 'pending', NOW(), NOW())
      `;
      
      const result = await this.executeQuery(query, [
        ...values, 
        req.user?.user_id || 1
      ]);

      // Add to approval history
      await this.addToHistory(
        result.insertId,
        'created',
        'Approval request created',
        req.user?.user_id || 1
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'create',
        'approval',
        result.insertId,
        sanitized,
        req.ip
      );

      return this.success(res, { id: result.insertId }, 'Approval created successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to create approval', 500, error);
    }
  }

  /**
   * Approve request
   * @route POST /api/approvals/:id/approve
   * @access Private
   */
  static async approve(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      if (!id) {
        return this.error(res, 'Approval ID is required', 400);
      }

      const approval = await this.getById('approvals', id, 'id');
      if (!approval) {
        return this.error(res, 'Approval not found', 404);
      }

      if (approval.status !== 'pending') {
        return this.error(res, `Cannot approve request with status: ${approval.status}`, 400);
      }

      const query = `
        UPDATE approvals 
        SET status = 'approved', 
            approved_by = ?,
            approved_at = NOW(),
            approval_notes = ?,
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [req.user?.user_id || 1, notes, id]);

      // Add to history
      await this.addToHistory(
        id,
        'approved',
        notes || 'Request approved',
        req.user?.user_id || 1
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'approve',
        'approval',
        id,
        { notes },
        req.ip
      );

      return this.success(res, { id, status: 'approved' }, 'Request approved successfully');

    } catch (error) {
      return this.error(res, 'Failed to approve request', 500, error);
    }
  }

  /**
   * Reject request
   * @route POST /api/approvals/:id/reject
   * @access Private
   */
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      if (!id) {
        return this.error(res, 'Approval ID is required', 400);
      }

      if (!notes) {
        return this.error(res, 'Rejection reason is required', 400);
      }

      const approval = await this.getById('approvals', id, 'id');
      if (!approval) {
        return this.error(res, 'Approval not found', 404);
      }

      if (approval.status !== 'pending') {
        return this.error(res, `Cannot reject request with status: ${approval.status}`, 400);
      }

      const query = `
        UPDATE approvals 
        SET status = 'rejected', 
            approved_by = ?,
            approved_at = NOW(),
            approval_notes = ?,
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [req.user?.user_id || 1, notes, id]);

      // Add to history
      await this.addToHistory(
        id,
        'rejected',
        notes,
        req.user?.user_id || 1
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'reject',
        'approval',
        id,
        { notes },
        req.ip
      );

      return this.success(res, { id, status: 'rejected' }, 'Request rejected successfully');

    } catch (error) {
      return this.error(res, 'Failed to reject request', 500, error);
    }
  }

  /**
   * Escalate approval
   * @route POST /api/approvals/:id/escalate
   * @access Private
   */
  static async escalate(req, res) {
    try {
      const { id } = req.params;
      const { escalate_to, reason } = req.body;
      
      if (!id || !escalate_to) {
        return this.error(res, 'Approval ID and escalate_to user are required', 400);
      }

      const approval = await this.getById('approvals', id, 'id');
      if (!approval) {
        return this.error(res, 'Approval not found', 404);
      }

      if (approval.status !== 'pending') {
        return this.error(res, `Cannot escalate request with status: ${approval.status}`, 400);
      }

      const query = `
        UPDATE approvals 
        SET assigned_to = ?,
            priority = 'urgent',
            notes = CONCAT(COALESCE(notes, ''), '\n[ESCALATED]: ', ?),
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [escalate_to, reason || 'No reason provided', id]);

      // Add to history
      await this.addToHistory(
        id,
        'escalated',
        `Escalated to another approver: ${reason || 'No reason provided'}`,
        req.user?.user_id || 1
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'escalate',
        'approval',
        id,
        { escalate_to, reason },
        req.ip
      );

      return this.success(res, { id }, 'Request escalated successfully');

    } catch (error) {
      return this.error(res, 'Failed to escalate request', 500, error);
    }
  }

  /**
   * Delegate approval
   * @route POST /api/approvals/:id/delegate
   * @access Private
   */
  static async delegate(req, res) {
    try {
      const { id } = req.params;
      const { delegate_to, reason } = req.body;
      
      if (!id || !delegate_to) {
        return this.error(res, 'Approval ID and delegate_to user are required', 400);
      }

      const approval = await this.getById('approvals', id, 'id');
      if (!approval) {
        return this.error(res, 'Approval not found', 404);
      }

      if (approval.status !== 'pending') {
        return this.error(res, `Cannot delegate request with status: ${approval.status}`, 400);
      }

      const query = `
        UPDATE approvals 
        SET assigned_to = ?,
            notes = CONCAT(COALESCE(notes, ''), '\n[DELEGATED]: ', ?),
            updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await this.executeQuery(query, [delegate_to, reason || 'No reason provided', id]);

      // Add to history
      await this.addToHistory(
        id,
        'delegated',
        `Delegated to another approver: ${reason || 'No reason provided'}`,
        req.user?.user_id || 1
      );

      await this.logActivity(
        req.user?.user_id || 1,
        'delegate',
        'approval',
        id,
        { delegate_to, reason },
        req.ip
      );

      return this.success(res, { id }, 'Request delegated successfully');

    } catch (error) {
      return this.error(res, 'Failed to delegate request', 500, error);
    }
  }

  /**
   * Get approval history
   * @route GET /api/approvals/:id/history
   * @access Private
   */
  static async getApprovalHistory(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT ah.*, u.user_name, e.name as employee_name
        FROM approval_history ah
        LEFT JOIN users u ON ah.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE ah.approval_id = ?
        ORDER BY ah.created_at DESC
      `;

      const history = await this.executeQuery(query, [id]);

      return this.success(res, history, 'Approval history retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch approval history', 500, error);
    }
  }

  /**
   * Get approval statistics
   * @route GET /api/approvals/stats
   * @access Private
   */
  static async getApprovalStats(req, res) {
    try {
      const { assigned_to, entity_type } = req.query;
      let whereClause = 'WHERE deleted_at IS NULL';
      const params = [];

      if (assigned_to) {
        whereClause += ' AND assigned_to = ?';
        params.push(assigned_to);
      }

      if (entity_type) {
        whereClause += ' AND entity_type = ?';
        params.push(entity_type);
      }

      // Status distribution
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM approvals
        ${whereClause}
        GROUP BY status
      `;
      const statusStats = await this.executeQuery(statusQuery, params);

      // Priority distribution
      const priorityQuery = `
        SELECT priority, COUNT(*) as count
        FROM approvals
        ${whereClause}
        GROUP BY priority
      `;
      const priorityStats = await this.executeQuery(priorityQuery, params);

      // Overdue count
      const overdueQuery = `
        SELECT COUNT(*) as count
        FROM approvals
        ${whereClause} AND status = 'pending' AND due_date < NOW()
      `;
      const overdueStats = await this.executeQuery(overdueQuery, params);

      const total = await this.getCount('approvals', whereClause, params);

      const stats = {
        total,
        statusDistribution: statusStats,
        priorityDistribution: priorityStats,
        overdueCount: overdueStats[0].count,
        last_updated: new Date().toISOString()
      };

      return this.success(res, stats, 'Statistics retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch statistics', 500, error);
    }
  }

  /**
   * Delete approval (soft delete)
   * @route DELETE /api/approvals/:id
   * @access Private
   */
  static async deleteApproval(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Approval ID is required', 400);
      }

      const success = await this.softDelete('approvals', id, 'id');
      
      if (!success) {
        return this.error(res, 'Approval not found', 404);
      }

      await this.logActivity(
        req.user?.user_id || 1,
        'delete',
        'approval',
        id,
        {},
        req.ip
      );

      return this.success(res, { id }, 'Approval deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete approval', 500, error);
    }
  }

  // Helper Methods

  /**
   * Add entry to approval history
   */
  static async addToHistory(approval_id, action, description, user_id) {
    const query = `
      INSERT INTO approval_history (approval_id, action, description, user_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    await this.executeQuery(query, [approval_id, action, description, user_id]);
  }
}

module.exports = ApprovalController;
