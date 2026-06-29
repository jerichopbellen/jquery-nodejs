const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stock = sequelize.define('Stock', {
  stock_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'stocks',
  underscored: true,
  timestamps: true
});

module.exports = Stock;