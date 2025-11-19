/**
 * Tenant Administration Routes
 * Comprehensive tenant representative and user management
 * Each tenant company has designated administrators
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const express = require('express');
const router = express.Router();
const tenantAdminController = require('../controllers/tenantAdminController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================================================
// TENANT ADMINISTRATION ROUTES
// ============================================================================

/**
 * GET /api/tenants/:tenantId/admin/dashboard
 * Get comprehensive tenant dashboard with metrics and activities
 */
router.get('/:tenantId/admin/dashboard', verifyToken, (req, res) => 
  tenantAdminController.getTenantDashboard(req, res)
);

/**
 * GET /api/tenants/:tenantId/admin/users
 * Get all users assigned to the tenant with their roles and permissions
 */
router.get('/:tenantId/admin/users', verifyToken, (req, res) => 
  tenantAdminController.getTenantUsers(req, res)
);

/**
 * POST /api/tenants/:tenantId/admin/users
 * Assign a user to the tenant with specific role and permissions
 */
router.post('/:tenantId/admin/users', verifyToken, (req, res) => 
  tenantAdminController.assignUserToTenant(req, res)
);

/**
 * PUT /api/tenants/:tenantId/admin/users/:userId
 * Update tenant user role and permissions
 */
router.put('/:tenantId/admin/users/:userId', verifyToken, (req, res) => 
  tenantAdminController.updateTenantUser(req, res)
);

/**
 * DELETE /api/tenants/:tenantId/admin/users/:userId
 * Remove user from tenant (soft delete)
 */
router.delete('/:tenantId/admin/users/:userId', verifyToken, async (req, res) => {
  try {
    const { tenantId, userId } = req.params;

    // Verify tenant access
    const tenantAccess = await tenantAdminController.verifyTenantAccess(req.user?.user_id, tenantId, 'users.remove');
    if (!tenantAccess.hasAccess) {
      return tenantAdminController.error(res, tenantAccess.message, tenantAccess.statusCode);
    }

    // Get assignment
    const assignment = await tenantAdminController.executeQuery(
      'SELECT * FROM tenant_users WHERE tenant_id = ? AND user_id = ? AND deleted_at IS NULL',
      [tenantId, userId]
    );

    if (assignment.length === 0) {
      return tenantAdminController.error(res, 'User assignment not found', 404);
    }

    // Soft delete assignment
    await tenantAdminController.executeQuery(
      'UPDATE tenant_users SET deleted_at = NOW(), updated_at = NOW() WHERE tenant_id = ? AND user_id = ?',
      [tenantId, userId]
    );

    // Log activity
    await tenantAdminController.logTenantActivity(
      tenantId,
      req.user?.user_id,
      'user_removed',
      'tenant_user',
      assignment[0].id,
      `User removed from tenant`,
      { tenant_id: tenantId, user_id: userId },
      req.ip
    );

    return tenantAdminController.success(res, { tenant_id: tenantId, user_id: userId }, 'User removed from tenant successfully');

  } catch (error) {
    return tenantAdminController.error(res, 'Failed to remove user from tenant', 500, error);
  }
});

/**
 * GET /api/tenants/:tenantId/admin/users/:userId/permissions
 * Get detailed user permissions and capabilities
 */
router.get('/:tenantId/admin/users/:userId/permissions', verifyToken, async (req, res) => {
  try {
    const { tenantId, userId } = req.params;

    // Verify tenant access
    const tenantAccess = await tenantAdminController.verifyTenantAccess(req.user?.user_id, tenantId);
    if (!tenantAccess.hasAccess) {
      return tenantAdminController.error(res, tenantAccess.message, tenantAccess.statusCode);
    }

    const query = `
      SELECT 
        tu.*,
        t.name as tenant_name,
        t.tier,
        u.user_name,
        e.fname,
        e.lname,
        e.email
      FROM tenant_users tu
      LEFT JOIN tenants t ON tu.tenant_id = t.id
      LEFT JOIN users u ON tu.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE tu.tenant_id = ? AND tu.user_id = ? AND tu.deleted_at IS NULL
    `;

    const result = await tenantAdminController.executeQuery(query, [tenantId, userId]);

    if (result.length === 0) {
      return tenantAdminController.error(res, 'User assignment not found', 404);
    }

    const assignment = result[0];
    let permissions = {};

    try {
      permissions = assignment.permissions ? JSON.parse(assignment.permissions) : {};
    } catch (e) {
      permissions = tenantAdminController.generateTenantPermissions(assignment.tenant_role, assignment.tier);
    }

    const response = {
      tenant_id: assignment.tenant_id,
      tenant_name: assignment.tenant_name,
      user_id: assignment.user_id,
      user_name: assignment.user_name,
      full_name: `${assignment.fname || ''} ${assignment.lname || ''}`.trim(),
      email: assignment.email,
      tenant_role: assignment.tenant_role,
      status: assignment.status,
      permissions: permissions,
      capabilities: tenantAdminController.calculateUserCapabilities(assignment.tenant_role, permissions, assignment.tier),
      assigned_at: assignment.assigned_at
    };

    return tenantAdminController.success(res, response, 'User permissions retrieved successfully');

  } catch (error) {
    return tenantAdminController.error(res, 'Failed to fetch user permissions', 500, error);
  }
});

