const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('processing', 'shipped', 'delivered'),
    allowNull: false,
    defaultValue: 'processing'
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'orders',
  underscored: true, 
  timestamps: true
});

module.exports = Order;