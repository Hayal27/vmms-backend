/**
 * Enterprise Tenant Management Controller
 * Extends BaseController for standardized operations
 * Complete CRUD with validation, filtering, and business logic
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const ValidationService = require('../services/ValidationService');
const AppConfig = require('../config/appConfig');

class TenantController extends BaseController {
  /**
   * Get all tenants with advanced filtering, sorting, and pagination
   * @route GET /api/tenants
   * @access Private
   */
  static async getAllTenants(req, res) {
    try {
      // Set processing start time for performance tracking
      res.locals.startTime = Date.now();

      // Professional pagination validation
      const { page, limit, offset, isValidPage, isValidLimit } = this.validatePagination(req.query);

      if (!isValidPage || !isValidLimit) {
        return this.error(res, 'Invalid pagination parameters', 400);
      }

      const { sortBy, sortOrder } = this.validateSort(req.query, [
        'id', 'name', 'status', 'created_at', 'updated_at', 'tenant_code', 'business_type', 'zone', 'category'
      ]);

      // Build dynamic WHERE clause
      let whereClause = 'WHERE t.deleted_at IS NULL';
      const queryParams = [];
      
      if (req.query.search) {
        whereClause += ' AND (t.name LIKE ? OR t.company_name LIKE ? OR t.email LIKE ? OR t.business_type LIKE ? OR t.zone LIKE ? OR t.category LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      
      if (req.query.status) {
        whereClause += ' AND t.status = ?';
        queryParams.push(req.query.status);
      }

      if (req.query.business_type) {
        whereClause += ' AND t.business_type = ?';
        queryParams.push(req.query.business_type);
      }

      if (req.query.zone) {
        whereClause += ' AND t.zone = ?';
        queryParams.push(req.query.zone);
      }

      if (req.query.category) {
        whereClause += ' AND t.category = ?';
        queryParams.push(req.query.category);
      }

      // Get total count
      const total = await this.getCount('tenants t', whereClause, queryParams);

      // Get tenants with comprehensive related data and KPIs
      const query = `
        SELECT 
          t.*,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id AND status = 'checked_in'), 0) as active_visitors,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id AND DATE(visit_date) = CURDATE()), 0) as today_visitors,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id), 0) as total_visitors,
          COALESCE((SELECT COUNT(*) FROM materials WHERE tenant_id = t.id AND status IN ('pending', 'in_transit')), 0) as active_materials,
          COALESCE((SELECT COUNT(*) FROM materials WHERE tenant_id = t.id), 0) as total_materials,
          COALESCE((SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = t.id AND status = 'pending'), 0) as pending_approvals,
          COALESCE((SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = t.id), 0) as total_approvals,
          COALESCE((SELECT COUNT(*) FROM tenant_users WHERE tenant_id = t.id AND status = 'active'), 0) as total_users
        FROM tenants t
        ${whereClause}
        ORDER BY t.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const tenants = await this.executeQuery(query, queryParams);

      // Process tenant data with enhanced features
      const processedTenants = tenants.map(tenant => this.processTenantDataEnhanced(tenant));

      // Get statistics
      const statsQuery = `
        SELECT status, COUNT(*) as count
        FROM tenants 
        WHERE deleted_at IS NULL
        GROUP BY status
      `;
      const statsResult = await this.executeQuery(statsQuery);
      
      const stats = this.buildTenantStats(statsResult, total);

      return this.paginated(res, processedTenants, total, page, limit, 'Tenants retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenants', 500, error);
    }
  }

  /**
   * Get tenant by ID
   * @route GET /api/tenants/:id
   * @access Private
   */
  static async getTenantById(req, res) {
    try {
      const { id } = req.params;
      
      console.log('🔄 Backend: getTenantById called with ID:', id);
      
      if (!id) {
        console.log('❌ Backend: No ID provided');
        return this.error(res, 'Tenant ID is required', 400);
      }

      const query = `
        SELECT 
          t.*,
          0 as active_visitors,
          0 as active_materials,
          0 as pending_approvals
        FROM tenants t
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;
      
      console.log('🔄 Backend: Executing query with ID:', id);
      const tenants = await this.executeQuery(query, [id]);
      
      console.log('🔄 Backend: Query result:', tenants.length, 'tenants found');
      
      if (tenants.length === 0) {
        console.log('❌ Backend: Tenant not found for ID:', id);
        return this.error(res, 'Tenant not found', 404);
      }
      
      console.log('🔄 Backend: Processing tenant data...');
      const processedTenant = this.processTenantData(tenants[0]);
      
      console.log('✅ Backend: Tenant processed successfully:', processedTenant.name);
      return this.success(res, processedTenant, 'Tenant retrieved successfully');
      
    } catch (error) {
      console.error('❌ Backend: Error in getTenantById:', error);
      return this.error(res, 'Failed to fetch tenant', 500, error);
    }
  }

  /**
   * Get general tenant statistics
   * @route GET /api/tenants/stats
   * @access Private
   */
  static async getGeneralStats(req, res) {
    try {
      // Get tenant statistics
      const statsQuery = `
        SELECT status, COUNT(*) as count
        FROM tenants 
        WHERE deleted_at IS NULL
        GROUP BY status
      `;
      const statsResult = await this.executeQuery(statsQuery);
      
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        pending: 0,
        metrics: {
          total_visitors: 0,
          active_visitors: 0,
          total_materials: 0,
          active_materials: 0,
          pending_approvals: 0
        },
        last_updated: new Date().toISOString()
      };
      
      statsResult.forEach(stat => {
        stats.total += stat.count;
        stats[stat.status] = (stats[stat.status] || 0) + stat.count;
      });

      // Get additional metrics
      const metricsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM visitors) as total_visitors,
          (SELECT COUNT(*) FROM visitors WHERE status = 'checked_in') as active_visitors,
          (SELECT COUNT(*) FROM materials) as total_materials,
          (SELECT COUNT(*) FROM materials WHERE status IN ('pending', 'in_transit')) as active_materials,
          (SELECT COUNT(*) FROM approvals WHERE status = 'pending') as pending_approvals
      `;
      
      const metricsResult = await this.executeQuery(metricsQuery);

      if (metricsResult.length > 0) {
        stats.metrics = {
          total_visitors: parseInt(metricsResult[0].total_visitors) || 0,
          active_visitors: parseInt(metricsResult[0].active_visitors) || 0,
          total_materials: parseInt(metricsResult[0].total_materials) || 0,
          active_materials: parseInt(metricsResult[0].active_materials) || 0,
          pending_approvals: parseInt(metricsResult[0].pending_approvals) || 0
        };
      }

      return this.success(res, stats, 'Statistics retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch statistics', 500, error);
    }
  }

  /**
   * Get tenant users with roles and permissions
   * @route GET /api/tenants/:id/users
   * @access Private
   */
  static async getTenantUsers(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          tu.id, tu.tenant_id, tu.user_id, tu.role_id, tu.position,
          tu.can_approve_materials, tu.can_register_visitors,
          tu.can_record_materials, tu.can_view_reports,
          tu.can_manage_users, tu.can_update_profile,
          tu.is_primary, tu.is_active, tu.assigned_date,
          u.user_name, u.status as user_status, u.last_login,
          e.name, e.fname, e.lname, e.email, e.phone,
          r.role_name, r.description as role_description
        FROM tenant_users tu
        INNER JOIN users u ON tu.user_id = u.user_id
        INNER JOIN employees e ON u.employee_id = e.employee_id
        INNER JOIN roles r ON tu.role_id = r.role_id
        WHERE tu.tenant_id = ? AND tu.is_active = 1
        ORDER BY tu.is_primary DESC, tu.assigned_date ASC
      `;

      const users = await this.executeQuery(query, [id]);

      return this.success(res, {
        tenant_id: parseInt(id),
        total_users: users.length,
        users: users
      }, 'Tenant users retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant users', 500, error);
    }
  }

  /**
   * Get all tenant users across all tenants - Centralized view
   * @route GET /api/tenant-users
   * @access Private
   */
  static async getAllTenantUsers(req, res) {
    try {
      const query = `
        SELECT 
          tu.id, tu.tenant_id, tu.user_id, tu.role_id, tu.position,
          tu.can_approve_materials, tu.can_register_visitors,
          tu.can_record_materials, tu.can_view_reports,
          tu.can_manage_users, tu.can_update_profile,
          tu.is_primary, tu.is_active, tu.assigned_at,
          u.user_name, u.status as user_status, u.last_login,
          e.name, e.fname, e.lname, e.email, e.phone, e.sex,
          r.role_name, r.description as role_description,
          t.tenant_code, t.name as tenant_name, t.company_name
        FROM tenant_users tu
        INNER JOIN users u ON tu.user_id = u.user_id
        INNER JOIN employees e ON u.employee_id = e.employee_id
        INNER JOIN roles r ON tu.role_id = r.role_id
        INNER JOIN tenants t ON tu.tenant_id = t.id
        WHERE tu.is_active = 1 AND t.deleted_at IS NULL
        ORDER BY t.name ASC, tu.is_primary DESC, tu.assigned_at ASC
      `;

      const users = await this.executeQuery(query, []);

      return this.success(res, {
        total_users: users.length,
        users: users
      }, 'All tenant users retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch tenant users', 500, error);
    }
  }

  /**
   * Create new tenant - Enhanced with comprehensive onboarding
   * @route POST /api/tenants
   * @access Private (Admin only - IT Park staff registers tenants)
   */
  static async createTenant(req, res) {
    const connection = await this.getConnection();
    
    try {
      // Authorization check - only IT Park admins can register tenants
      const userRole = req.user?.role || req.user?.role_name;
      const userRoleId = req.user?.role_id || req.user?.role;
      
      // Allow Super Admin (role_id: 1) and Admin (role_id: 2)
      const isAuthorized = userRoleId === 1 || userRoleId === 2 || 
                          ['Super Admin', 'Admin', 'admin', 'super_admin'].includes(userRole);
      
      if (!req.user || !isAuthorized) {
        return this.error(res, 'Access denied. Only IT Park administrators can register tenants.', 403);
      }

      await connection.beginTransaction();
      
      const {
        // Company Information
        name, company_name, email, phone, address, building, floor, unit,
        
        // Business Classification
        business_type, zone, category,
        
        // Contact Person
        contact_person, contact_email, contact_phone,
        
        // Business Configuration
        status = 'pending', max_employees,
        
        // Tenant Users Setup (dynamic array)
        tenant_users = [],  // Array of users to create with roles and permissions
        
        // Settings & Branding
        settings = {}, branding = {},
        
        // Onboarding Options
        auto_generate_code = true,
        send_welcome_email = false,
        setup_default_permissions = true
      } = req.body;

      // 1. Comprehensive Validation
      await this.validateTenantCreation({
        name, email, business_type, zone, category, tenant_users
      });

      // 2. Generate or validate tenant code
      let tenantCode = req.body.tenant_code;
      if (auto_generate_code || !tenantCode) {
        tenantCode = await this.generateUniqueTenantCode(name);
      } else {
        // Validate provided tenant code
        const existingCode = await this.executeQuery(
          'SELECT id FROM tenants WHERE tenant_code = ?',
          [tenantCode]
        );
        if (existingCode.length > 0) {
          throw new Error('Tenant code already exists');
        }
      }

      // 3. Prepare enhanced default settings
      const defaultSettings = this.generateTenantDefaultSettings(max_employees);
      const finalSettings = { ...defaultSettings, ...settings };

      // 4. Prepare enhanced default branding
      const defaultBranding = this.generateTenantDefaultBranding();
      const finalBranding = { ...defaultBranding, ...branding };

      // 5. Create tenant record with all enhancements
      const tenantResult = await connection.execute(
        `INSERT INTO tenants (
          tenant_code, name, company_name, business_type, zone, category,
          email, phone, contact_person, contact_email, contact_phone,
          address, building, floor, unit, status,
          max_employees, settings, branding,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantCode, name, company_name, business_type, zone, category,
          email, phone, contact_person, contact_email, contact_phone,
          address, building, floor, unit, status,
          max_employees || 50,
          JSON.stringify(finalSettings),
          JSON.stringify(finalBranding)
        ]
      );

      const tenantId = tenantResult[0].insertId;
      const createdUsers = [];

      // 6. Create tenant users dynamically
      for (const userData of tenant_users) {
        if (userData.create_user === true) {
          const userId = await this.createTenantUser(
            connection,
            tenantId,
            userData,
            userData.role_id || 3, // Default to Tenant Manager (role_id=3)
            userData.is_primary || false,
            req.user?.user_id
          );

          // 7. Create tenant_users relationship with BOTH old and new columns
          const roleId = userData.role_id || 3;
          const tenantRole = roleId === 3 ? 'manager' : roleId === 4 ? 'staff' : 'viewer';
          const permissions = {
            materials: {
              view: true,
              create: userData.permissions?.can_record_materials || false,
              edit: userData.permissions?.can_record_materials || false,
              delete: userData.permissions?.can_approve_materials || false,
              approve: userData.permissions?.can_approve_materials || false
            },
            visitors: {
              view: true,
              create: userData.permissions?.can_register_visitors || false,
              edit: userData.permissions?.can_register_visitors || false,
              delete: userData.permissions?.can_approve_materials || false,
              checkin: userData.permissions?.can_register_visitors || false,
              checkout: userData.permissions?.can_register_visitors || false
            },
            users: {
              view: userData.permissions?.can_manage_users || false,
              invite: userData.permissions?.can_manage_users || false,
              edit: userData.permissions?.can_manage_users || false,
              remove: userData.permissions?.can_manage_users || false
            },
            reports: {
              view: userData.permissions?.can_view_reports || false,
              export: userData.permissions?.can_view_reports || false,
              analytics: userData.permissions?.can_view_reports || false
            },
            settings: {
              view: userData.permissions?.can_update_profile || false,
              edit: userData.permissions?.can_update_profile || false,
              branding: userData.permissions?.can_approve_materials || false
            }
          };

          await connection.execute(
            `INSERT INTO tenant_users (
              tenant_id, user_id,
              tenant_role, permissions, status,
              role_id, position,
              can_approve_materials, can_register_visitors,
              can_record_materials, can_view_reports,
              can_manage_users, can_update_profile,
              is_primary, is_active, assigned_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              tenantId, userId,
              tenantRole, JSON.stringify(permissions), 'active',
              roleId, userData.position || null,
              userData.permissions?.can_approve_materials || 0,
              userData.permissions?.can_register_visitors || 0,
              userData.permissions?.can_record_materials || 0,
              userData.permissions?.can_view_reports || 0,
              userData.permissions?.can_manage_users || 0,
              userData.permissions?.can_update_profile || 0,
              userData.is_primary || 0,
              1, // is_active
              req.user?.user_id
            ]
          );

          createdUsers.push({ user_id: userId, role_id: userData.role_id });
        }
      }

      // 8. Setup default permissions and configurations
      if (setup_default_permissions && createdUsers.length > 0) {
        await this.setupTenantDefaultPermissions(connection, tenantId, createdUsers[0].user_id);
      }

      // 8. Create initial activity log
      await this.logTenantActivity(
        connection,
        tenantId,
        req.user?.user_id || 1,
        'tenant_created',
        'tenant',
        tenantId,
        `Tenant "${name}" created successfully`,
        {
          tenant_code: tenantCode,
          has_admin: createdUsers.length > 0,
          users_created: createdUsers.length,
          auto_generated_code: auto_generate_code
        },
        req.ip
      );

      await connection.commit();

      // 9. Post-creation tasks
      const tenantDetails = await this.getTenantWithFullDetails(tenantId);
      
      if (send_welcome_email && contact_email) {
        await this.sendTenantWelcomeEmail(tenantDetails, admin_user);
      }

      // 10. Generate comprehensive response
      const primaryUser = createdUsers.length > 0 ? createdUsers[0] : null;
      
      const response = {
        tenant: {
          id: tenantId,
          tenant_code: tenantCode,
          name: name,
          company_name: company_name || name,
          email: email,
          status: status,
          max_employees: max_employees || 50,
          settings: finalSettings,
          branding: finalBranding
        },
        admin_user: primaryUser ? {
          id: primaryUser.user_id,
          role_id: primaryUser.role_id,
          created: true,
          message: 'Admin user created and assigned'
        } : null,
        users_created: createdUsers.length,
        configuration: {
          default_settings_applied: true,
          default_branding_applied: true,
          permissions_configured: setup_default_permissions && createdUsers.length > 0
        },
        next_steps: this.generateTenantNextSteps(status, createdUsers.length > 0),
        capabilities: this.getTenantCapabilities(),
        onboarding_checklist: this.generateOnboardingChecklist()
      };

      return this.success(res, response, 'Tenant created successfully with enhanced configuration', 201);

    } catch (error) {
      await connection.rollback();
      return this.error(res, 'Failed to create tenant', 500, error);
    } finally {
      connection.release();
    }
  }

  /**
   * Update tenant
   * @route PUT /api/tenants/:id
   * @access Private
   */
  static async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        return this.error(res, 'Tenant ID is required', 400);
      }

      // Check if tenant exists
      const exists = await this.exists('tenants', 'id', id);
      if (!exists) {
        return this.error(res, 'Tenant not found', 404);
      }

      // Sanitize input
      const allowedFields = [
        'name', 'company_name', 'business_type', 'zone', 'category',
        'email', 'phone', 'status',
        'contact_person', 'contact_email', 'contact_phone', 'address', 
        'building', 'floor', 'unit', 'max_employees', 'settings', 'branding'
      ];
      const sanitizedData = this.sanitizeInput(updateData, allowedFields);
      
      if (Object.keys(sanitizedData).length === 0) {
        return this.error(res, 'No valid fields to update', 400);
      }

      // Convert JSON fields
      if (sanitizedData.settings && typeof sanitizedData.settings === 'object') {
        sanitizedData.settings = JSON.stringify(sanitizedData.settings);
      }
      if (sanitizedData.branding && typeof sanitizedData.branding === 'object') {
        sanitizedData.branding = JSON.stringify(sanitizedData.branding);
      }

      // Build update query
      const setClause = Object.keys(sanitizedData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(sanitizedData), id];
      
      const query = `
        UPDATE tenants 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await this.executeQuery(query, values);
      
      if (result.affectedRows === 0) {
        return this.error(res, 'No changes were made', 400);
      }

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'update',
        'tenant',
        id,
        sanitizedData,
        req.ip
      );

      return this.success(res, { id }, 'Tenant updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update tenant', 500, error);
    }
  }

  /**
   * Delete tenant (soft delete)
   * @route DELETE /api/tenants/:id
   * @access Private
   */
  static async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Tenant ID is required', 400);
      }

      const success = await this.softDelete('tenants', id, 'id');
      
      if (!success) {
        return this.error(res, 'Tenant not found', 404);
      }

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'delete',
        'tenant',
        id,
        {},
        req.ip
      );

      return this.success(res, { id }, 'Tenant deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete tenant', 500, error);
    }
  }

  /**
   * Update tenant status
   * @route PATCH /api/tenants/:id/status
   * @access Private
   */
  static async updateTenantStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status) {
        return this.error(res, 'Tenant ID and status are required', 400);
      }

      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      if (!validStatuses.includes(status)) {
        return this.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const query = `
        UPDATE tenants 
        SET status = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await this.executeQuery(query, [status, id]);
      
      if (result.affectedRows === 0) {
        return this.error(res, 'Tenant not found', 404);
      }

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        'status_update',
        'tenant',
        id,
        { status },
        req.ip
      );

      return this.success(res, { id, status }, 'Tenant status updated successfully');

    } catch (error) {
      return this.error(res, 'Failed to update tenant status', 500, error);
    }
  }

  /**
   * Export tenant data
   * @route GET /api/tenants/export
   * @access Private
   */
  static async exportTenantData(req, res) {
    try {
      const query = `
        SELECT * FROM tenants 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const tenants = await this.executeQuery(query);
      
      return this.success(res, tenants, 'Tenant data exported successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to export tenant data', 500, error);
    }
  }

  /**
   * Bulk update tenants
   * @route PATCH /api/tenants/bulk
   * @access Private
   */
  static async bulkUpdateTenants(req, res) {
    try {
      const { ids, action, data } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return this.error(res, 'Tenant IDs array is required', 400);
      }

      if (!action) {
        return this.error(res, 'Action is required', 400);
      }

      let query;
      let params;

      switch (action) {
        case 'activate':
          query = `UPDATE tenants SET status = 'active', updated_at = NOW() WHERE id IN (${ids.map(() => '?').join(',')}) AND deleted_at IS NULL`;
          params = ids;
          break;
        case 'suspend':
          query = `UPDATE tenants SET status = 'suspended', updated_at = NOW() WHERE id IN (${ids.map(() => '?').join(',')}) AND deleted_at IS NULL`;
          params = ids;
          break;
        case 'delete':
          query = `UPDATE tenants SET deleted_at = NOW() WHERE id IN (${ids.map(() => '?').join(',')})`;
          params = ids;
          break;
        default:
          return this.error(res, 'Invalid action', 400);
      }

      const result = await this.executeQuery(query, params);

      // Log activity
      await this.logActivity(
        req.user?.user_id || 1,
        `bulk_${action}`,
        'tenant',
        0,
        { ids, count: result.affectedRows },
        req.ip
      );

      return this.success(res, { affected: result.affectedRows }, `Bulk ${action} completed successfully`);

    } catch (error) {
      return this.error(res, 'Failed to perform bulk operation', 500, error);
    }
  }

  /**
   * Get comprehensive tenant dashboard data
   * @route GET /api/tenants/:id/dashboard
   * @access Private
   */
  static async getTenantDashboard(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return this.error(res, 'Tenant ID is required', 400);
      }

      // Get comprehensive dashboard metrics
      const dashboardQuery = `
        SELECT 
          t.name as tenant_name,
          t.status,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(visit_date) = CURDATE()) as today_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND status = 'checked_in') as active_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(visit_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as week_visitors,
          (SELECT COUNT(*) FROM visitors WHERE tenant_id = ? AND DATE(visit_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as month_visitors,
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND status IN ('pending', 'in_transit')) as active_materials,
          (SELECT COUNT(*) FROM materials WHERE tenant_id = ? AND DATE(created_at) = CURDATE()) as today_materials,
          (SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = ? AND status = 'pending') as pending_approvals,
          (SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = ? AND status = 'approved' AND DATE(approved_at) = CURDATE()) as today_approvals
        FROM tenants t
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;
      
      const dashboard = await this.executeQuery(dashboardQuery, [id, id, id, id, id, id, id, id, id]);
      
      if (dashboard.length === 0) {
        return this.error(res, 'Tenant not found', 404);
      }

      // Get recent activities
      const recentActivitiesQuery = `
        SELECT 'visitor' as type, v.name as title, v.status, v.created_at
        FROM visitors v WHERE v.tenant_id = ?
        UNION ALL
        SELECT 'material' as type, m.material_name as title, m.status, m.created_at
        FROM materials m WHERE m.tenant_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      const recentActivities = await this.executeQuery(recentActivitiesQuery, [id, id]);

      const dashboardData = {
        ...dashboard[0],
        recentActivities,
        kpis: {
          todayVisitors: parseInt(dashboard[0].today_visitors) || 0,
          activeVisitors: parseInt(dashboard[0].active_visitors) || 0,
          weekVisitors: parseInt(dashboard[0].week_visitors) || 0,
          monthVisitors: parseInt(dashboard[0].month_visitors) || 0,
          activeMaterials: parseInt(dashboard[0].active_materials) || 0,
          todayMaterials: parseInt(dashboard[0].today_materials) || 0,
          pendingApprovals: parseInt(dashboard[0].pending_approvals) || 0,
          todayApprovals: parseInt(dashboard[0].today_approvals) || 0
        }
      };

      return this.success(res, dashboardData, 'Dashboard data retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to fetch dashboard data', 500, error);
    }
  }
  
  /**
   * Tenant Application Module - Material Registration
   * @route POST /api/tenants/:id/materials/register
   * @access Private (Tenant User with materials.create permission)
   */
  static async registerMaterial(req, res) {
    try {
      const { id: tenantId } = req.params;
      const materialData = req.body;
      
      // Verify tenant access and permissions
      const TenantAdminController = require('./tenantAdminController');
      const tenantAccess = await TenantAdminController.verifyTenantAccess(req.user?.user_id, tenantId, 'materials.create');
      if (!tenantAccess.hasAccess) {
        return this.error(res, tenantAccess.message, tenantAccess.statusCode);
      }
      
      // Validate required fields
      this.validateRequired(materialData, ['material_name', 'description', 'category', 'quantity']);
      
      // Generate unique tracking number
      const trackingNumber = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const materialId = require('crypto').randomUUID();
      
      const insertQuery = `
        INSERT INTO materials (
          id, tracking_number, material_name, description, category, 
          priority, quantity, unit, tenant_id, status, current_location, 
          destination, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW(), NOW())
      `;
      
      await this.executeQuery(insertQuery, [
        materialId,
        trackingNumber,
        materialData.material_name,
        materialData.description,
        materialData.category,
        materialData.priority || 'medium',
        materialData.quantity || 1,
        materialData.unit || 'units',
        tenantId,
        materialData.current_location || 'Warehouse',
        materialData.destination || 'Tenant Office',
        req.user?.user_id || 1
      ]);
      
      // Log timeline
      await this.executeQuery(
        'INSERT INTO material_timeline (material_id, action, description, user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [materialId, 'registered', `Material registered by ${tenantAccess.tenant.name} representative`, req.user?.user_id || 1]
      );
      
      // Log tenant activity
      await TenantAdminController.logTenantActivity(
        tenantId,
        req.user?.user_id,
        'material_registered',
        'material',
        materialId,
        `Material "${materialData.material_name}" registered`,
        { tracking_number: trackingNumber, category: materialData.category },
        req.ip
      );
      
      return this.success(res, {
        id: materialId,
        trackingNumber,
        status: 'pending',
        tenant: tenantAccess.tenant.name
      }, 'Material registered successfully', 201);
      
    } catch (error) {
      return this.error(res, 'Failed to register material', 500, error);
    }
  }
  
  /**
   * Tenant Application Module - Check-In Request
   * @route POST /api/tenants/:id/materials/:materialId/checkin
   * @access Private
   */
  static async requestMaterialCheckIn(req, res) {
    try {
      const { id: tenantId, materialId } = req.params;
      
      // Validate material exists and belongs to tenant
      const material = await this.executeQuery(
        'SELECT * FROM materials WHERE id = ? AND tenant_id = ? AND status IN ("approved", "delivered")',
        [materialId, tenantId]
      );
      
      if (material.length === 0) {
        return this.error(res, 'Material not found or not eligible for check-in', 404);
      }
      
      // Update status to in_transit
      await this.executeQuery(
        'UPDATE materials SET status = "in_transit", updated_at = NOW() WHERE id = ?',
        [materialId]
      );
      
      // Log timeline
      await this.executeQuery(
        'INSERT INTO material_timeline (material_id, action, description, user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [materialId, 'check_in_requested', 'Check-in requested by tenant', req.user?.user_id || 1]
      );
      
      return this.success(res, { materialId, status: 'in_transit' }, 'Check-in request submitted successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to request check-in', 500, error);
    }
  }
  
  /**
   * Tenant Application Module - Dispense/Out Request
   * @route POST /api/tenants/:id/materials/:materialId/dispense
   * @access Private
   */
  static async requestMaterialDispense(req, res) {
    try {
      const { id: tenantId, materialId } = req.params;
      const { vehicleDetails, driverDetails, reason } = req.body;
      
      // Validate material exists and belongs to tenant
      const material = await this.executeQuery(
        'SELECT * FROM materials WHERE id = ? AND tenant_id = ? AND status = "delivered"',
        [materialId, tenantId]
      );
      
      if (material.length === 0) {
        return this.error(res, 'Material not found or not available for dispensing', 404);
      }
      
      // Create dispense request (using approvals table)
      const approvalId = await this.executeQuery(
        'INSERT INTO approvals (entity_type, entity_id, workflow_name, status, requested_by, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        ['material_dispense', materialId, 'Material Dispense Request', 'pending', req.user?.user_id || 1, 1, JSON.stringify({ vehicleDetails, driverDetails, reason })]
      );
      
      // Log timeline
      await this.executeQuery(
        'INSERT INTO material_timeline (material_id, action, description, user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [materialId, 'dispense_requested', `Dispense requested: ${reason}`, req.user?.user_id || 1]
      );
      
      return this.success(res, { 
        materialId, 
        approvalId: approvalId.insertId,
        status: 'dispense_requested' 
      }, 'Dispense request submitted successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to request dispense', 500, error);
    }
  }
  
  /**
   * Tenant Logo Upload
   * @route POST /api/tenants/:id/logo
   * @access Private
   */
  static async uploadTenantLogo(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return this.error(res, 'Logo file is required', 400);
      }
      
      const logoPath = `/uploads/tenants/${id}/${req.file.filename}`;
      
      // Update tenant branding
      const currentBranding = await this.executeQuery(
        'SELECT branding FROM tenants WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      
      let branding = {};
      if (currentBranding.length > 0 && currentBranding[0].branding) {
        try {
          branding = JSON.parse(currentBranding[0].branding);
        } catch (e) {
          branding = {};
        }
      }
      
      branding.logo = logoPath;
      
      await this.executeQuery(
        'UPDATE tenants SET branding = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(branding), id]
      );
      
      return this.success(res, { logoPath }, 'Logo uploaded successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to upload logo', 500, error);
    }
  }

  /**
   * Get tenant materials with filtering
   * @route GET /api/tenants/:id/materials
   * @access Private
   */
  static async getTenantMaterials(req, res) {
    try {
      res.locals.startTime = Date.now();
      const { id: tenantId } = req.params;
      const { status, category } = req.query;
      const { page, limit, offset } = this.validatePagination(req.query);
      
      let whereClause = 'WHERE tenant_id = ?';
      const queryParams = [tenantId];
      
      if (status) {
        whereClause += ' AND status = ?';
        queryParams.push(status);
      }
      
      if (category) {
        whereClause += ' AND category = ?';
        queryParams.push(category);
      }
      
      const materialsQuery = `
        SELECT m.*, 
               (SELECT COUNT(*) FROM material_timeline WHERE material_id = m.id) as timeline_count
        FROM materials m
        ${whereClause}
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const materials = await this.executeQuery(materialsQuery, queryParams);
      
      const totalQuery = `SELECT COUNT(*) as total FROM materials ${whereClause}`;
      const total = await this.executeQuery(totalQuery, queryParams.slice(0, -2));
      
      return this.paginated(res, materials, total[0].total, page, limit, 'Materials retrieved successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to fetch materials', 500, error);
    }
  }
  
  /**
   * Get tenant visitors with filtering
   * @route GET /api/tenants/:id/visitors
   * @access Private
   */
  static async getTenantVisitors(req, res) {
    try {
      res.locals.startTime = Date.now();
      const { id: tenantId } = req.params;
      const { status, date } = req.query;
      const { page, limit, offset } = this.validatePagination(req.query);
      
      let whereClause = 'WHERE tenant_id = ?';
      const queryParams = [tenantId];
      
      if (status) {
        whereClause += ' AND status = ?';
        queryParams.push(status);
      }
      
      if (date) {
        whereClause += ' AND DATE(visit_date) = ?';
        queryParams.push(date);
      }
      
      // offset already calculated in validatePagination
      
      const visitorsQuery = `
        SELECT v.*, 
               (SELECT COUNT(*) FROM visitor_timeline WHERE visitor_id = v.id) as timeline_count
        FROM visitors v
        ${whereClause}
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const visitors = await this.executeQuery(visitorsQuery, queryParams);
      
      const totalQuery = `SELECT COUNT(*) as total FROM visitors ${whereClause}`;
      const total = await this.executeQuery(totalQuery, queryParams.slice(0, -2));
      
      return this.paginated(res, visitors, total[0].total, page, limit, 'Visitors retrieved successfully');
      
    } catch (error) {
      return this.error(res, 'Failed to fetch visitors', 500, error);
    }
  }

  // Helper Methods

  /**
   * Process tenant data - Enhanced with professional features
   */
  static processTenantDataEnhanced(tenant) {
    let settings = {};
    let branding = {};
    
    try {
      settings = tenant.settings ? JSON.parse(tenant.settings) : {};
      branding = tenant.branding ? JSON.parse(tenant.branding) : {};
    } catch (e) {
      console.warn(`Failed to parse JSON for tenant ${tenant.id}:`, e.message);
    }
    
    // Calculate activity score based on usage
    const activityScore = this.calculateActivityScore({
      visitors: parseInt(tenant.total_visitors) || 0,
      materials: parseInt(tenant.total_materials) || 0,
      users: parseInt(tenant.total_users) || 0
    });
    
    // Determine tenant health status
    const healthStatus = this.determineTenantHealth(tenant);
    
    return {
      ...tenant,
      settings: {
        maxVisitors: settings.max_visitors || 50,
        notificationsEnabled: settings.notifications !== false,
        autoApproval: settings.auto_approval || true,
        requiresDocuments: settings.require_documents || false,
        workingHours: settings.working_hours || { start: '08:00', end: '18:00' },
        ...settings
      },
      branding: {
        primaryColor: branding.color || '#007bff',
        logo: branding.logo || null,
        theme: branding.theme || 'light',
        customCss: branding.custom_css || null,
        ...branding
      },
      // KPIs and Metrics
      kpis: {
        activeVisitors: parseInt(tenant.active_visitors) || 0,
        todayVisitors: parseInt(tenant.today_visitors) || 0,
        totalVisitors: parseInt(tenant.total_visitors) || 0,
        activeMaterials: parseInt(tenant.active_materials) || 0,
        totalMaterials: parseInt(tenant.total_materials) || 0,
        pendingApprovals: parseInt(tenant.pending_approvals) || 0,
        totalApprovals: parseInt(tenant.total_approvals) || 0,
        totalUsers: parseInt(tenant.total_users) || 0,
        activityScore,
        healthStatus
      },
      // VMMS Status Information
      vmmsStatus: {
        isActive: tenant.status === 'active',
        maxEmployees: tenant.max_employees || 50
      },
      // IT Park Policies (all tenants get full access)
      policies: {
        approvalSteps: 2,
        autoApproval: true,
        notificationsEnabled: true,
        requiresDocuments: false,
        maxVisitorsPerDay: tenant.max_employees ? Math.ceil(tenant.max_employees * 1.5) : 75,
        canManageUsers: true,
        canCustomizeBranding: true,
        canExportData: true,
        canAccessAnalytics: true
      },
      // Display Information
      display: {
        statusBadge: this.getStatusBadge(tenant.status),
        healthBadge: this.getHealthBadge(healthStatus)
      }
    };
  }
  
  /**
   * Legacy method for backward compatibility
   */
  static processTenantData(tenant) {
    return this.processTenantDataEnhanced(tenant);
  }

  /**
   * Build enhanced tenant statistics
   */
  static buildTenantStats(statsResult, total) {
    const stats = {
      total: total,
      active: 0,
      inactive: 0,
      suspended: 0,
      pending: 0,
      byStatus: {},
      healthMetrics: {
        healthy: 0,
        warning: 0,
        critical: 0
      },
      contractMetrics: {
        active: 0,
        expiring: 0,
        expired: 0
      }
    };
    
    statsResult.forEach(stat => {
      stats[stat.status] = (stats[stat.status] || 0) + stat.count;
      stats.byStatus[stat.status] = (stats.byStatus[stat.status] || 0) + stat.count;
    });

    return stats;
  }
  
  /**
   * Calculate tenant activity score (0-100)
   */
  static calculateActivityScore({ visitors, materials, users }) {
    const visitorScore = Math.min(visitors * 2, 40); // Max 40 points
    const materialScore = Math.min(materials * 3, 30); // Max 30 points
    const userScore = Math.min(users * 5, 30); // Max 30 points
    
    return Math.min(visitorScore + materialScore + userScore, 100);
  }
  
  /**
   * Determine tenant health status
   */
  static determineTenantHealth(tenant) {
    const totalActivity = (parseInt(tenant.total_visitors) || 0) + (parseInt(tenant.total_materials) || 0);
    const totalUsers = parseInt(tenant.total_users) || 0;
    
    if (tenant.status !== 'active') return 'critical';
    if (totalActivity < 5 || totalUsers === 0) return 'warning';
    return 'healthy';
  }
  
  /**
   * Get status badge configuration
   */
  static getStatusBadge(status) {
    const badges = {
      active: { color: 'success', icon: 'check-circle', text: 'Active' },
      inactive: { color: 'secondary', icon: 'pause-circle', text: 'Inactive' },
      suspended: { color: 'danger', icon: 'x-circle', text: 'Suspended' },
      pending: { color: 'warning', icon: 'clock', text: 'Pending' }
    };
    return badges[status] || badges.pending;
  }
  
  
  /**
   * Get contract badge configuration
   */
  static getContractBadge(contractStatus) {
    const badges = {
      active_contract: { color: 'success', icon: 'file-earmark-check', text: 'Active Contract' },
      expiring_soon: { color: 'warning', icon: 'exclamation-triangle', text: 'Expiring Soon' },
      expired: { color: 'danger', icon: 'x-circle', text: 'Expired' }
    };
    return badges[contractStatus] || badges.active_contract;
  }
  
  /**
   * Get health badge configuration
   */
  static getHealthBadge(healthStatus) {
    const badges = {
      healthy: { color: 'success', icon: 'heart-fill', text: 'Healthy' },
      warning: { color: 'warning', icon: 'exclamation-triangle-fill', text: 'Warning' },
      critical: { color: 'danger', icon: 'x-octagon-fill', text: 'Critical' }
    };
    return badges[healthStatus] || badges.healthy;
  }

  // ============================================================================
  // ENHANCED TENANT CREATION METHODS
  // ============================================================================

  /**
   * Comprehensive tenant creation validation
   */
  static async validateTenantCreation({ name, email, business_type, zone, category, tenant_users = [] }) {
    const errors = [];

    // Basic validation
    if (!name?.trim()) errors.push('Company name is required');
    if (!email?.trim()) errors.push('Company email is required');
    if (email && !this.isValidEmail(email)) errors.push('Invalid email format');
    
    // New required fields validation
    if (!business_type?.trim()) errors.push('Business type is required');
    if (!zone?.trim()) errors.push('Zone is required');
    if (!category?.trim()) errors.push('Category is required');

    // Get users to create (no artificial limit)
    const usersToCreate = tenant_users.filter(u => u.create_user === true);

    // Validate each tenant user
    for (let i = 0; i < usersToCreate.length; i++) {
      const user = usersToCreate[i];
      const userLabel = `User ${i + 1}`;

      if (!user.first_name?.trim()) errors.push(`${userLabel}: First name is required`);
      if (!user.last_name?.trim()) errors.push(`${userLabel}: Last name is required`);
      if (!user.email?.trim()) errors.push(`${userLabel}: Email is required`);
      if (!user.username?.trim()) errors.push(`${userLabel}: Username is required`);
      if (!user.password?.trim()) errors.push(`${userLabel}: Password is required`);
      if (!user.role_id) errors.push(`${userLabel}: Role is required`);

      if (user.email && !this.isValidEmail(user.email)) {
        errors.push(`${userLabel}: Invalid email format`);
      }

      if (user.password && !this.isStrongPassword(user.password)) {
        errors.push(`${userLabel}: Password must be at least 8 characters with uppercase, lowercase, number, and special character`);
      }
    }

    // Check for existing tenant
    const existingTenant = await this.executeQuery(
      'SELECT id FROM tenants WHERE email = ? OR (name = ? AND deleted_at IS NULL)',
      [email, name]
    );
    if (existingTenant.length > 0) {
      errors.push('Tenant with this email or name already exists');
    }

    // Check for existing usernames and emails
    for (const user of usersToCreate) {
      if (user.username) {
        const existingUser = await this.executeQuery(
          'SELECT user_id FROM users WHERE user_name = ?',
          [user.username]
        );
        if (existingUser.length > 0) {
          errors.push(`Username '${user.username}' already exists`);
        }
      }

      if (user.email) {
        const existingEmail = await this.executeQuery(
          'SELECT employee_id FROM employees WHERE email = ?',
          [user.email]
        );
        if (existingEmail.length > 0) {
          errors.push('Admin email already exists');
        }
      }
    }

    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(', '));
    }
  }

  /**
   * Generate unique tenant code
   */
  static async generateUniqueTenantCode(companyName) {
    const crypto = require('crypto');
    
    const baseCode = companyName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3)
      .padEnd(3, 'X');

    let counter = 1;
    let tenantCode;

    do {
      tenantCode = `TEN-${baseCode}${counter.toString().padStart(3, '0')}`;
      const existing = await this.executeQuery(
        'SELECT id FROM tenants WHERE tenant_code = ?',
        [tenantCode]
      );
      if (existing.length === 0) break;
      counter++;
    } while (counter <= 999);

    if (counter > 999) {
      tenantCode = `TEN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    }

    return tenantCode;
  }

  /**
   * Generate comprehensive default settings for IT Park automation
   */
  static generateTenantDefaultSettings(maxEmployees) {
    const baseSettings = {
      // Core Settings
      max_visitors: maxEmployees ? Math.ceil(maxEmployees * 1.5) : 75,
      max_employees: maxEmployees || 50,
      working_hours: { start: '08:00', end: '18:00' },
      timezone: 'Africa/Addis_Ababa',
      
      // Notification Settings (all tenants get full access)
      notifications: {
        enabled: true,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        notification_frequency: 'real_time'
      },
      
      // Visitor Management Settings (IT Park automation)
      visitor_management: {
        auto_approval: true,
        require_documents: false,
        visitor_badge_required: true,
        escort_required: false,
        photo_required: true,
        id_verification: true,
        advance_booking_required: true,
        max_visit_duration: 24, // hours
        security_clearance_levels: ['none', 'basic', 'medium', 'high']
      },
      
      // Material Management Settings (full access)
      material_management: {
        approval_workflow: true,
        tracking_enabled: true,
        qr_code_generation: true,
        photo_documentation: true,
        delivery_notifications: true,
        auto_status_updates: true
      },
      
      // Access Control Settings (IT Park standard)
      access_control: {
        multi_location_support: true,
        role_based_access: true,
        session_timeout: 8, // hours
        password_policy: {
          min_length: 8,
          require_special_chars: true,
          require_numbers: true,
          require_uppercase: true
        }
      },
      
      // Integration Settings (full access)
      integrations: {
        api_access_enabled: true,
        webhook_support: true,
        third_party_integrations: true,
        export_capabilities: true
      },
      
      // Reporting Settings (full access)
      reporting: {
        basic_reports: true,
        advanced_analytics: true,
        custom_reports: true,
        scheduled_reports: true,
        data_retention_days: 1095 // 3 years
      },
      
      // Branding & Customization (full access)
      customization: {
        custom_branding_enabled: true,
        custom_themes: true,
        custom_fields: true,
        white_labeling: true
      }
    };

    return baseSettings;
  }

  /**
   * Generate comprehensive default branding for IT Park
   */
  static generateTenantDefaultBranding() {
    return {
      // Color Scheme
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
      },
      
      // Theme Settings
      theme: {
        mode: 'light',
        sidebar_style: 'default',
        header_style: 'default',
        card_style: 'default'
      },
      
      // Logo & Assets
      assets: {
        logo: null,
        favicon: null,
        login_background: null,
        email_header: null
      },
      
      // Typography
      typography: {
        font_family: 'Inter, system-ui, sans-serif',
        font_size_base: '14px',
        heading_font_weight: '600'
      },
      
      // Layout Settings
      layout: {
        sidebar_width: '250px',
        header_height: '60px',
        card_border_radius: '8px',
        button_border_radius: '6px'
      },
      
      // Custom CSS
      custom_css: '',
      
      // Email Templates
      email_templates: {
        welcome_template: 'default',
        notification_template: 'default',
        approval_template: 'default'
      },
      
      // Messaging
      messages: {
        welcome_message: 'Welcome to our facility',
        footer_text: 'Powered by VMMS',
        contact_info: null
      }
    };
  }

  /**
   * Create tenant user (Manager or Admin) with complete setup
   * @param {Object} connection - Database connection
   * @param {Number} tenantId - Tenant ID
   * @param {Object} userData - User data (first_name, last_name, email, phone, username, password)
   * @param {Number} roleId - Role ID (3=Tenant Manager, 4=Tenant Staff)
   * @param {Boolean} isPrimary - Is this a primary user
   * @param {Number} createdBy - User ID who created this user
   */
  static async createTenantUser(connection, tenantId, userData, roleId, isPrimary, createdBy) {
    const bcrypt = require('bcrypt');
    
    const {
      first_name, last_name, email, phone,
      username, password
    } = userData;

    // Debug logging
    console.log('🔍 Creating tenant user with roleId:', roleId);
    console.log('🔍 User data:', { first_name, last_name, email, phone, username });
    console.log('🔍 Tenant ID:', tenantId);

    // 1. Create employee record (linked to tenant)
    const employeeResult = await connection.execute(
      `INSERT INTO employees (
        name, fname, lname, email, phone, 
        role_id, tenant_id, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        `${first_name} ${last_name}`,
        first_name, last_name, email, phone,
        roleId, tenantId
      ]
    );

    const employeeId = employeeResult[0].insertId;

    // 2. Create user account (linked to tenant)
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = await connection.execute(
      `INSERT INTO users (
        employee_id, user_name, password, role_id, tenant_id,
        user_type, is_primary, status, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'tenant', ?, 'active', NOW(), NOW())`,
      [employeeId, username, hashedPassword, roleId, tenantId, isPrimary ? 1 : 0]
    );

    const userId = userResult[0].insertId;

    // 3. Log activity (removed 'details' column as it doesn't exist in schema)
    await connection.execute(
      `INSERT INTO activity_log (
        user_id, action, entity_type, entity_id
      ) VALUES (?, ?, ?, ?)`,
      [
        createdBy || 1,
        'CREATE_TENANT_USER',
        'user',
        userId
      ]
    );

    return userId;
  }

  /**
   * Setup default permissions and menu access for tenant
   */
  static async setupTenantDefaultPermissions(connection, tenantId, adminUserId) {
    // All tenant menu items (full access for IT Park automation)
    const tenantMenuItems = [1, 2, 4, 6, 7, 10, 12, 13, 14, 23, 24, 25, 32, 33, 34, 41, 52, 53];

    // Setup role permissions for tenant admin (full access)
    for (const menuId of tenantMenuItems) {
      try {
        await connection.execute(
          `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, can_export)
           VALUES (3, ?, 1, 1, 1, 1, 1, 1)
           ON DUPLICATE KEY UPDATE can_view = 1, can_create = 1, can_edit = 1, can_delete = 1, can_approve = 1, can_export = 1`,
          [menuId]
        );
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('Duplicate entry')) {
          throw error;
        }
      }
    }
  }

  /**
   * Log tenant-specific activity with connection
   */
  static async logTenantActivity(connection, tenantId, userId, activityType, entityType, entityId, description, metadata, ipAddress) {
    try {
      await connection.execute(
        `INSERT INTO tenant_activity_logs (
          tenant_id, user_id, activity_type, entity_type, entity_id, 
          description, metadata, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          tenantId, userId, activityType, entityType, entityId,
          description, JSON.stringify(metadata), ipAddress
        ]
      );
    } catch (error) {
      console.error('Failed to log tenant activity:', error);
    }
  }

  /**
   * Get tenant with full details including admin info
   */
  static async getTenantWithFullDetails(tenantId) {
    const query = `
      SELECT t.*, 
             u.user_name as admin_username, 
             CONCAT(e.fname, ' ', e.lname) as admin_name,
             e.email as admin_email,
             e.phone as admin_phone
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.is_primary = 1
      LEFT JOIN users u ON tu.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE t.id = ?
    `;
    
    const result = await this.executeQuery(query, [tenantId]);
    return result[0];
  }

  /**
   * Send welcome email (placeholder for integration)
   */
  static async sendTenantWelcomeEmail(tenant, adminUser) {
    // This would integrate with your email service
    console.log(`📧 Welcome email would be sent to ${tenant.contact_email || tenant.email}`);
    console.log(`Tenant: ${tenant.name} (${tenant.tenant_code})`);
    if (adminUser) {
      console.log(`Admin user created: ${adminUser.username}`);
    }
  }

  /**
   * Generate next steps for tenant onboarding
   */
  static generateTenantNextSteps(status, hasAdmin) {
    const steps = [];

    if (status === 'pending') {
      steps.push({
        step: 1,
        title: 'Wait for Approval',
        description: 'Your tenant registration is pending admin approval',
        status: 'pending',
        required: true
      });
    }

    if (!hasAdmin) {
      steps.push({
        step: steps.length + 1,
        title: 'Create Admin User',
        description: 'Set up the primary administrator account',
        status: 'pending',
        required: true
      });
    }

    steps.push(
      {
        step: steps.length + 1,
        title: 'Complete Profile',
        description: 'Fill in all company and contact information',
        status: 'pending',
        required: true
      },
      {
        step: steps.length + 1,
        title: 'Upload Logo',
        description: 'Add your company logo and branding',
        status: 'pending',
        required: false
      },
      {
        step: steps.length + 1,
        title: 'Configure Settings',
        description: 'Set up working hours, policies, and preferences',
        status: 'pending',
        required: true
      },
      {
        step: steps.length + 1,
        title: 'Add Team Members',
        description: 'Invite additional users and assign roles',
        status: 'pending',
        required: false
      },
      {
        step: steps.length + 1,
        title: 'Test System',
        description: 'Create a test visitor and material entry',
        status: 'pending',
        required: true
      }
    );

    return steps;
  }

  /**
   * Get tenant capabilities for IT Park automation
   */
  static getTenantCapabilities() {
    // All tenants get full capabilities for IT Park automation
    return [
      'Full visitor management suite',
      'Advanced material workflows',
      'Real-time notifications',
      'Comprehensive analytics',
      'Full API access',
      'Custom branding',
      'Multi-location support',
      'Priority support',
      'Custom integrations',
      'Advanced security features',
      'QR code generation',
      'Photo verification',
      'Workflow automation',
      'Advanced reporting',
      'Export capabilities'
    ];
  }

  /**
   * Generate onboarding checklist
   */
  static generateOnboardingChecklist() {
    // Complete onboarding checklist for all IT Park tenants
    const checklist = [
      { item: 'Company information completed', required: true, category: 'setup' },
      { item: 'Contact details verified', required: true, category: 'setup' },
      { item: 'Admin user created', required: true, category: 'setup' },
      { item: 'Working hours configured', required: true, category: 'setup' },
      { item: 'Notification preferences set', required: false, category: 'setup' },
      { item: 'API access configured', required: false, category: 'integration' },
      { item: 'Custom theme selected', required: false, category: 'branding' },
      { item: 'Advanced reporting enabled', required: false, category: 'features' },
      { item: 'Custom branding uploaded', required: false, category: 'branding' },
      { item: 'Security policies configured', required: true, category: 'security' },
      { item: 'Integration webhooks set up', required: false, category: 'integration' },
      { item: 'Multi-location settings configured', required: false, category: 'features' }
    ];

    return checklist;
  }

  // Helper Methods for IT Park Automation

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  /**
   * Get current user's tenant information
   * @route GET /api/tenants/current
   * @access Private
   */
  static async getCurrentUserTenant(req, res) {
    try {
      const userId = req.user?.user_id || req.headers['user-id'];
      
      if (!userId) {
        return this.error(res, 'User authentication required', 401);
      }

      console.log('🔄 Fetching current tenant for user:', userId);

      // First, try to get tenant from tenant_users table (preferred)
      const tenantAssignmentQuery = `
        SELECT 
          tu.tenant_id,
          tu.tenant_role,
          tu.permissions,
          tu.status as assignment_status,
          tu.assigned_at
        FROM tenant_users tu
        WHERE tu.user_id = ? AND tu.deleted_at IS NULL AND tu.status = 'active'
        ORDER BY tu.assigned_at DESC
        LIMIT 1
      `;

      let assignments = await this.executeQuery(tenantAssignmentQuery, [userId]);
      let tenantId = null;
      let assignment = null;

      if (assignments.length > 0) {
        // Found in tenant_users table
        assignment = assignments[0];
        tenantId = assignment.tenant_id;
        console.log('✅ Found tenant assignment in tenant_users table:', tenantId);
      } else {
        // Fallback: Check users.tenant_id column
        console.log('⚠️ No tenant_users assignment, checking users.tenant_id...');
        const userQuery = `SELECT tenant_id FROM users WHERE user_id = ?`;
        const users = await this.executeQuery(userQuery, [userId]);
        
        if (users.length > 0 && users[0].tenant_id) {
          tenantId = users[0].tenant_id;
          // Create a default assignment object
          assignment = {
            tenant_id: tenantId,
            tenant_role: 'member',
            permissions: null,
            assignment_status: 'active',
            assigned_at: null
          };
          console.log('✅ Found tenant_id in users table:', tenantId);
        } else {
          console.log('❌ User has no tenant assignment');
          return this.error(res, 'User is not assigned to any tenant', 404);
        }
      }

      // Get comprehensive tenant data with KPIs
      const tenantQuery = `
        SELECT 
          t.*,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id AND status = 'checked_in'), 0) as active_visitors,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id AND DATE(visit_date) = CURDATE()), 0) as today_visitors,
          COALESCE((SELECT COUNT(*) FROM visitors WHERE tenant_id = t.id), 0) as total_visitors,
          COALESCE((SELECT COUNT(*) FROM materials WHERE tenant_id = t.id AND status IN ('pending', 'in_transit')), 0) as active_materials,
          COALESCE((SELECT COUNT(*) FROM materials WHERE tenant_id = t.id), 0) as total_materials,
          COALESCE((SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = t.id AND status = 'pending'), 0) as pending_approvals,
          COALESCE((SELECT COUNT(*) FROM approvals WHERE entity_type = 'tenant' AND entity_id = t.id), 0) as total_approvals,
          COALESCE((SELECT COUNT(*) FROM tenant_users WHERE tenant_id = t.id AND status = 'active'), 0) as total_users,
          COALESCE((
            SELECT ROUND(
              (COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
            )
            FROM approvals 
            WHERE entity_type = 'tenant' AND entity_id = t.id
          ), 0) as approval_rate,
          COALESCE((
            SELECT CONCAT(
              ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)), 1), ' hours'
            )
            FROM approvals 
            WHERE entity_type = 'tenant' AND entity_id = t.id AND status = 'approved'
          ), 'N/A') as avg_approval_time
        FROM tenants t
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;

      const tenants = await this.executeQuery(tenantQuery, [tenantId]);

      if (tenants.length === 0) {
        return this.error(res, 'Tenant not found or has been deleted', 404);
      }

      const tenant = tenants[0];

      // Process tenant data with enhanced features
      const processedTenant = this.processTenantDataEnhanced(tenant);

      // Add user-specific context
      processedTenant.userContext = {
        role: assignment.tenant_role,
        permissions: typeof assignment.permissions === 'string' 
          ? JSON.parse(assignment.permissions) 
          : assignment.permissions,
        assignedAt: assignment.assigned_at,
        assignmentStatus: assignment.assignment_status
      };

      console.log('✅ Current tenant data loaded successfully:', processedTenant.name);

      return this.success(res, processedTenant, 'Current tenant data retrieved successfully');

    } catch (error) {
      console.error('❌ Error fetching current user tenant:', error);
      return this.error(res, 'Failed to fetch current tenant data', 500);
    }
  }

  static async getConnection() {
    const pool = require('../models/db');
    return await pool.getConnection();
  }
}

module.exports = TenantController;
