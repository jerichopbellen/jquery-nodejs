const express = require('express');

const router = express.Router();

const {
  dashboardStats,
  orderStatus,
  salesPerformance,
  yearlyRevenue,
  productShare
} = require('../controllers/dashboard');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/stats', isAuthenticatedUser, authorizeRoles('admin'), dashboardStats);
router.get('/order-status', isAuthenticatedUser, authorizeRoles('admin'), orderStatus);
router.get('/sales-performance', isAuthenticatedUser, authorizeRoles('admin'), salesPerformance);
router.get('/yearly-revenue', isAuthenticatedUser, authorizeRoles('admin'), yearlyRevenue);
router.get('/product-share', isAuthenticatedUser, authorizeRoles('admin'), productShare);

module.exports = router;