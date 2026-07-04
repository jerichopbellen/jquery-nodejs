const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
  adminUpdateUser,
  updateUserStatus,
  getMyProfile,
  updateMyProfile
} = require('../controllers/user');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const upload = require('../utils/multer');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', isAuthenticatedUser, getMyProfile);
router.put('/profile', isAuthenticatedUser, upload.single('image'), updateMyProfile);

// Admin user management endpoints used by frontend/js/admin/users.js
router.get('/users', isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);                 
router.put('/users/:id', isAuthenticatedUser, authorizeRoles('admin'), adminUpdateUser);         
router.patch('/users/:id/status', isAuthenticatedUser, authorizeRoles('admin'), updateUserStatus);

module.exports = router;