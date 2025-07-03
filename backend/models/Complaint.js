const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  complaint_id: { type: DataTypes.STRING, primaryKey: true },
  customer_id: { type: DataTypes.STRING, allowNull: true },  // FK to Customer
  product_id: { type: DataTypes.STRING, allowNull: true },   // FK to Product
  call_type: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  symptoms: { type: DataTypes.TEXT },
  customer_available_at: { type: DataTypes.STRING },
  preferred_time_slot: { type: DataTypes.STRING },
  call_priority: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },

  // ✅ Add created_at with default value
  created_at: {
    type: DataTypes.DATE,
    allowNull:true,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'complaint',
  timestamps: false, // Keep false since you're manually defining created_at
});

module.exports = Complaint;
