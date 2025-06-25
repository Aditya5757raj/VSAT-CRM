const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  complaint_id: { type: DataTypes.STRING, primaryKey: true },
  customer_id: { type: DataTypes.STRING, allowNull: false },  // FK to Customer
  product_id: { type: DataTypes.STRING, allowNull: false },   // FK to Product
  call_type: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  symptoms: { type: DataTypes.TEXT },
  customer_available_at: { type: DataTypes.STRING },
  preferred_time_slot: { type: DataTypes.STRING },
  call_priority: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
}, {
  tableName: 'complaint',
  timestamps: false,
});

module.exports = Complaint;
