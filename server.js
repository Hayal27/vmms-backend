
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
require('dotenv').config();

// Importing Routes
const userRoutes = require("./routes/userRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const menuPermissionRoutes = require("./routes/menuPermissions.js");
const menuRoutes = require("./routes/menuRoutes.js");
const systemConfigRoutes = require("./routes/systemConfigRoutes.js");
const tenantRoutes = require("./routes/tenantRoutes.js");
const tenantUsersRoutes = require("./routes/tenantUsersRoutes.js");
const materialRoutes = require("./routes/materialRoutes.js");
const materialTenantRoutes = require("./routes/materialTenantRoutes.js");
const gustMaterialRoutes = require("./routes/gustMaterialRoutes.js");
const approvalRoutes = require("./routes/approvalRoutes.js");
const configRoutes = require("./routes/configRoutes.js");
const dynamicConfigRoutes = require("./routes/dynamicConfigRoutes.js");
const visitorRoutes = require("./routes/visitorRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const gatePassRoutes = require("./routes/gatePassRoutes.js");

// Importing Middleware
const authMiddleware = require("./middleware/authMiddleware.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const AppConfig = require('./config/appConfig');

const app = express();
const PORT = AppConfig.server.port;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || "http://localhost:3000"] 
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
};
app.use(cors(corsOptions));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "vmms-secure-session-key-2024",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  }
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Enable cookie parsing for JWT tokens

// Static Files Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Logging Middleware
app.use(loggingMiddleware);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/menu-permissions", menuPermissionRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/config", systemConfigRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/tenants", require('./routes/tenantAdminRoutes')); // Tenant administration routes
app.use("/api/tenant-users", tenantUsersRoutes); // Centralized tenant users
app.use("/api/materials", materialRoutes);
app.use("/api/materials-tenant", materialTenantRoutes);
app.use("/api/materials/gust", gustMaterialRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/system", configRoutes);
app.use("/api/dynamic-config", dynamicConfigRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/gate-pass", gatePassRoutes);

// Direct API Routes (for frontend compatibility)
app.use("/api", userRoutes); // This allows /api/userrole/1 and /api/profile/1
app.use("/api", employeeRoutes); // This allows /api/employee-statistics, /api/recent-activities, /api/employees

// Authentication Routes
app.post("/api/auth/login", authMiddleware.login);
app.post("/api/auth/logout/:user_id", authMiddleware.logout);
app.post("/login", authMiddleware.login); // Legacy route
app.put("/logout/:user_id", authMiddleware.logout); // Legacy route

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!", error: err.message });
});

// Start Server and Listen on All Network Interfaces
app.listen(PORT, AppConfig.server.host, () => {
  console.log(`🚀 VMMS Server running on http://${AppConfig.server.host}:${PORT}`);
  console.log(`📊 Environment: ${AppConfig.server.environment}`);
  console.log(`🏢 Organization: ${AppConfig.organization.name}`);
});
