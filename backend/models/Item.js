const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sell_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // ADDED: Replaced the redundant 'img_path' column with the 'images' text column
  images: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specs: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'items',
  underscored: true, // Handles snake_case timestamps and helps with attribute naming alignment
  timestamps: true
});

module.exports = Item;