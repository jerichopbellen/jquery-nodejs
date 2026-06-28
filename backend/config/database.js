const { Sequelize } = require('sequelize');
require('dotenv').config();

// Enforce strict reliance on environmental variables
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Must read directly from .env
  process.env.DB_USER,      // Must read directly from .env
  process.env.DB_PASSWORD,  // Must read directly from .env
  {
    host: process.env.DB_HOST, // Must read directly from .env
    dialect: 'mysql',
    logging: false, 
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, 
      underscored: true 
    }
  }
);

module.exports = sequelize;