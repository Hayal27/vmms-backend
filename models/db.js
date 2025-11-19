/**
 * Database Configuration for VMMS
 * MySQL2 with Promise Support for Enterprise Operations
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const mysql = require('mysql2/promise');
const AppConfig = require('../config/appConfig');

// Database configuration from centralized config
const dbConfig = {
  ...AppConfig.database,
  waitForConnections: true,
  queueLimit: 0
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database test query successful:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MySQL:', error);
    console.error('❌ Connection details:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    return false;
  }
}

// Initialize database connection
testConnection();

// Export pool for use in controllers
module.exports = pool;
