const express = require('express');

const router = express.Router();

const { createOrder, getMyOrders, getMyOrderDetails, cancelMyOrder } = require('../controllers/order')
const { isAuthenticatedUser } = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)
router.get('/my-orders', isAuthenticatedUser, getMyOrders)
router.get('/my-orders/:id', isAuthenticatedUser, getMyOrderDetails)
router.patch('/my-orders/:id/cancel', isAuthenticatedUser, cancelMyOrder)

module.exports = router;

