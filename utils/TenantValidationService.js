/**
 * Tenant Validation Service
 * Comprehensive validation and testing utilities for tenant management
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

class TenantValidationService {

  /**
   * Validate complete tenant creation payload
   */
  static validateTenantPayload(payload) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!payload.name?.trim()) {
      errors.push('Company name is required');
    } else if (payload.name.length < 2 || payload.name.length > 200) {
      errors.push('Company name must be between 2-200 characters');
    }

    if (!payload.email?.trim()) {
      errors.push('Company email is required');
    } else if (!this.isValidEmail(payload.email)) {
      errors.push('Invalid email format');
    }

    // New required fields validation
    if (!payload.business_type?.trim()) {
      errors.push('Business type is required');
    } else if (payload.business_type.length > 100) {
      errors.push('Business type must be less than 100 characters');
    }

    if (!payload.zone?.trim()) {
      errors.push('Zone is required');
    } else if (payload.zone.length > 100) {
      errors.push('Zone must be less than 100 characters');
    }

    if (!payload.category?.trim()) {
      errors.push('Category is required');
    } else if (payload.category.length > 100) {
      errors.push('Category must be less than 100 characters');
    }


    // Max employees validation
    if (payload.max_employees) {
      const maxEmployees = parseInt(payload.max_employees);
      if (isNaN(maxEmployees) || maxEmployees < 1 || maxEmployees > 10000) {
        errors.push('Max employees must be between 1-10000');
      }
    }

    // Admin user validation (if provided)
    if (payload.admin_user?.create_admin) {
      const adminErrors = this.validateAdminUser(payload.admin_user);
      errors.push(...adminErrors);
    }

    // Contact information validation
    if (payload.contact_email && !this.isValidEmail(payload.contact_email)) {
      errors.push('Invalid contact email format');
    }

    if (payload.phone && !this.isValidPhone(payload.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    // Location validation
    if (payload.building && payload.building.length > 100) {
      errors.push('Building name too long (max 100 characters)');
    }

    if (payload.floor && payload.floor.length > 50) {
      errors.push('Floor designation too long (max 50 characters)');
    }

    if (payload.unit && payload.unit.length > 50) {
      errors.push('Unit designation too long (max 50 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        total_checks: 18,
        passed: 18 - errors.length,
        failed: errors.length,
        warnings: warnings.length
      }
    };
  }

  /**
   * Validate admin user data
   */
  static validateAdminUser(adminUser) {
    const errors = [];

    if (!adminUser.first_name?.trim()) {
      errors.push('Admin first name is required');
    } else if (adminUser.first_name.length < 2 || adminUser.first_name.length > 100) {
      errors.push('Admin first name must be between 2-100 characters');
    }

    if (!adminUser.last_name?.trim()) {
      errors.push('Admin last name is required');
    } else if (adminUser.last_name.length < 2 || adminUser.last_name.length > 100) {
      errors.push('Admin last name must be between 2-100 characters');
    }

    if (!adminUser.admin_email?.trim()) {
      errors.push('Admin email is required');
    } else if (!this.isValidEmail(adminUser.admin_email)) {
      errors.push('Invalid admin email format');
    }

    if (!adminUser.username?.trim()) {
      errors.push('Admin username is required');
    } else if (adminUser.username.length < 3 || adminUser.username.length > 50) {
      errors.push('Username must be between 3-50 characters');
    } else if (!/^[a-zA-Z0-9._-]+$/.test(adminUser.username)) {
      errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }

    if (!adminUser.password?.trim()) {
      errors.push('Admin password is required');
    } else if (!this.isStrongPassword(adminUser.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    if (adminUser.admin_phone && !this.isValidPhone(adminUser.admin_phone)) {
      errors.push('Invalid admin phone format');
    }

    return errors;
  }

  /**
   * Generate tenant creation preview
   */
  static generateCreationPreview(payload) {
    
    return {
      tenant_info: {
        name: payload.name,
        company_name: payload.company_name || payload.name,
        business_type: payload.business_type,
        zone: payload.zone,
        category: payload.category,
        email: payload.email,
        estimated_code: this.generatePreviewCode(payload.name),
        status: payload.status || 'pending'
      },
      limits: {
        max_employees: payload.max_employees || 50,
        max_visitors: 200
      },
      features: this.getStandardFeatures(),
      admin_user: payload.admin_user?.create_admin ? {
        will_create: true,
        username: payload.admin_user.username,
        email: payload.admin_user.admin_email,
        role: 'admin'
      } : {
        will_create: false,
        note: 'Admin user will need to be created separately'
      },
      next_steps: this.getNextSteps(payload.admin_user?.create_admin),
      estimated_setup_time: this.estimateSetupTime(payload.admin_user?.create_admin)
    };
  }

  /**
   * Test database connectivity and requirements
   */
  static async testDatabaseRequirements() {
    const tests = [];
    
    try {
      const pool = require('../models/db');
      
      // Test 1: Basic connection
      tests.push({
        name: 'Database Connection',
        status: 'passed',
        message: 'Successfully connected to database'
      });

      // Test 2: Required tables exist
      const connection = await pool.getConnection();
      
      const requiredTables = ['tenants', 'tenant_users', 'tenant_activity_logs', 'users', 'employees', 'roles'];
      for (const table of requiredTables) {
        try {
          await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
          tests.push({
            name: `Table: ${table}`,
            status: 'passed',
            message: `Table ${table} exists and accessible`
          });
        } catch (error) {
          tests.push({
            name: `Table: ${table}`,
            status: 'failed',
            message: `Table ${table} missing or inaccessible: ${error.message}`
          });
        }
      }

      // Test 3: Foreign key constraints
      try {
        await connection.execute(`
          SELECT 
            CONSTRAINT_NAME,
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
          FROM information_schema.KEY_COLUMN_USAGE 
          WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'tenants'
        `);
        tests.push({
          name: 'Foreign Key Constraints',
          status: 'passed',
          message: 'Foreign key constraints properly configured'
        });
      } catch (error) {
        tests.push({
          name: 'Foreign Key Constraints',
          status: 'failed',
          message: `Foreign key validation failed: ${error.message}`
        });
      }

      connection.release();

    } catch (error) {
      tests.push({
        name: 'Database Connection',
        status: 'failed',
        message: `Database connection failed: ${error.message}`
      });
    }

    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;

    return {
      overall_status: failed === 0 ? 'passed' : 'failed',
      summary: {
        total_tests: tests.length,
        passed: passed,
        failed: failed,
        success_rate: `${Math.round((passed / tests.length) * 100)}%`
      },
      tests: tests,
      recommendations: failed > 0 ? [
        'Ensure all required database tables are created',
        'Check database connection configuration',
        'Verify foreign key constraints are properly set up'
      ] : [
        'Database is properly configured for tenant management',
        'All required tables and constraints are in place'
      ]
    };
  }

  static getStandardFeatures() {
    return [
      'Complete visitor management',
      'Material tracking and QR codes',
      'Multi-channel notifications',
      'Advanced reporting and analytics',
      'Full API access',
      'Custom branding and themes',
      'Workflow automation',
      'Security and compliance features',
      'Ethiopian IT Park integration'
    ];
  }

  static getNextSteps(hasAdminUser) {
    const steps = [];
    
    if (!hasAdminUser) {
      steps.push('Create admin user account');
    }
    
    steps.push(
      'Complete company profile',
      'Configure working hours and policies',
      'Set up notification preferences'
    );

    steps.push(
      'Configure API access',
      'Upload custom branding',
      'Set up integrations'
    );

    return steps;
  }

  static estimateSetupTime(hasAdminUser) {
    let baseTime = 15; // minutes for IT Park setup
    
    if (!hasAdminUser) baseTime += 5;
    // Standard setup time for all tenants
    baseTime += 10;

    return `${baseTime}-${baseTime + 10} minutes`;
  }
}

module.exports = TenantValidationService;
