const sequelize = require('../config/db');

const User = require('./User');
const Customer = require('./Customer');
const Product = require('./Product');
const Complaint = require('./Complaint');

// 🔗 Associations
Customer.hasMany(Complaint, { foreignKey: 'customer_id' });
Complaint.belongsTo(Customer, { foreignKey: 'customer_id' });

Product.hasMany(Complaint, { foreignKey: 'product_id' });
Complaint.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
  sequelize,
  User,
  Customer,
  Product,
  Complaint
};
