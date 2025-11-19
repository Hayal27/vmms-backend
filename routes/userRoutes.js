const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// userTenantController functionality now integrated into userController
const { verifyToken } = require('../middleware/authMiddleware');
const {  getAllRoles, getAllUsers, updateUser, deleteUser, getDepartment, changeUserStatus, getUserRoles, getUserProfile } = require('../controllers/userController.js');

// Define routes



// router.get('/roles', getAllRoles);
router.get('/users', verifyToken, (req, res) => getAllUsers(req, res));
router.get('/department', (req, res) => getDepartment(req, res));
router.get('/userrole/:user_id', verifyToken, (req, res) => getUserRoles(req, res));
router.get('/profile/:user_id', verifyToken, (req, res) => getUserProfile(req, res));

router.put('/:user_id/status', (req, res) => changeUserStatus(req, res));



router.put('/updateUser/:user_id', verifyToken, (req, res) => updateUser(req, res));
router.delete('/deleteUser/:user_id', verifyToken, (req, res) => deleteUser(req, res));

// ============================================================================
// INTEGRATED USER-TENANT ROUTES
// ============================================================================

/**
 * GET /api/users/:userId/profile
 * Get complete user profile with tenant assignments
 */
router.get('/:userId/complete-profile', verifyToken, (req, res) => 
  userController.getUserCompleteProfile(req, res)
);

/**
 * POST /api/users/:userId/switch-context
 * Switch between system and tenant contexts
 */
router.post('/:userId/switch-context', verifyToken, (req, res) => 
  userController.switchUserContext(req, res)
);

/**
 * POST /api/users/:userId/assign-tenant
 * Assign user to tenant with specific role
 */
router.post('/:userId/assign-tenant', verifyToken, (req, res) => 
  userController.assignUserToTenant(req, res)
);

/**
 * GET /api/users/:userId/dashboard
 * Get user dashboard based on current context
 */
// router.get('/:userId/dashboard', authenticateToken, (req, res) => 
//   userTenantController.getUserDashboard(req, res)
// );

/**
 * GET /api/users/:userId/permissions
 * Get unified permissions across all contexts
 */
// router.get('/:userId/permissions', authenticateToken, (req, res) => 
//   userTenantController.getUserPermissions(req, res)
// );

module.exports = router;
