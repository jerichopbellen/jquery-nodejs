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
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Generic' // Fallback for basic form processing
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Smartphones'
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sell_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  img_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  specs: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'items'
});

module.exports = Item;