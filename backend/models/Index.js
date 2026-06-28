const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Stock = require('./Stock');
const Token = require('./Token');

// 1-to-1 Association: Item <-> Stock
Item.hasOne(Stock, { foreignKey: 'item_id', as: 'Stock', onDelete: 'CASCADE' });
Stock.belongsTo(Item, { foreignKey: 'item_id' });

// 1-to-Many Association: User <-> Tokens
User.hasMany(Token, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Item,
  Stock,
  Token
};