const express = require('express');
const router = express.Router();

// Destructure cleanly from controller file
const {
  getAllBrands,
  getSingleBrand,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brand'); 

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/brands', getAllBrands);
router.get('/brands/:id', getSingleBrand);
router.post('/brands', isAuthenticatedUser, authorizeRoles('admin'), createBrand);
router.put('/brands/:id', isAuthenticatedUser, authorizeRoles('admin'), updateBrand);
router.delete('/brands/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteBrand);

module.exports = router;