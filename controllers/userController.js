/**
 * Improved User Controller
 * Dynamic, configurable, and follows DRY principles
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const AppConfig = require('../config/appConfig');
const bcrypt = require('bcrypt');

class UserController extends BaseController {

  /**
   * Update user with dynamic validation and sanitization
   */
  static async updateUser(req, res) {
    try {
      const { user_id } = req.params;
      const updateData = req.body;

      // Validate required fields
      this.validateRequired({ user_id }, ['user_id']);

      // Check if user exists
      const existingUser = await this.getById('users', user_id, 'user_id');
      if (!existingUser) {
        return this.error(res, 'User not found', 404);
      }

      // Sanitize input data
      const allowedUserFields = ['fname', 'lname', 'user_name', 'phone', 'department_id', 'role_id', 'supervisor_id'];
      const sanitizedData = this.sanitizeInput(updateData, allowedUserFields);

      // Validate role_id if provided
      if (sanitizedData.role_id) {
        const roleExists = await this.exists('roles', 'role_id', sanitizedData.role_id);
        if (!roleExists) {
          return this.error(res, 'Invalid role_id provided', 400);
        }
      }

      // Get employee_id from users table
      const [usersData] = await this.executeQuery(
        "SELECT employee_id FROM users WHERE user_id = ?", 
        [user_id]
      );

      if (usersData.length === 0) {
        return this.error(res, 'User not found', 404);
      }

      const employee_id = usersData[0].employee_id;

      // Update employee table if employee fields are provided
      const employeeFields = ['fname', 'lname', 'phone', 'department_id', 'supervisor_id'];
      const employeeData = this.sanitizeInput(sanitizedData, employeeFields);
      
      if (Object.keys(employeeData).length > 0 && employee_id) {
        const employeeUpdateFields = Object.keys(employeeData).map(field => `${field} = ?`).join(', ');
        const employeeUpdateValues = Object.values(employeeData);
        
        await this.executeQuery(
          `UPDATE employees SET ${employeeUpdateFields} WHERE employee_id = ?`,
          [...employeeUpdateValues, employee_id]
        );
      }

      // Update users table
      const userFields = ['user_name', 'role_id'];
      const userData = this.sanitizeInput(sanitizedData, userFields);
      
      if (Object.keys(userData).length > 0) {
        const userUpdateFields = Object.keys(userData).map(field => `${field} = ?`).join(', ');
        const userUpdateValues = Object.values(userData);
        
        const [result] = await this.executeQuery(
          `UPDATE users SET ${userUpdateFields} WHERE user_id = ?`,
          [...userUpdateValues, user_id]
        );

        if (result.affectedRows === 0) {
          return this.error(res, 'No changes were made to the user', 400);
        }
      }

      // Log activity
      await this.logActivity(
        req.user?.id || user_id,
        'user_updated',
        'user',
        user_id,
        sanitizedData,
        req.ip
      );

      return this.success(res, { user_id }, 'User updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update user', 500, error);
    }
  }

  /**
   * Get all roles with caching and pagination
   */
  static async getAllRoles(req, res) {
    try {
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, ['role_id', 'role_name', 'created_at']);

      // Build query with dynamic sorting
      const query = `
        SELECT role_id, role_name, status, created_at 
        FROM roles 
        WHERE status = 1 
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const roles = await this.executeQuery(query, [limit, offset]);
      const totalRoles = await this.getCount('roles', 'WHERE status = 1');

      return this.paginated(res, roles, totalRoles, page, limit, 'Roles retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve roles', 500, error);
    }
  }

  /**
   * Get all departments with dynamic filtering
   */
  static async getDepartments(req, res) {
    try {
      const { search, status } = req.query;
      const { page, limit, offset } = this.validatePagination(req.query);

      // Build dynamic WHERE clause
      const filters = { search, status };
      const allowedFields = {
        search: { type: 'like', column: 'name' },
        status: 'status'
      };

      const { whereClause, params } = this.buildWhereClause(filters, allowedFields);

      const query = `
        SELECT department_id, name, description, status, created_at
        FROM departments 
        ${whereClause}
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;

      const departments = await this.executeQuery(query, [...params, limit, offset]);
      const totalDepartments = await this.getCount('departments', whereClause, params);

      return this.paginated(res, departments, totalDepartments, page, limit, 'Departments retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve departments', 500, error);
    }
  }

  /**
   * Get all users with advanced filtering and joins
   */
  static async getAllUsers(req, res) {
    try {
      const { search, role_id, department_id, status } = req.query;
      const { page, limit, offset } = this.validatePagination(req.query);
      const { sortBy, sortOrder } = this.validateSort(req.query, ['user_id', 'user_name', 'created_at']);

      // Build dynamic WHERE clause
      let whereClause = 'WHERE u.user_id IS NOT NULL';
      const params = [];

      if (search) {
        whereClause += ' AND (u.user_name LIKE ? OR e.fname LIKE ? OR e.lname LIKE ? OR e.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (role_id) {
        whereClause += ' AND u.role_id = ?';
        params.push(role_id);
      }

      if (department_id) {
        whereClause += ' AND e.department_id = ?';
        params.push(department_id);
      }

      if (status) {
        whereClause += ' AND u.status = ?';
        params.push(status);
      }

      const query = `
        SELECT 
          u.user_id,
          u.user_name,
          u.status,
          u.created_at,
          u.avatar_url,
          e.fname,
          e.lname,
          e.phone,
          e.email,
          d.name as department_name,
          r.role_name
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        ${whereClause}
        ORDER BY u.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const users = await this.executeQuery(query, [...params, limit, offset]);
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        ${whereClause}
      `;
      const [countResult] = await this.executeQuery(countQuery, params);
      const totalUsers = countResult.total;

      return this.paginated(res, users, totalUsers, page, limit, 'Users retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve users', 500, error);
    }
  }

  /**
   * Change user status with validation
   */
  static async changeUserStatus(req, res) {
    try {
      const { user_id } = req.params;
      const { status } = req.body;

      // Validate inputs
      this.validateRequired({ user_id, status }, ['user_id', 'status']);

      if (!['0', '1', 0, 1].includes(status)) {
        return this.error(res, 'Invalid status. Use 0 for inactive and 1 for active.', 400);
      }

      // Check if user exists
      const userExists = await this.exists('users', 'user_id', user_id);
      if (!userExists) {
        return this.error(res, 'User not found', 404);
      }

      // Update status
      const [result] = await this.executeQuery(
        "UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?", 
        [status, user_id]
      );

      if (result.affectedRows === 0) {
        return this.error(res, 'Failed to update user status', 400);
      }

      // Log activity
      await this.logActivity(
        req.user?.id || user_id,
        'status_changed',
        'user',
        user_id,
        { old_status: 'unknown', new_status: status },
        req.ip
      );

      const statusText = status == 1 ? 'activated' : 'deactivated';
      return this.success(res, { user_id, status }, `User ${statusText} successfully`);

    } catch (error) {
      return this.error(res, 'Failed to change user status', 500, error);
    }
  }

  /**
   * Get user profile with comprehensive data
   */
  static async getUserProfile(req, res) {
    try {
      const { user_id } = req.params;

      const query = `
        SELECT 
          u.user_id,
          u.user_name,
          u.avatar_url,
          u.status,
          u.created_at,
          e.fname,
          e.lname,
          e.phone,
          e.email,
          d.name as department_name,
          r.role_name,
          r.role_id
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;

      const [results] = await this.executeQuery(query, [user_id]);
      
      if (results.length === 0) {
        return this.error(res, 'User profile not found', 404);
      }

      return this.success(res, results[0], 'User profile retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve user profile', 500, error);
    }
  }

  /**
   * Get user roles (simplified)
   */
  static async getUserRoles(req, res) {
    try {
      const user_id = req.user_id || req.params.user_id;

      if (!user_id) {
        return this.error(res, 'User ID not provided', 400);
      }

      const query = `
        SELECT r.role_name, r.role_id
        FROM roles r
        INNER JOIN users u ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;

      const [results] = await this.executeQuery(query, [user_id]);
      
      if (results.length === 0) {
        return this.error(res, 'User role not found', 404);
      }

      return this.success(res, results[0], 'User role retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve user role', 500, error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(req, res) {
    try {
      const { user_id } = req.params;

      // Check if user exists
      const userExists = await this.exists('users', 'user_id', user_id);
      if (!userExists) {
        return this.error(res, 'User not found', 404);
      }

      // Soft delete user
      const deleted = await this.softDelete('users', user_id, 'user_id');
      
      if (!deleted) {
        return this.error(res, 'Failed to delete user', 400);
      }

      // Log activity
      await this.logActivity(
        req.user?.id || user_id,
        'user_deleted',
        'user',
        user_id,
        {},
        req.ip
      );

      return this.success(res, { user_id }, 'User deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete user', 500, error);
    }
  }

  // ============================================================================
  // INTEGRATED TENANT USER MANAGEMENT
  // ============================================================================

  /**
   * Get user's complete profile with tenant assignments
   * @route GET /api/users/:userId/complete-profile
   * @access Private
   */
  static async getUserCompleteProfile(req, res) {
    try {
      const { userId } = req.params;

      // Get user's system profile
      const userQuery = `
        SELECT 
          u.user_id,
          u.user_name,
          u.avatar_url,
          u.status as user_status,
          u.last_login,
          u.created_at,
          e.fname,
          e.lname,
          e.email,
          e.phone,
          d.name as department_name,
          r.role_name as system_role,
          r.level as role_level
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;

      const userResult = await this.executeQuery(userQuery, [userId]);

      if (userResult.length === 0) {
        return this.error(res, 'User not found', 404);
      }

      const user = userResult[0];

      // Get user's tenant assignments
      const tenantAssignmentsQuery = `
        SELECT 
          tu.id as assignment_id,
          tu.tenant_id,
          tu.tenant_role,
          tu.permissions,
          tu.status as assignment_status,
          tu.assigned_at,
          t.name as tenant_name,
          t.status as tenant_status,
          t.building,
          t.floor,
          -- Activity metrics per tenant
          (SELECT COUNT(*) FROM materials WHERE tenant_id = tu.tenant_id AND created_by = u.user_id) as materials_created,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = tu.tenant_id AND created_by = u.user_id) as visitors_managed,
          (SELECT COUNT(*) FROM tenant_activity_logs WHERE tenant_id = tu.tenant_id AND user_id = u.user_id) as activities_logged
        FROM tenant_users tu
        LEFT JOIN tenants t ON tu.tenant_id = t.id
        WHERE tu.user_id = ? AND tu.deleted_at IS NULL
        ORDER BY tu.tenant_role DESC, tu.assigned_at DESC
      `;

      const tenantAssignments = await this.executeQuery(tenantAssignmentsQuery, [userId]);

      // Process tenant assignments with permissions
      const processedAssignments = tenantAssignments.map(assignment => {
        let permissions = {};
        try {
          permissions = assignment.permissions ? JSON.parse(assignment.permissions) : {};
        } catch (e) {
          permissions = this.generateTenantPermissions(assignment.tenant_role);
        }

        return {
          ...assignment,
          permissions,
          capabilities: this.calculateUserCapabilities(assignment.tenant_role, permissions),
          role_badge: this.getTenantRoleBadge(assignment.tenant_role),
          activity_summary: {
            materials_created: parseInt(assignment.materials_created) || 0,
            visitors_managed: parseInt(assignment.visitors_managed) || 0,
            activities_logged: parseInt(assignment.activities_logged) || 0
          }
        };
      });

      // Determine user type
      const userType = this.determineUserType(user, processedAssignments);

      const completeProfile = {
        // Basic user information
        user_id: user.user_id,
        user_name: user.user_name,
        full_name: `${user.fname || ''} ${user.lname || ''}`.trim() || user.user_name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        
        // System context
        system_role: user.system_role,
        role_level: user.role_level,
        department: user.department_name,
        user_status: user.user_status,
        last_login: user.last_login,
        
        // User classification
        user_type: userType,
        is_system_user: userType.includes('system'),
        is_tenant_user: userType.includes('tenant'),
        is_dual_role: userType === 'dual_role',
        
        // Tenant assignments
        tenant_assignments: processedAssignments,
        primary_tenant: processedAssignments.find(a => a.tenant_role === 'admin') || processedAssignments[0] || null,
        total_tenant_assignments: processedAssignments.length,
        
        // Access summary
        access_summary: this.generateAccessSummary(user, processedAssignments),
        
        // Navigation context
        available_contexts: this.getAvailableContexts(user, processedAssignments),
        
        created_at: user.created_at
      };

      return this.success(res, completeProfile, 'User profile retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch user profile', 500, error);
    }
  }

  /**
   * Switch user context between system and tenant roles
   * @route POST /api/users/:userId/switch-context
   * @access Private
   */
  static async switchUserContext(req, res) {
    try {
      const { userId } = req.params;
      const { context_type, tenant_id } = req.body;

      // Validate context switch request
      if (!['system', 'tenant'].includes(context_type)) {
        return this.error(res, 'Invalid context type. Must be "system" or "tenant"', 400);
      }

      if (context_type === 'tenant' && !tenant_id) {
        return this.error(res, 'Tenant ID required for tenant context', 400);
      }

      // Verify user exists
      const user = await this.executeQuery(
        'SELECT u.*, r.role_name, r.level FROM users u LEFT JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?',
        [userId]
      );

      if (user.length === 0) {
        return this.error(res, 'User not found', 404);
      }

      let contextData = {
        user_id: userId,
        context_type: context_type,
        switched_at: new Date().toISOString()
      };

      if (context_type === 'system') {
        // System context - use system role
        contextData.system_role = user[0].role_name;
        contextData.role_level = user[0].level;
        
      } else {
        // Tenant context - verify tenant access
        const tenantAccess = await this.verifyTenantAccess(userId, tenant_id);
        if (!tenantAccess.hasAccess) {
          return this.error(res, tenantAccess.message, tenantAccess.statusCode);
        }

        contextData.tenant_id = tenant_id;
        contextData.tenant_name = tenantAccess.tenant.name;
        contextData.tenant_role = tenantAccess.userRole;
        contextData.tenant_permissions = tenantAccess.permissions;
      }

      // Log context switch
      await this.logActivity(
        userId,
        'context_switched',
        'user_session',
        userId,
        { from_context: 'previous', to_context: context_type, tenant_id: tenant_id },
        req.ip
      );

      return this.success(res, contextData, `Context switched to ${context_type} successfully`);

    } catch (error) {
      return this.error(res, 'Failed to switch context', 500, error);
    }
  }

  /**
   * Assign user to tenant with specific role
   * @route POST /api/users/:userId/assign-tenant
   * @access Private (Admin)
   */
  static async assignUserToTenant(req, res) {
    try {
      const { userId } = req.params;
      const { tenant_id, tenant_role, custom_permissions, notify_user } = req.body;

      // Validate required fields
      this.validateRequired({ tenant_id, tenant_role }, ['tenant_id', 'tenant_role']);

      // Verify user exists
      const user = await this.executeQuery(
        'SELECT u.user_id, u.user_name, e.fname, e.lname, e.email FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?',
        [userId]
      );

      if (user.length === 0) {
        return this.error(res, 'User not found', 404);
      }

      // Verify tenant exists
      const tenant = await this.executeQuery(
        'SELECT id, name FROM tenants WHERE id = ? AND deleted_at IS NULL',
        [tenant_id]
      );

      if (tenant.length === 0) {
        return this.error(res, 'Tenant not found', 404);
      }

      // Check if user is already assigned
      const existingAssignment = await this.executeQuery(
        'SELECT id FROM tenant_users WHERE tenant_id = ? AND user_id = ? AND deleted_at IS NULL',
        [tenant_id, userId]
      );

      if (existingAssignment.length > 0) {
        return this.error(res, 'User is already assigned to this tenant', 400);
      }

      // Validate tenant role
      const validRoles = ['admin', 'manager', 'operator', 'viewer'];
      if (!validRoles.includes(tenant_role)) {
        return this.error(res, 'Invalid tenant role. Must be one of: ' + validRoles.join(', '), 400);
      }

      // Generate permissions
      const permissions = custom_permissions || this.generateTenantPermissions(tenant_role);

      // Create assignment
      const assignmentResult = await this.executeQuery(
        `INSERT INTO tenant_users (
          tenant_id, user_id, tenant_role, permissions, status, 
          assigned_by, assigned_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, NOW(), NOW(), NOW())`,
        [
          tenant_id,
          userId,
          tenant_role,
          JSON.stringify(permissions),
          req.user?.user_id || 1
        ]
      );

      return this.success(res, {
        assignment_id: assignmentResult.insertId,
        tenant_id: tenant_id,
        user_id: userId,
        tenant_role: tenant_role,
        permissions: permissions
      }, 'User assigned to tenant successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to assign user to tenant', 500, error);
    }
  }

  // ============================================================================
  // HELPER METHODS FOR TENANT INTEGRATION
  // ============================================================================

  /**
   * Verify if user has access to tenant
   */
  static async verifyTenantAccess(userId, tenantId, requiredPermission = null) {
    try {
      const query = `
        SELECT 
          t.*,
          tu.tenant_role,
          tu.permissions,
          tu.status as assignment_status
        FROM tenants t
        LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.user_id = ? AND tu.deleted_at IS NULL
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;

      const result = await this.executeQuery(query, [userId, tenantId]);

      if (result.length === 0) {
        return { hasAccess: false, message: 'Tenant not found', statusCode: 404 };
      }

      const tenant = result[0];

      if (!tenant.tenant_role) {
        return { hasAccess: false, message: 'Access denied: Not assigned to this tenant', statusCode: 403 };
      }

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
   * Determine user type based on roles and assignments
   */
  static determineUserType(user, tenantAssignments) {
    const hasSystemRole = user.system_role && user.role_level > 0;
    const hasTenantAssignments = tenantAssignments.length > 0;

    if (hasSystemRole && hasTenantAssignments) {
      return 'dual_role'; // Both system and tenant access
    } else if (hasSystemRole) {
      return 'system_user'; // Only system access
    } else if (hasTenantAssignments) {
      return 'tenant_user'; // Only tenant access
    } else {
      return 'limited_user'; // Minimal access
    }
  }

  /**
   * Calculate user capabilities
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
   * Get tenant role badge
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
   * Generate access summary
   */
  static generateAccessSummary(user, tenantAssignments) {
    return {
      system_access: {
        role: user.system_role,
        level: user.role_level,
        department: user.department_name
      },
      tenant_access: {
        total_tenants: tenantAssignments.length,
        admin_tenants: tenantAssignments.filter(a => a.tenant_role === 'admin').length,
        manager_tenants: tenantAssignments.filter(a => a.tenant_role === 'manager').length
      }
    };
  }

  /**
   * Get available contexts for navigation
   */
  static getAvailableContexts(user, tenantAssignments) {
    const contexts = [];

    // System context
    if (user.system_role && user.role_level > 0) {
      contexts.push({
        type: 'system',
        name: 'System Administration',
        role: user.system_role,
        icon: 'bi-gear-fill',
        primary: false
      });
    }

    // Tenant contexts
    tenantAssignments.forEach(assignment => {
      contexts.push({
        type: 'tenant',
        tenant_id: assignment.tenant_id,
        name: assignment.tenant_name,
        role: assignment.tenant_role,
        icon: 'bi-building',
        primary: assignment.tenant_role === 'admin'
      });
    });

    return contexts;
  }
}

module.exports = {
  // Original methods
  updateUser: UserController.updateUser.bind(UserController),
  getAllRoles: UserController.getAllRoles.bind(UserController),
  getDepartment: UserController.getDepartments.bind(UserController),
  getDepartments: UserController.getDepartments.bind(UserController),
  getAllUsers: UserController.getAllUsers.bind(UserController),
  changeUserStatus: UserController.changeUserStatus.bind(UserController),
  getUserProfile: UserController.getUserProfile.bind(UserController),
  getUserRoles: UserController.getUserRoles.bind(UserController),
  deleteUser: UserController.deleteUser.bind(UserController),
  
  // Enhanced tenant integration methods
  getUserCompleteProfile: UserController.getUserCompleteProfile.bind(UserController),
  switchUserContext: UserController.switchUserContext.bind(UserController),
  assignUserToTenant: UserController.assignUserToTenant.bind(UserController),
  verifyTenantAccess: UserController.verifyTenantAccess.bind(UserController)
};
