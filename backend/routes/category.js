const express = require('express');
const router = express.Router();

// Destructure cleanly from controller file
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category'); 

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/categories', getAllCategories);
router.get('/categories/:id', getSingleCategory);
router.post('/categories', isAuthenticatedUser, authorizeRoles('admin'), createCategory);
router.put('/categories/:id', isAuthenticatedUser, authorizeRoles('admin'), updateCategory);
router.delete('/categories/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

module.exports = router;