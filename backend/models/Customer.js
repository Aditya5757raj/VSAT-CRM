const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
  customer_id: { type: DataTypes.STRING(20), primaryKey: true },  // 🔧 Updated to VARCHAR(20)
  full_name: { type: DataTypes.STRING },
  mobile_number: { type: DataTypes.STRING },
  flat_no: { type: DataTypes.STRING },
  street_area: { type: DataTypes.STRING },
  landmark: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  locality: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING }
}, {
  tableName: 'customer',
  timestamps: false,
});

module.exports = Customer;
