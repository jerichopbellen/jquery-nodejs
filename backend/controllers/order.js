const { User, Order, OrderItem, Item, sequelize } = require('../models');
const sendEmail = require('../utils/sendEmail');
const generateReceiptPDF = require('../services/pdfGenerator');
const getEstimatedDelivery = require('../services/deliveryEstimate');

function generateTrackingNumber() {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TCHNXS-${Date.now().toString().slice(-6)}-${rand}`;
}

function formatOrder(order, includeCustomer = false) {
  const base = {
    orderId: order.order_id,
    date: order.createdAt,
    status: order.status,
    totalAmount: Number(order.total_amount || 0),
    shippingAddress: order.shipping_address,
    trackingNumber: order.tracking_number || '',
    shippedAt: order.shipped_at || null,
    items: (order.items || []).map((line) => ({
      orderItemId: line.order_item_id,
      itemId: line.item_id,
      description: line.item?.description || 'Item',
      image: line.item?.images ? JSON.parse(line.item.images || '[]')[0] : '',
      quantity: line.quantity_ordered,
      price: Number(line.price_at_purchase || 0)
    }))
  };

  if (order.shipped_at) {
    base.estimatedDelivery = getEstimatedDelivery(order.shipped_at);
  }

  if (includeCustomer && order.user) {
    base.customerName = order.user.name;
    base.customerEmail = order.user.email;
  }

  return base;
}

exports.createOrder = async (req, res) => {
  const { cart, shipping_address } = req.body;
  const userId = req.user?.user_id || req.user?.id;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  if (!shipping_address) {
    return res.status(400).json({ success: false, message: 'Shipping address is required' });
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { user_id: userId, is_active: true },
      transaction: t
    });

    if (!user) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'User profile not found or inactive' });
    }

    const total_amount = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const newOrder = await Order.create({
      user_id: userId,
      total_amount,
      shipping_address,
      status: 'processing'
    }, { transaction: t });

    const orderItemsData = cart.map((item) => ({
      order_id: newOrder.order_id,
      item_id: item.item_id || item.id,
      quantity_ordered: item.quantity,
      price_at_purchase: item.price || 0
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    await t.commit();
try {
      const itemsHtml = cart.map(item => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #eee;">${item.name || item.description || 'Item'}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right;">PHP ${Number(item.price).toFixed(2)}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right;">PHP ${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; color:#333; background:#fff;">
          <div style="background:#1a1a2e; padding:24px; text-align:center;">
            <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:1px;">TECHNEXUS SHOP</h1>
          </div>

          <div style="padding:28px 32px;">
            <p style="font-size:16px; margin-top:0;">Hi ${user.name},</p>

            <p style="font-size:15px; line-height:1.6;">
              Thank you for your order! We've received it and it's now being prepared for processing.
            </p>

            <div style="margin:22px 0; padding:16px 20px; background:#f9f9f9; border-left:4px solid #3498db; border-radius:4px;">
              <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${newOrder.order_id}</p>
              <p style="margin:0;">
                <strong>Status:</strong>
                <span style="background:#f1c40f; color:#fff; padding:3px 12px; border-radius:12px; font-size:13px; font-weight:bold;">
                  PROCESSING
                </span>
              </p>
            </div>

            <h3 style="font-size:15px; margin-bottom:10px; color:#1a1a2e;">Order Summary</h3>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <thead>
                <tr>
                  <th style="text-align:left; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Item</th>
                  <th style="text-align:center; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Qty</th>
                  <th style="text-align:right; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Price</th>
                  <th style="text-align:right; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align:right; margin-top:16px; padding-top:12px; border-top:2px solid #1a1a2e;">
              <span style="font-size:17px; font-weight:bold;">Total: PHP ${total_amount.toFixed(2)}</span>
            </div>

            <div style="margin-top:30px; padding:20px; background:#f4f4f9; border-radius:6px; text-align:center;">
              <p style="font-size:16px; font-weight:bold; margin:0 0 6px; color:#1a1a2e;">Thank you for shopping with us!</p>
              <p style="font-size:13px; color:#777; margin:0;">We appreciate your trust in TechNexus Shop.</p>
            </div>

            <p style="font-size:13px; color:#888; margin-top:24px;">
              If you have any questions about your order, feel free to reply to this email or contact our support team.
            </p>
          </div>

          <div style="text-align:center; padding:18px; background:#1a1a2e; font-size:12px; color:#ccc;">
            &copy; ${new Date().getFullYear()} TechNexus Shop. All rights reserved.
          </div>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Order Success',
        message: `Your order #${newOrder.order_id} has been successfully placed.`,
        html
      });
    } catch (emailErr) {
      console.warn("Email alert failed to send:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction complete',
      order_id: newOrder.order_id
    });

  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Sequelize Checkout Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['item_id', 'description', 'images']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      rows: orders.map(formatOrder)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrderDetails = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { order_id: id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['item_id', 'description', 'images']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: formatOrder(order) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { order_id: id, user_id: userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'processing') {
      return res.status(400).json({ success: false, message: 'Only processing orders can be cancelled' });
    }

    await order.update({ status: 'cancelled' });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: formatOrder(order)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin ──────────────────────────────────────────────────────────────

const ALLOWED_ADMIN_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['item_id', 'description', 'images']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      rows: orders.map((order) => formatOrder(order, true))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${ALLOWED_ADMIN_STATUSES.join(', ')}`
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Item, as: 'item', attributes: ['item_id', 'description', 'images'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updateFields = { status };
    if (status === 'shipped') {
      updateFields.shipped_at = new Date();
      if (!order.tracking_number) {
        updateFields.tracking_number = generateTrackingNumber();
      }
    }

    await order.update(updateFields);

    const formatted = formatOrder(order, true);
    if (status === 'shipped' && updateFields.shipped_at) {
      formatted.estimatedDelivery = getEstimatedDelivery(updateFields.shipped_at);
    }
    if (updateFields.tracking_number) {
      formatted.trackingNumber = updateFields.tracking_number;
    }

    const statusMessages = {
      processing: 'Your order is currently being processed and prepared for shipment.',
      shipped: 'Your order is on its way!',
      delivered: 'Your order has been delivered. We hope you enjoy your purchase!',
      cancelled: 'Your order has been cancelled. If you believe this was a mistake, please contact our support team.'
    };

    const statusColors = {
      processing: '#f1c40f',
      shipped: '#e67e22',
      delivered: '#2ecc71',
      cancelled: '#e74c3c'
    };

    try {
      const pdfPath = await generateReceiptPDF(formatted);

      const itemsHtml = formatted.items.map(item => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #eee;">${item.description}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right;">PHP ${item.price.toFixed(2)}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right;">PHP ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; color:#333; background:#fff;">
          <div style="background:#1a1a2e; padding:24px; text-align:center;">
            <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:1px;">TECHNEXUS SHOP</h1>
          </div>

          <div style="padding:28px 32px;">
            <p style="font-size:16px; margin-top:0;">Hi ${formatted.customerName},</p>

            <p style="font-size:15px; line-height:1.6;">${statusMessages[status] || 'Your order status has been updated.'}</p>

            <div style="margin:22px 0; padding:16px 20px; background:#f9f9f9; border-left:4px solid ${statusColors[status] || '#95a5a6'}; border-radius:4px;">
              <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${formatted.orderId}</p>
              <p style="margin:0 0 8px;">
                <strong>Status:</strong>
                <span style="background:${statusColors[status] || '#95a5a6'}; color:#fff; padding:3px 12px; border-radius:12px; font-size:13px; font-weight:bold;">
                  ${status.toUpperCase()}
                </span>
              </p>
              ${formatted.estimatedDelivery ? `<p style="margin:0 0 8px;"><strong>Estimated Delivery:</strong> ${formatted.estimatedDelivery}</p>` : ''}
              ${formatted.trackingNumber ? `<p style="margin:0;"><strong>Tracking Number:</strong> ${formatted.trackingNumber}</p>` : ''}
            </div>

            <h3 style="font-size:15px; margin-bottom:10px; color:#1a1a2e;">Order Summary</h3>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <thead>
                <tr>
                  <th style="text-align:left; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Item</th>
                  <th style="text-align:center; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Qty</th>
                  <th style="text-align:right; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Price</th>
                  <th style="text-align:right; border-bottom:2px solid #1a1a2e; padding-bottom:8px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align:right; margin-top:16px; padding-top:12px; border-top:2px solid #1a1a2e;">
              <span style="font-size:17px; font-weight:bold;">Total: PHP ${formatted.totalAmount.toFixed(2)}</span>
            </div>

            <p style="font-size:14px; color:#555; margin-top:28px;">
              A detailed PDF receipt is attached to this email for your records.
            </p>

            <div style="margin-top:30px; padding:20px; background:#f4f4f9; border-radius:6px; text-align:center;">
              <p style="font-size:16px; font-weight:bold; margin:0 0 6px; color:#1a1a2e;">Thank you for shopping with us!</p>
              <p style="font-size:13px; color:#777; margin:0;">We appreciate your trust in TechNexus Shop.</p>
            </div>

            <p style="font-size:13px; color:#888; margin-top:24px;">
              If you have any questions about your order, feel free to reply to this email or contact our support team.
            </p>
          </div>

          <div style="text-align:center; padding:18px; background:#1a1a2e; font-size:12px; color:#ccc;">
            &copy; ${new Date().getFullYear()} TechNexus Shop. All rights reserved.
          </div>
        </div>
      `;

      await sendEmail({
        email: formatted.customerEmail,
        subject: `Order #${formatted.orderId} - ${status.toUpperCase()}`,
        message: statusMessages[status] || 'Your order status has been updated.',
        html,
        attachments: [{ filename: `receipt-${formatted.orderId}.pdf`, path: pdfPath }],
      });
    } catch (emailErr) {
      console.warn('Order status email failed to send:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await OrderItem.destroy({
      where: { order_id: id },
      transaction: t
    });

    await order.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error('Delete Order Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};