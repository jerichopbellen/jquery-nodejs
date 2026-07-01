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

const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/brands', getAllBrands);
router.get('/brands/:id', getSingleBrand);
router.post('/brands', isAuthenticatedUser, createBrand);
router.put('/brands/:id', isAuthenticatedUser, updateBrand);
router.delete('/brands/:id', isAuthenticatedUser, deleteBrand);

module.exports = router;