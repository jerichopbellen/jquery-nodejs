const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Token = sequelize.define('Token', {
  token_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  token_value: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'tokens',
  updatedAt: false // Disables update checks since session tokens are never modified
});

module.exports = Token;