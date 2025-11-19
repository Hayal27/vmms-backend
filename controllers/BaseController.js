/**
 * Base Controller Class
 * Eliminates redundancy and provides common functionality
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const db = require('../models/db');
const AppConfig = require('../config/appConfig');

class BaseController {
  
  /**
   * Standard success response
   */
  static success(res, data = null, message = 'Operation successful', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Standard error response
   */
  static error(res, message = 'Operation failed', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (error && AppConfig.isDevelopment()) {
      response.error = error.message || error;
    }
    
    console.error(`❌ ${message}:`, error);
    return res.status(statusCode).json(response);
  }

  /**
   * Professional paginated response with enhanced metadata
   */
  static paginated(res, data, totalItems, page, limit, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    // Generate pagination links
    const paginationLinks = this.generatePaginationLinks(currentPage, totalPages, AppConfig.pagination.maxPaginationLinks);
    
    return res.json({
      success: true,
      message,
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems: parseInt(totalItems),
        itemsPerPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        // Professional pagination metadata
        itemRange: {
          start: totalItems > 0 ? startItem : 0,
          end: totalItems > 0 ? endItem : 0,
          total: totalItems
        },
        links: paginationLinks,
        allowedLimits: AppConfig.pagination.allowedLimits,
        // Navigation helpers
        firstPage: 1,
        lastPage: totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - (res.locals.startTime || Date.now()),
        apiVersion: AppConfig.api.version || 'v1'
      }
    });
  }

  /**
   * Professional pagination validation with enhanced error handling
   */
  static validatePagination(query) {
    // Validate page number
    let page = parseInt(query.page) || AppConfig.pagination.defaultPage;
    page = Math.max(1, page); // Ensure page is at least 1
    
    // Validate limit with allowed values
    let limit = parseInt(query.limit) || AppConfig.pagination.defaultLimit;
    
    // Check if limit is in allowed limits, if not use closest allowed value
    if (!AppConfig.pagination.allowedLimits.includes(limit)) {
      const allowedLimits = AppConfig.pagination.allowedLimits;
      limit = allowedLimits.reduce((prev, curr) => 
        Math.abs(curr - limit) < Math.abs(prev - limit) ? curr : prev
      );
    }
    
    // Ensure limit doesn't exceed maximum
    limit = Math.min(AppConfig.pagination.maxLimit, limit);
    
    const offset = (page - 1) * limit;
    
    return { 
      page, 
      limit, 
      offset,
      // Additional metadata for validation
      isValidPage: page >= 1,
      isValidLimit: AppConfig.pagination.allowedLimits.includes(limit)
    };
  }
  
  /**
   * Generate pagination links for navigation
   */
  static generatePaginationLinks(currentPage, totalPages, maxLinks = 10) {
    const links = [];
    
    if (totalPages <= maxLinks) {
      // Show all pages if total pages is less than max links
      for (let i = 1; i <= totalPages; i++) {
        links.push({
          page: i,
          isCurrent: i === currentPage,
          isDisabled: false
        });
      }
    } else {
      // Calculate start and end pages for pagination window
      const halfWindow = Math.floor(maxLinks / 2);
      let startPage = Math.max(1, currentPage - halfWindow);
      let endPage = Math.min(totalPages, currentPage + halfWindow);
      
      // Adjust if we're near the beginning or end
      if (endPage - startPage + 1 < maxLinks) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxLinks - 1);
        } else {
          startPage = Math.max(1, endPage - maxLinks + 1);
        }
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        links.push({ page: 1, isCurrent: false, isDisabled: false });
        if (startPage > 2) {
          links.push({ page: '...', isCurrent: false, isDisabled: true });
        }
      }
      
      // Add pages in window
      for (let i = startPage; i <= endPage; i++) {
        links.push({
          page: i,
          isCurrent: i === currentPage,
          isDisabled: false
        });
      }
      
      // Add last page and ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          links.push({ page: '...', isCurrent: false, isDisabled: true });
        }
        links.push({ page: totalPages, isCurrent: false, isDisabled: false });
      }
    }
    
    return links;
  }

  /**
   * Validate sort parameters
   */
  static validateSort(query, allowedFields = ['id', 'name', 'created_at']) {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : AppConfig.defaults.sortBy;
    const sortOrder = ['ASC', 'DESC'].includes(query.sortOrder?.toUpperCase()) 
      ? query.sortOrder.toUpperCase() 
      : AppConfig.defaults.sortOrder;
    
    return { sortBy, sortOrder };
  }

  /**
   * Build dynamic WHERE clause
   */
  static buildWhereClause(filters, allowedFields = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && allowedFields[key]) {
        const field = allowedFields[key];
        if (typeof field === 'string') {
          whereClause += ` AND ${field} = ?`;
          params.push(value);
        } else if (field.type === 'like') {
          whereClause += ` AND ${field.column} LIKE ?`;
          params.push(`%${value}%`);
        } else if (field.type === 'in') {
          const placeholders = Array(value.length).fill('?').join(',');
          whereClause += ` AND ${field.column} IN (${placeholders})`;
          params.push(...value);
        }
      }
    });
    
    return { whereClause, params };
  }

  /**
   * Execute query with error handling
   */
  static async executeQuery(query, params = []) {
    try {
      const [results] = await db.execute(query, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Get count for pagination
   */
  static async getCount(table, whereClause = 'WHERE 1=1', params = []) {
    const query = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
    const results = await this.executeQuery(query, params);
    return results[0]?.total || 0;
  }

  /**
   * Validate required fields
   */
  static validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data, allowedFields) {
    const sanitized = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    });
    return sanitized;
  }

  /**
   * Generate audit log entry
   */
  static async logActivity(userId, action, entityType, entityId, changes = {}, ipAddress = null) {
    try {
      const query = `
        INSERT INTO activity_log (user_id, action, entity_type, entity_id, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      await this.executeQuery(query, [
        userId,
        action,
        entityType,
        entityId,
        ipAddress
      ]);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Check if entity exists
   */
  static async exists(table, field, value) {
    const query = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const results = await this.executeQuery(query, [value]);
    return results.length > 0;
  }

  /**
   * Soft delete entity
   */
  static async softDelete(table, id, userField = 'id') {
    const query = `UPDATE ${table} SET deleted_at = NOW() WHERE ${userField} = ?`;
    const results = await this.executeQuery(query, [id]);
    return results.affectedRows > 0;
  }

  /**
   * Get entity by ID with soft delete check
   */
  static async getById(table, id, userField = 'id') {
    const query = `SELECT * FROM ${table} WHERE ${userField} = ? AND deleted_at IS NULL`;
    const results = await this.executeQuery(query, [id]);
    return results[0] || null;
  }

  /**
   * Get database connection for transactions
   */
  static async getConnection() {
    const pool = require('../models/db');
    return await pool.getConnection();
  }
}

module.exports = BaseController;
