const { User, Order, OrderItem, sequelize } = require('../models');
const sendEmail = require('../utils/sendEmail');

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
    // 3. Find the user profile to get their email address
    const user = await User.findOne({
      where: { user_id: userId, is_active: true },
      transaction: t
    });

    if (!user) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'User profile not found or inactive' });
    }

    // 4. Calculate total amount dynamically from the cart array items
    const total_amount = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 
      0
    );

    // 5. Create the primary order record
    const newOrder = await Order.create({
      user_id: userId,
      total_amount,
      shipping_address,
      status: 'processing'
    }, { transaction: t });

    // 6. Bulk map cart items into fields expected by the order_items table schema
    const orderItemsData = cart.map((item) => ({
      order_id: newOrder.order_id,
      item_id: item.item_id || item.id, // safe fallback for item identifiers
      quantity_ordered: item.quantity,
      price_at_purchase: item.price || 0
    }));

    // 7. Bulk insert all item lines in one transaction query (much faster than loops!)
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // 8. Commit transaction if all database writes succeed
    await t.commit();

    // 9. Send email notification out outside of the database execution context
    try {
      await sendEmail({
        email: user.email,
        subject: 'Order Success',
        message: `Your order #${newOrder.order_id} has been successfully placed.`
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
    // 10. Automatically rollback all database statements if an error occurs
    if (!t.finished) await t.rollback();
    console.error("Sequelize Checkout Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};