const sequelize = require('../config/db');

const User = require('./User');
const Customer = require('./Customer');
const Product = require('./Product');
const Complaint = require('./Complaint');

// 🔗 Define Associations

// Customer - Complaint (One-to-Many)
Customer.hasMany(Complaint, { foreignKey: 'customer_id' });
Complaint.belongsTo(Customer, { foreignKey: 'customer_id' });

// Product - Complaint (One-to-Many)
Product.hasMany(Complaint, { foreignKey: 'product_id' });
Complaint.belongsTo(Product, { foreignKey: 'product_id' });

// ✅ Export all models + Sequelize instance
module.exports = {
  sequelize,
  User,
  Customer,
  Product,
  Complaint
};
