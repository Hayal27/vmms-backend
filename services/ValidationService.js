/**
 * Validation Service
 * Centralized validation logic for all controllers
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const AppConfig = require('../config/appConfig');

class ValidationService {
  
  /**
   * Validate email format
   */
  static validateEmail(email) {
    if (!email) return { valid: false, message: 'Email is required' };
    
    const pattern = AppConfig.validation.email.pattern;
    if (!pattern.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }
    
    return { valid: true };
  }

  /**
   * Validate Ethiopian phone number
   */
  static validatePhone(phone) {
    if (!phone && AppConfig.validation.phone.required) {
      return { valid: false, message: 'Phone number is required' };
    }
    
    if (phone) {
      const pattern = AppConfig.validation.phone.pattern;
      if (!pattern.test(phone)) {
        return { valid: false, message: 'Invalid Ethiopian phone number format. Use +251XXXXXXXXX or 0XXXXXXXXX' };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const rules = AppConfig.validation.password;
    
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < rules.minLength) {
      return { valid: false, message: `Password must be at least ${rules.minLength} characters long` };
    }
    
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (rules.requireNumbers && !/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
  }

  /**
   * Validate user input data
   */
  static validateUserData(data, isUpdate = false) {
    const errors = [];
    
    // Email validation
    if (data.email || !isUpdate) {
      const emailValidation = this.validateEmail(data.email);
      if (!emailValidation.valid) {
        errors.push(emailValidation.message);
      }
    }
    
    // Phone validation
    if (data.phone || !isUpdate) {
      const phoneValidation = this.validatePhone(data.phone);
      if (!phoneValidation.valid) {
        errors.push(phoneValidation.message);
      }
    }
    
    // Password validation (only for new users or password changes)
    if (data.password) {
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        errors.push(passwordValidation.message);
      }
    }
    
    // Name validation
    if (data.fname && data.fname.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    
    if (data.lname && data.lname.length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate ID parameters
   */
  static validateId(id, fieldName = 'ID') {
    if (!id) {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { valid: false, message: `${fieldName} must be a positive number` };
    }
    
    return { valid: true, id: numericId };
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(
      AppConfig.pagination.maxLimit,
      Math.max(1, parseInt(query.limit) || AppConfig.pagination.defaultLimit)
    );
    
    return { page, limit };
  }

  /**
   * Validate sort parameters
   */
  static validateSortParams(query, allowedFields = []) {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(query.sortOrder?.toUpperCase()) 
      ? query.sortOrder.toUpperCase() 
      : 'DESC';
    
    return { sortBy, sortOrder };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str, maxLength = 255) {
    if (!str) return '';
    
    return str
      .toString()
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Basic XSS prevention
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file) {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    // Check file size
    if (file.size > AppConfig.upload.maxSize) {
      const maxSizeMB = AppConfig.upload.maxSize / (1024 * 1024);
      return { valid: false, message: `File size exceeds ${maxSizeMB}MB limit` };
    }
    
    // Check file type
    if (!AppConfig.upload.allowedTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        message: `File type not allowed. Allowed types: ${AppConfig.upload.allowedTypes.join(', ')}` 
      };
    }
    
    return { valid: true };
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate, endDate) {
    const errors = [];
    
    if (startDate && isNaN(Date.parse(startDate))) {
      errors.push('Invalid start date format');
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      errors.push('Invalid end date format');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push('Start date cannot be after end date');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationService;
