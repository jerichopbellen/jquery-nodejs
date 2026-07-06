const express = require('express');

const router = express.Router();

const { getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/order');

const { isAuthenticatedUser } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.patch('/admin/orders/:id/status', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/admin/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
