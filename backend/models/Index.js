const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Stock = require('./Stock');
const Order = require('./Order');       
const OrderItem = require('./OrderItem'); 
const Brand = require('./Brand');
const Category = require('./Category');

// 1. Existing Association: 1-to-1 Item <-> Stock
Item.hasOne(Stock, { foreignKey: 'item_id', as: 'Stock', onDelete: 'CASCADE' });
Stock.belongsTo(Item, { foreignKey: 'item_id' });

// 2. New Association: 1-to-Many User -> Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 3. New Association: 1-to-Many Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 4. New Association: 1-to-Many Item -> OrderItem
Item.hasMany(OrderItem, { foreignKey: 'item_id', as: 'orderLines' });
OrderItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

// 5. New Association: 1-to-Many Brand -> Item
Brand.hasMany(Item, { foreignKey: 'brand_id', as: 'items' });
Item.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brandInfo' });

// 6. New Association: 1-to-Many Category -> Item
Category.hasMany(Item, { foreignKey: 'category_id', as: 'items' });
Item.belongsTo(Category, { foreignKey: 'category_id', as: 'categoryInfo' });
;

module.exports = {
  sequelize,
  User,
  Item,
  Stock,
  Order,
  OrderItem,
  Brand,
  Category
};