const { Sequelize, Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Item, User } = require('../models');

exports.dashboardStats = async (req, res) => {
  try {
    const totalRevenueResult = await OrderItem.findOne({
      attributes: [
        [fn('SUM', literal('quantity_ordered * price_at_purchase')), 'total']
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: { status: 'delivered' }
      }],
      raw: true
    });

    const totalRevenue = totalRevenueResult ? Number(totalRevenueResult.total) : 0;
    const totalUsers = await User.count();
    const totalProducts = await Item.count();
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });

    res.json({
      totalRevenue,
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

    const rows = await OrderItem.findAll({
      attributes: [
        [fn('DATE', col('order.created_at')), 'day'],
        [fn('SUM', literal('quantity_ordered * price_at_purchase')), 'total']
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: 'delivered',
          created_at: { [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`] }
        }
      }],
      group: [fn('DATE', col('order.created_at'))],
      order: [[fn('DATE', col('order.created_at')), 'ASC']],
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
    const rows = await OrderItem.findAll({
      attributes: [
        [fn('YEAR', col('order.created_at')), 'year'],
        [fn('SUM', literal('quantity_ordered * price_at_purchase')), 'total']
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: { status: 'delivered' }
      }],
      group: [fn('YEAR', col('order.created_at'))],
      order: [[fn('YEAR', col('order.created_at')), 'ASC']],
      raw: true
    });

    res.json({
      labels: rows.map((r) => r.year),
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