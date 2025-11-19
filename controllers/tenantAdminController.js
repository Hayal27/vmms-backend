/**
 * Tenant Administration Controller
 * Comprehensive tenant representative and user management system
 * Each tenant company has designated administrators who manage their operations
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const AppConfig = require('../config/appConfig');
const bcrypt = require('bcrypt');

class TenantAdminController extends BaseController {

  /**
   * Get tenant users and their roles
   * @route GET /api/tenants/:tenantId/admin/users
   * @access Private (Tenant Admin)
   */
  static async getTenantUsers(req, res) {
    try {
      res.locals.startTime = Date.now();
      const { tenantId } = req.params;
      const { search, role, status } = req.query;
      const { page, limit, offset } = this.validatePagination(req.query);

      // Verify tenant exists and user has access
      const tenantAccess = await this.verifyTenantAccess(req.user?.user_id, tenantId);
      if (!tenantAccess.hasAccess) {
        return this.error(res, tenantAccess.message, tenantAccess.statusCode);
      }

      // Build dynamic WHERE clause
      let whereClause = 'WHERE tu.tenant_id = ? AND tu.deleted_at IS NULL';
      const queryParams = [tenantId];

      if (search) {
        whereClause += ' AND (u.user_name LIKE ? OR e.fname LIKE ? OR e.lname LIKE ? OR e.email LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (role) {
        whereClause += ' AND tu.tenant_role = ?';
        queryParams.push(role);
      }

      if (status) {
        whereClause += ' AND tu.status = ?';
        queryParams.push(status);
      }

      // Get tenant users with comprehensive data
      const query = `
        SELECT 
          tu.id as assignment_id,
          tu.tenant_id,
          tu.tenant_role,
          tu.permissions,
          tu.status as assignment_status,
          tu.assigned_at,
          tu.assigned_by,
          u.user_id,
          u.user_name,
          u.avatar_url,
          u.last_login,
          u.status as user_status,
          e.fname,
          e.lname,
          e.email,
          e.phone,
          d.name as department_name,
          r.role_name as system_role,
          ab.user_name as assigned_by_name,
          -- Activity metrics for this tenant
          (SELECT COUNT(*) FROM materials WHERE tenant_id = tu.tenant_id AND created_by = u.user_id) as materials_created,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = tu.tenant_id AND created_by = u.user_id) as visitors_managed,
          (SELECT COUNT(*) FROM tenant_activity_logs WHERE tenant_id = tu.tenant_id AND user_id = u.user_id) as total_activities,
          -- Recent activity
          (SELECT MAX(created_at) FROM tenant_activity_logs WHERE tenant_id = tu.tenant_id AND user_id = u.user_id) as last_activity
        FROM tenant_users tu
        LEFT JOIN users u ON tu.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN users ab ON tu.assigned_by = ab.user_id
        ${whereClause}
        ORDER BY tu.tenant_role DESC, tu.assigned_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const tenantUsers = await this.executeQuery(query, queryParams);

      // Process tenant user data
      const processedUsers = tenantUsers.map(user => this.processTenantUserData(user));

      // Get total count
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM tenant_users tu
        LEFT JOIN users u ON tu.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        ${whereClause}
      `;
      const total = await this.executeQuery(totalQuery, queryParams.slice(0, -2));

      // Get role distribution stats
      const roleStats = await this.executeQuery(
        'SELECT tenant_role, COUNT(*) as count FROM tenant_users WHERE tenant_id = ? AND deleted_at IS NULL GROUP BY tenant_role',
        [tenantId]
      );

      const response = {
        users: processedUsers,
        stats: {
          total: total[0].total,
          roleDistribution: roleStats.reduce((acc, stat) => {
            acc[stat.tenant_role] = stat.count;
            return acc;
          }, {}),
          tenant: tenantAccess.tenant
        }
      };

      return this.paginated(res, processedUsers, total[0].total, page, limit, 'Tenant users retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant users', 500, error);
    }
  }

  /**
   * Assign user to tenant with specific role and permissions
   * @route POST /api/tenants/:tenantId/admin/users
   * @access Private (Tenant Admin with user management permissions)
   */
  static async assignUserToTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { user_id, tenant_role, custom_permissions, notify_user } = req.body;

      // Validate required fields
      this.validateRequired({ user_id, tenant_role }, ['user_id', 'tenant_role']);

      // Verify tenant access and permissions
      const tenantAccess = await this.verifyTenantAccess(req.user?.user_id, tenantId, 'users.invite');
      if (!tenantAccess.hasAccess) {
        return this.error(res, tenantAccess.message, tenantAccess.statusCode);
      }

      // Verify user exists and is not already assigned
      const userCheck = await this.executeQuery(
        `SELECT u.user_id, u.user_name, e.fname, e.lname, e.email,
                (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND user_id = ? AND deleted_at IS NULL) as already_assigned
         FROM users u 
         LEFT JOIN employees e ON u.employee_id = e.employee_id 
         WHERE u.user_id = ?`,
        [tenantId, user_id, user_id]
      );

      if (userCheck.length === 0) {
        return this.error(res, 'User not found', 404);
      }

      if (userCheck[0].already_assigned > 0) {
        return this.error(res, 'User is already assigned to this tenant', 400);
      }

      // Validate tenant role
      const validRoles = ['admin', 'manager', 'operator', 'viewer'];
      if (!validRoles.includes(tenant_role)) {
        return this.error(res, 'Invalid tenant role. Must be one of: ' + validRoles.join(', '), 400);
      }

      // Generate permissions based on role
      const permissions = custom_permissions || this.generateTenantPermissions(tenant_role);

      // Create assignment
      const assignmentResult = await this.executeQuery(
        `INSERT INTO tenant_users (
          tenant_id, user_id, tenant_role, permissions, status, 
          assigned_by, assigned_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, NOW(), NOW(), NOW())`,
        [
          tenantId,
          user_id,
          tenant_role,
          JSON.stringify(permissions),
          req.user?.user_id || 1
        ]
      );

      // Log activity
      await this.logTenantActivity(
        tenantId,
        req.user?.user_id,
        'user_assigned',
        'tenant_user',
        assignmentResult.insertId,
        `User ${userCheck[0].user_name} assigned as ${tenant_role}`,
        { user_id, tenant_role, permissions },
        req.ip
      );

      // Send notification if requested
      if (notify_user) {
        await this.sendTenantAssignmentNotification(userCheck[0], tenantAccess.tenant, tenant_role);
      }

      return this.success(res, {
        assignment_id: assignmentResult.insertId,
        tenant_id: tenantId,
        user_id: user_id,
        tenant_role: tenant_role,
        permissions: permissions,
        user_info: userCheck[0]
      }, 'User assigned to tenant successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to assign user to tenant', 500, error);
    }
  }

  /**
   * Update tenant user role and permissions
   * @route PUT /api/tenants/:tenantId/admin/users/:userId
   * @access Private (Tenant Admin)
   */
  static async updateTenantUser(req, res) {
    try {
      const { tenantId, userId } = req.params;
      const { tenant_role, permissions, status } = req.body;

      // Verify tenant access
      const tenantAccess = await this.verifyTenantAccess(req.user?.user_id, tenantId, 'users.edit');
      if (!tenantAccess.hasAccess) {
        return this.error(res, tenantAccess.message, tenantAccess.statusCode);
      }

      // Get current assignment
      const assignment = await this.executeQuery(
        'SELECT * FROM tenant_users WHERE tenant_id = ? AND user_id = ? AND deleted_at IS NULL',
        [tenantId, userId]
      );

      if (assignment.length === 0) {
        return this.error(res, 'User assignment not found', 404);
      }

      // Build update data
      const updateData = {};
      const changes = [];

      if (tenant_role && tenant_role !== assignment[0].tenant_role) {
        const validRoles = ['admin', 'manager', 'operator', 'viewer'];
        if (!validRoles.includes(tenant_role)) {
          return this.error(res, 'Invalid tenant role', 400);
        }
        updateData.tenant_role = tenant_role;
        updateData.permissions = JSON.stringify(permissions || this.generateTenantPermissions(tenant_role));
        changes.push(`Role changed from ${assignment[0].tenant_role} to ${tenant_role}`);
      }

      if (permissions && !tenant_role) {
        updateData.permissions = JSON.stringify(permissions);
        changes.push('Permissions updated');
      }

      if (status && status !== assignment[0].status) {
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
          return this.error(res, 'Invalid status', 400);
        }
        updateData.status = status;
        changes.push(`Status changed from ${assignment[0].status} to ${status}`);
      }

      if (Object.keys(updateData).length === 0) {
        return this.error(res, 'No valid fields to update', 400);
      }

      // Update assignment
      const updateFields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
      const updateValues = Object.values(updateData);

      await this.executeQuery(
        `UPDATE tenant_users SET ${updateFields}, updated_at = NOW() WHERE tenant_id = ? AND user_id = ?`,
        [...updateValues, tenantId, userId]
      );

      // Log activity
      await this.logTenantActivity(
        tenantId,
        req.user?.user_id,
        'user_updated',
        'tenant_user',
        assignment[0].id,
        changes.join(', '),
        updateData,
        req.ip
      );

      return this.success(res, { 
        tenant_id: tenantId, 
        user_id: userId, 
        changes: changes,
        ...updateData 
      }, 'Tenant user updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update tenant user', 500, error);
    }
  }

  /**
   * Get tenant dashboard with comprehensive metrics
   * @route GET /api/tenants/:tenantId/admin/dashboard
   * @access Private (Tenant User)
   */
  static async getTenantDashboard(req, res) {
    try {
      const { tenantId } = req.params;

      // Verify tenant access
      const tenantAccess = await this.verifyTenantAccess(req.user?.user_id, tenantId);
      if (!tenantAccess.hasAccess) {
        return this.error(res, tenantAccess.message, tenantAccess.statusCode);
      }

      // Get comprehensive dashboard metrics
      const metricsQuery = `
        SELECT 
          -- Visitor metrics
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(created_at) = CURDATE()) as today_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND status = 'checked_in') as active_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as week_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as month_visitors,
          
          -- Material metrics
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND status = 'pending') as pending_materials,
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND status = 'in_transit') as transit_materials,
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND DATE(created_at) = CURDATE()) as today_materials,
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ?) as total_materials,
          
          -- User metrics
          (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND status = 'active' AND deleted_at IS NULL) as active_users,
          (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND tenant_role = 'admin' AND deleted_at IS NULL) as admin_users,
          
          -- Approval metrics
          (SELECT COUNT(*) FROM approvals WHERE entity_type = 'material' AND entity_id IN (SELECT id FROM materials WHERE tenant_id = ?) AND status = 'pending') as pending_approvals
      `;

      const metrics = await this.executeQuery(metricsQuery, Array(11).fill(tenantId));

      // Get recent activities
      const recentActivities = await this.executeQuery(
        `SELECT tal.*, u.user_name, e.fname, e.lname
         FROM tenant_activity_logs tal
         LEFT JOIN users u ON tal.user_id = u.user_id
         LEFT JOIN employees e ON u.employee_id = e.employee_id
         WHERE tal.tenant_id = ?
         ORDER BY tal.created_at DESC
         LIMIT 10`,
        [tenantId]
      );

      // Get material status distribution
      const materialStats = await this.executeQuery(
        'SELECT status, COUNT(*) as count FROM materials WHERE tenant_id = ? GROUP BY status',
        [tenantId]
      );

      // Get visitor trends (last 7 days)
      const visitorTrends = await this.executeQuery(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM visitors 
         WHERE tenant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [tenantId]
      );

      const dashboardData = {
        tenant: tenantAccess.tenant,
        userRole: tenantAccess.userRole,
        userPermissions: tenantAccess.permissions,
        metrics: metrics[0] || {},
        recentActivities: recentActivities.map(activity => ({
          ...activity,
          user_name: activity.user_name || 'System',
          full_name: `${activity.fname || ''} ${activity.lname || ''}`.trim() || activity.user_name || 'System'
        })),
        materialStats: materialStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {}),
        visitorTrends: visitorTrends,
        capabilities: this.calculateUserCapabilities(tenantAccess.userRole, tenantAccess.permissions)
      };

      return this.success(res, dashboardData, 'Tenant dashboard retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant dashboard', 500, error);
    }
  }

  // Helper Methods

  /**
   * Verify if user has access to tenant and specific permissions
   */
  static async verifyTenantAccess(userId, tenantId, requiredPermission = null) {
    try {
      const query = `
        SELECT 
          t.*,
          tu.tenant_role,
          tu.permissions,
          tu.status as assignment_status,
          u.user_name
        FROM tenants t
        LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.user_id = ? AND tu.deleted_at IS NULL
        LEFT JOIN users u ON tu.user_id = u.user_id
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;

      const result = await this.executeQuery(query, [userId, tenantId]);

      if (result.length === 0) {
        return { hasAccess: false, message: 'Tenant not found', statusCode: 404 };
      }

      const tenant = result[0];

      // Check if user is assigned to tenant
      if (!tenant.tenant_role) {
        return { hasAccess: false, message: 'Access denied: Not assigned to this tenant', statusCode: 403 };
      }

      // Check if assignment is active
      if (tenant.assignment_status !== 'active') {
        return { hasAccess: false, message: 'Access denied: Assignment is not active', statusCode: 403 };
      }

      let permissions = {};
      try {
        permissions = tenant.permissions ? JSON.parse(tenant.permissions) : {};
      } catch (e) {
        permissions = this.generateTenantPermissions(tenant.tenant_role);
      }

      // Check specific permission if required
      if (requiredPermission) {
        const [category, action] = requiredPermission.split('.');
        if (!permissions[category] || !permissions[category][action]) {
          return { hasAccess: false, message: 'Access denied: Insufficient permissions', statusCode: 403 };
        }
      }

      return {
        hasAccess: true,
        tenant: tenant,
        userRole: tenant.tenant_role,
        permissions: permissions,
        userId: userId
      };

    } catch (error) {
      return { hasAccess: false, message: 'Access verification failed', statusCode: 500 };
    }
  }

  /**
   * Generate default permissions based on role
   */
  static generateTenantPermissions(role) {
    const basePermissions = {
      materials: { view: true, create: false, edit: false, delete: false, approve: false },
      visitors: { view: true, create: false, edit: false, delete: false, checkin: false, checkout: false },
      users: { view: false, invite: false, edit: false, remove: false },
      reports: { view: false, export: false, analytics: false },
      settings: { view: false, edit: false, branding: false }
    };

    switch (role) {
      case 'admin':
        return {
          materials: { view: true, create: true, edit: true, delete: true, approve: true },
          visitors: { view: true, create: true, edit: true, delete: true, checkin: true, checkout: true },
          users: { view: true, invite: true, edit: true, remove: true },
          reports: { view: true, export: true, analytics: true },
          settings: { view: true, edit: true, branding: true }
        };

      case 'manager':
        return {
          materials: { view: true, create: true, edit: true, delete: false, approve: true },
          visitors: { view: true, create: true, edit: true, delete: false, checkin: true, checkout: true },
          users: { view: true, invite: false, edit: false, remove: false },
          reports: { view: true, export: true, analytics: false },
          settings: { view: true, edit: false, branding: false }
        };

      case 'operator':
        return {
          materials: { view: true, create: true, edit: true, delete: false, approve: false },
          visitors: { view: true, create: true, edit: true, delete: false, checkin: true, checkout: true },
          users: { view: false, invite: false, edit: false, remove: false },
          reports: { view: true, export: false, analytics: false },
          settings: { view: false, edit: false, branding: false }
        };

      case 'viewer':
      default:
        return basePermissions;
    }
  }

  /**
   * Process tenant user data with enhanced information
   */
  static processTenantUserData(user) {
    let permissions = {};
    try {
      permissions = user.permissions ? JSON.parse(user.permissions) : {};
    } catch (e) {
      permissions = this.generateTenantPermissions(user.tenant_role);
    }

    return {
      ...user,
      full_name: `${user.fname || ''} ${user.lname || ''}`.trim() || user.user_name,
      permissions: permissions,
      capabilities: this.calculateUserCapabilities(user.tenant_role, permissions),
      activity_summary: {
        materials_created: parseInt(user.materials_created) || 0,
        visitors_managed: parseInt(user.visitors_managed) || 0,
        total_activities: parseInt(user.total_activities) || 0,
        last_activity: user.last_activity
      },
      role_badge: this.getTenantRoleBadge(user.tenant_role),
      status_badge: this.getStatusBadge(user.assignment_status)
    };
  }

  /**
   * Calculate user capabilities based on role and permissions
   */
  static calculateUserCapabilities(role, permissions) {
    const capabilities = [];

    if (permissions.materials?.create) capabilities.push('Create Materials');
    if (permissions.materials?.approve) capabilities.push('Approve Materials');
    if (permissions.visitors?.checkin) capabilities.push('Manage Visitors');
    if (permissions.users?.invite) capabilities.push('Invite Users');
    if (permissions.reports?.export) capabilities.push('Export Reports');
    if (permissions.settings?.edit) capabilities.push('Manage Settings');
    if (permissions.settings?.branding) capabilities.push('Custom Branding');

    return capabilities;
  }

  /**
   * Get tenant role badge configuration
   */
  static getTenantRoleBadge(role) {
    const badges = {
      admin: { color: 'danger', icon: 'shield-fill', text: 'Admin' },
      manager: { color: 'warning', icon: 'person-gear', text: 'Manager' },
      operator: { color: 'primary', icon: 'person-check', text: 'Operator' },
      viewer: { color: 'secondary', icon: 'eye', text: 'Viewer' }
    };
    return badges[role] || badges.viewer;
  }

  /**
   * Log tenant-specific activity
   */
  static async logTenantActivity(tenantId, userId, activityType, entityType, entityId, description, metadata, ipAddress) {
    try {
      await this.executeQuery(
        `INSERT INTO tenant_activity_logs (
          tenant_id, user_id, activity_type, entity_type, entity_id, 
          description, metadata, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          tenantId,
          userId,
          activityType,
          entityType,
          entityId,
          description,
          JSON.stringify(metadata),
          ipAddress
        ]
      );
    } catch (error) {
      console.error('Failed to log tenant activity:', error);
    }
  }

  /**
   * Send tenant assignment notification
   */
  static async sendTenantAssignmentNotification(user, tenant, role) {
    // Implementation for sending email/SMS notification
    console.log(`📧 Notification: ${user.fname} ${user.lname} assigned as ${role} to ${tenant.name}`);
    // This would integrate with your notification service
  }
}

module.exports = TenantAdminController;
