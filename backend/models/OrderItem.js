const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items', // table name in database
      key: 'item_id'
    }
  },
  quantity_ordered: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price_at_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false // Matches database snapshot tracking parameters
});

module.exports = OrderItem;