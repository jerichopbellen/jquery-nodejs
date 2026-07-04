const express = require('express');

const router = express.Router();

const { getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/order');

// NOTE: assumes authorizeRoles exists alongside isAuthenticatedUser in your
// middlewares/auth.js — adjust the import if your role-check middleware
// has a different name.
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.patch('/admin/orders/:id/status', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/admin/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;

/**
 * Mount alongside your existing order routes, e.g.:
 *   const orderRoutes = require('./routes/order');
 *   const adminOrderRoutes = require('./routes/adminOrder');
 *   app.use('/api/v1', orderRoutes);
 *   app.use('/api/v1', adminOrderRoutes);
 *
 * This gives you: GET /api/v1/admin/orders, PATCH /api/v1/admin/orders/:id/status,
 * DELETE /api/v1/admin/orders/:id
 */