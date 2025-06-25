const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  product_type: { type: DataTypes.STRING },
  product_name: { type: DataTypes.STRING },
  model_number: { type: DataTypes.STRING },
  serial_number: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING },
  date_of_purchase: { type: DataTypes.DATE },
  warranty: { type: DataTypes.STRING }
}, {
  tableName: 'product',
  timestamps: false,
});

module.exports = Product;
