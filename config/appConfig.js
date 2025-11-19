/**
 * Centralized Application Configuration
 * Single source of truth for all VMMS configurations
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

require('dotenv').config();

const AppConfig = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vmms',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    charset: 'utf8mb4',
    timezone: '+00:00'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Security Configuration
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'vmms-secure-session-key-2024',
    jwtSecret: process.env.JWT_SECRET || 'vmms-jwt-secret-key-2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
  },

  // Professional Pagination & Limits Configuration
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 5,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 50,
    defaultPage: 1,
    allowedLimits: [5, 10, 15, 20, 25, 50], // Standard page sizes
    showPageInfo: true,
    showItemRange: true,
    maxPaginationLinks: 10
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    avatarPath: process.env.AVATAR_PATH || './uploads/avatars'
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@vmms.com'
  },

  // QR Code Configuration
  qrCode: {
    size: parseInt(process.env.QR_CODE_SIZE) || 200,
    margin: parseInt(process.env.QR_CODE_MARGIN) || 4,
    errorCorrection: process.env.QR_CODE_ERROR_CORRECTION || 'M'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/vmms.log'
  },

  // Ethiopian IT Park Specific
  organization: {
    name: process.env.ORGANIZATION_NAME || 'Ethiopian IT Park Corporation',
    code: process.env.ORGANIZATION_CODE || 'EITP',
    timezone: process.env.DEFAULT_TIMEZONE || 'Africa/Addis_Ababa',
    currency: process.env.DEFAULT_CURRENCY || 'ETB',
    language: process.env.DEFAULT_LANGUAGE || 'en'
  },

  // Tenant Configuration
  tenants: {
    businessTypes: [
      'Manufacturing',
      'Technology',
      'Software Development',
      'AI & Machine Learning',
      'Financial Technology',
      'Media & Entertainment Technology',
      'Software Testing & Quality Assurance',
      'Cloud Infrastructure & Hosting',
      'Incubation & Startup Support',
      'Research & Development',
      'Business Process Outsourcing',
      'IT Consulting Services',
      'Mobile App Development',
      'Cybersecurity Services',
      'Digital Marketing',
      'E-commerce Platforms',
      'EdTech Solutions'
    ],
    zones: [
      'Manufacturing Zone',
      'Technology Zone',
      'Innovation Zone',
      'Research Zone',
      'Startup Zone',
      'Enterprise Zone'
    ],
    categories: [
      'Manufacturing',
      'Technology',
      'Software Development',
      'AI & Machine Learning',
      'Financial Technology',
      'Media & Entertainment',
      'Quality Assurance',
      'Research & Development',
      'Startup Incubation',
      'Enterprise Solutions'
    ]
  },

  // Feature Flags
  features: {
    materialManagement: process.env.ENABLE_MATERIAL_MANAGEMENT === 'true',
    visitorManagement: process.env.ENABLE_VISITOR_MANAGEMENT === 'true',
    tenantManagement: process.env.ENABLE_TENANT_MANAGEMENT === 'true',
    qrScanning: process.env.ENABLE_QR_SCANNING === 'true',
    realTimeNotifications: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true',
    advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
    automatedWorkflows: process.env.ENABLE_AUTOMATED_WORKFLOWS === 'true'
  },

  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    basePath: process.env.API_BASE_PATH || '/api',
    docsEnabled: process.env.API_DOCS_ENABLED === 'true',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    phone: {
      pattern: /^(\+251|0)[0-9]{9}$/, // Ethiopian phone format
      required: true
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: true
    }
  },

  // Default Values
  defaults: {
    userStatus: '1', // Active
    roleId: 2, // Default role for new users
    pageSize: 25,
    sortOrder: 'DESC',
    sortBy: 'created_at'
  }
};

// Helper methods
AppConfig.get = (path, defaultValue = null) => {
  const keys = path.split('.');
  let value = AppConfig;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

AppConfig.isDevelopment = () => AppConfig.server.environment === 'development';
AppConfig.isProduction = () => AppConfig.server.environment === 'production';

module.exports = AppConfig;
