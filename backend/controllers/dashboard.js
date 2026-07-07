// controllers/dashboard.js additions — rewritten for your actual Sequelize
// models (require('../models') -> models/index.js) and real schema:
//
//   Order:      order_id, user_id, total_amount, status ENUM('processing',
//               'shipped','delivered','cancelled'), created_at (underscored)
//   OrderItem:  order_item_id, order_id, item_id, quantity_ordered,
//               price_at_purchase  (table: order_items, no timestamps)
//   Item:       assumed to have a `name` column — change below if different
//   User:       role ('admin' | 'customer')  (confirmed from phpMyAdmin)
//
// NOTE: your Order.status enum has no 'pending' or 'completed' value, only
// processing / shipped / delivered / cancelled. So:
//   - "totalRevenue" and the sales charts treat 'delivered' as the
//     completed/paid state (adjust if you use a different status for that).
//   - orderStatus() below returns pending: 0 always, and completed is an
//     alias for delivered, just so the existing frontend cards don't break.
//     Better long-term fix: drop the Pending/Completed cards from the
//     dashboard and just show the 4 real statuses — say the word and I'll
//     update admin-dashboard.html to match.

const { Sequelize, Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Item, User } = require('../models');

exports.dashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Order.sum('total_amount', { where: { status: 'delivered' } });
    const totalUsers = await User.count();
    const totalProducts = await Item.count();
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });

    res.json({
      totalRevenue: totalRevenue || 0,
      totalUsers,
      totalProducts,
      totalCustomers,
      totalAdmins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard stats.' });
  }
};

exports.orderStatus = async (req, res) => {
  try {
    const total = await Order.count();
    const processing = await Order.count({ where: { status: 'processing' } });
    const shipped = await Order.count({ where: { status: 'shipped' } });
    const delivered = await Order.count({ where: { status: 'delivered' } });
    const cancelled = await Order.count({ where: { status: 'cancelled' } });

    res.json({
      total,
      processing,
      shipped,
      delivered,
      cancelled
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load order status overview.' });
  }
};

// Daily totals for a given date range (defaults to the last 30 days)
exports.salesPerformance = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      startDate = start.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }

    const rows = await Order.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'day'],
        [fn('SUM', col('total_amount')), 'total']
      ],
      where: {
        status: 'delivered',
        created_at: { [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`] }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    res.json({
      labels: rows.map((r) => r.day),
      values: rows.map((r) => Number(r.total))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load sales performance chart.' });
  }
};

// Monthly totals for the current year
exports.yearlyRevenue = async (req, res) => {
  try {
    const rows = await Order.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
        [fn('SUM', col('total_amount')), 'total']
      ],
      where: {
        status: 'delivered'
      },
      group: [fn('DATE_FORMAT', col('created_at'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    });

    res.json({
      labels: rows.map((r) => r.month),
      values: rows.map((r) => Number(r.total))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load yearly revenue chart.' });
  }
};

// Units sold per product (top 20), used for the pie chart + legend
exports.productShare = async (req, res) => {
  try {
    const rows = await OrderItem.findAll({
      attributes: [
        [col('item.description'), 'name'],
        [fn('SUM', col('OrderItem.quantity_ordered')), 'units']
      ],
      include: [
        { model: Item, as: 'item', attributes: [] },
        { model: Order, as: 'order', attributes: [], where: { status: 'delivered' } }
      ],
      group: ['item.item_id', 'item.description'],
      order: [[fn('SUM', col('OrderItem.quantity_ordered')), 'DESC']],
      limit: 20,
      raw: true
    });

    res.json({
      labels: rows.map((r) => r.name),
      values: rows.map((r) => Number(r.units))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load product share chart.' });
  }
};