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

const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/categories', getAllCategories);
router.get('/categories/:id', getSingleCategory);
router.post('/categories', isAuthenticatedUser, createCategory);
router.put('/categories/:id', isAuthenticatedUser, updateCategory);
router.delete('/categories/:id', isAuthenticatedUser, deleteCategory);

module.exports = router;