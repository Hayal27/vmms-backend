
const db = require('./db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

// Secret key (use same as authMiddleware for consistency)
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; 

// Function to handle login
const getLogin = async (req, res) => {
    // Debug logging
    console.log('🔍 LOGIN REQUEST DEBUG:');
    console.log('   Headers:', req.headers);
    console.log('   Body:', req.body);
    console.log('   Method:', req.method);
    console.log('   URL:', req.url);
    
    const { user_name, pass } = req.body;
    
    console.log('   Extracted user_name:', user_name);
    console.log('   Extracted pass:', pass ? '[PROVIDED]' : '[MISSING]');
    
    // Validate that pass is provided
    if (!pass) {
        console.log('❌ Password validation failed - no password provided');
        return res.status(400).json({ success: false, message: 'Password is required' });
    }
    
    if (!user_name) {
        console.log('❌ Username validation failed - no username provided');
        return res.status(400).json({ success: false, message: 'Username is required' });
    }
    
    // Updated query: join employees table using employee_id present in users table 
    const query = `
      SELECT u.*, e.*
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      WHERE u.user_name = ?
    `;
    
    try {
        const [results] = await db.execute(query, [user_name]);
        
        console.log('🔍 Database query results:', results.length, 'users found');
        
        if (results.length === 0) {
            console.log('❌ User not found in database');
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];
        console.log('✅ User found:', {
            user_id: user.user_id,
            user_name: user.user_name,
            status: user.status,
            role_id: user.role_id,
            hasPassword: !!user.password
        });

        // Validate that user object has the password hash
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'User password not set' });
        }

        console.log('🔍 Comparing passwords...');
        const passwordMatch = await bcrypt.compare(pass, user.password);
        console.log('🔍 Password match result:', passwordMatch);
        console.log('🔍 User status:', user.status);
        
        if (passwordMatch && user.status === 'active') {
            console.log('✅ Authentication successful!');
            
            // Update user online status
            try {
                await db.execute('UPDATE users SET online_flag=? WHERE user_id=?', [1, user.user_id]);
            } catch (updateError) {
                console.error('Error updating online status:', updateError);
                // Don't fail login for this error, just log it
            }

            // Generate a JWT token with a 400h expiration
            const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, JWT_SECRET_KEY, { expiresIn: '400h' });

            console.log('✅ Sending successful response');
            return res.status(200).json({ success: true, token, user });
        } else {
            console.log('❌ Authentication failed - password mismatch or inactive user');
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        
    } catch (error) {
        console.error('❌ Database error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Function to handle logout
const logout = async (req, res) => {
    const id = req.params.user_id;

    try {
        // Update user's online_flag to 0 to indicate logout
        const [results] = await db.execute('UPDATE users SET online_flag=? WHERE user_id=?', [0, id]);
        console.log('Logout status updated successfully', results);
        return res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error updating logout status:', error);
        return res.status(500).send({ message: "Error updating logout status", error: error.message });
    }
};

module.exports = { getLogin, logout };
