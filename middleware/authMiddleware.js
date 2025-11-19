// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { getLogin, logout: logoutHandler } = require("../models/LoginModel");

// JWT Secret - must match the one used in LoginModel.js
// Use environment variable for consistency and security
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'vmms-jwt-secret-key-2024-secure';

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.headers.authorization?.replace('Bearer ', '') ||
                 req.cookies?.token;

    console.log('🔐 Auth Middleware - Token received:', !!token);
    console.log('🔐 Auth Middleware - Authorization header:', req.header('Authorization')?.substring(0, 50) + '...');

    if (!token) {
      console.log('❌ Auth Middleware - No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    console.log('✅ Auth Middleware - Token verified successfully for user:', decoded.user_id);
    next();
  } catch (error) {
    console.log('❌ Auth Middleware - Token verification failed:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. User not authenticated.' 
      });
    }

    const userRole = req.user.role || req.user.role_name;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Login and logout handlers
const login = (req, res, next) => getLogin(req, res, next);
const logout = (req, res, next) => logoutHandler(req, res, next);

module.exports = {
  verifyToken,
  authenticateToken: verifyToken, // Alias for consistency
  requireRole,
  login,
  logout
};