/**
 * GET /api/tenants/:tenantId/admin/activities
 * Get tenant activity logs with filtering
 */
router.get('/:tenantId/admin/activities', verifyToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { activity_type, user_id, start_date, end_date } = req.query;
    const { page, limit, offset } = tenantAdminController.validatePagination(req.query);

    // Verify tenant access
    const tenantAccess = await tenantAdminController.verifyTenantAccess(req.user?.user_id, tenantId);
    if (!tenantAccess.hasAccess) {
      return tenantAdminController.error(res, tenantAccess.message, tenantAccess.statusCode);
    }

    // Build dynamic WHERE clause
    let whereClause = 'WHERE tal.tenant_id = ?';
    const queryParams = [tenantId];

    if (activity_type) {
      whereClause += ' AND tal.activity_type = ?';
      queryParams.push(activity_type);
    }

    if (user_id) {
      whereClause += ' AND tal.user_id = ?';
      queryParams.push(user_id);
    }

    if (start_date) {
      whereClause += ' AND DATE(tal.created_at) >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(tal.created_at) <= ?';
      queryParams.push(end_date);
    }

    // Get activities
    const activitiesQuery = `
      SELECT 
        tal.*,
        u.user_name,
        e.fname,
        e.lname
      FROM tenant_activity_logs tal
      LEFT JOIN users u ON tal.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      ${whereClause}
      ORDER BY tal.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const activities = await tenantAdminController.executeQuery(activitiesQuery, queryParams);

    // Get total count
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM tenant_activity_logs tal
      ${whereClause}
    `;
    const total = await tenantAdminController.executeQuery(totalQuery, queryParams.slice(0, -2));

    // Process activities
    const processedActivities = activities.map(activity => ({
      ...activity,
      user_name: activity.user_name || 'System',
      full_name: `${activity.fname || ''} ${activity.lname || ''}`.trim() || activity.user_name || 'System',
      metadata: activity.metadata ? JSON.parse(activity.metadata) : {}
    }));

    return tenantAdminController.paginated(res, processedActivities, total[0].total, page, limit, 'Activities retrieved successfully');

  } catch (error) {
    return tenantAdminController.error(res, 'Failed to fetch activities', 500, error);
  }
});

/**
 * GET /api/tenants/:tenantId/admin/stats
 * Get comprehensive tenant statistics
 */
router.get('/:tenantId/admin/stats', verifyToken, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verify tenant access
    const tenantAccess = await tenantAdminController.verifyTenantAccess(req.user?.user_id, tenantId);
    if (!tenantAccess.hasAccess) {
      return tenantAdminController.error(res, tenantAccess.message, tenantAccess.statusCode);
    }

    // Get comprehensive statistics
    const statsQuery = `
      SELECT 
        -- User stats
        (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND status = 'active' AND deleted_at IS NULL) as active_users,
        (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ? AND tenant_role = 'admin' AND deleted_at IS NULL) as admin_users,
        
        -- Material stats
        (SELECT COUNT(*) FROM materials WHERE tenant_id = ?) as total_materials,
        (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND status = 'pending') as pending_materials,
        (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND status = 'approved') as approved_materials,
        (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as monthly_materials,
        
        -- Visitor stats
        (SELECT COUNT(*) FROM visitors WHERE tenant_id = ?) as total_visitors,
        (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND status = 'checked_in') as active_visitors,
        (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as monthly_visitors,
        
        -- Activity stats
        (SELECT COUNT(*) FROM tenant_activity_logs WHERE tenant_id = ?) as total_activities,
        (SELECT COUNT(*) FROM tenant_activity_logs WHERE tenant_id = ? AND DATE(created_at) = CURDATE()) as today_activities
    `;

    const stats = await tenantAdminController.executeQuery(statsQuery, Array(12).fill(tenantId));

    // Get role distribution
    const roleDistribution = await tenantAdminController.executeQuery(
      'SELECT tenant_role, COUNT(*) as count FROM tenant_users WHERE tenant_id = ? AND deleted_at IS NULL GROUP BY tenant_role',
      [tenantId]
    );

    // Get activity trends (last 7 days)
    const activityTrends = await tenantAdminController.executeQuery(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM tenant_activity_logs 
       WHERE tenant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [tenantId]
    );

    const response = {
      tenant: tenantAccess.tenant,
      stats: stats[0] || {},
      roleDistribution: roleDistribution.reduce((acc, role) => {
        acc[role.tenant_role] = role.count;
        return acc;
      }, {}),
      activityTrends: activityTrends
    };

    return tenantAdminController.success(res, response, 'Statistics retrieved successfully');

  } catch (error) {
    return tenantAdminController.error(res, 'Failed to fetch statistics', 500, error);
  }
});

module.exports = router;
