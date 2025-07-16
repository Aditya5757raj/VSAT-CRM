const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ServiceCenter = sequelize.define('ServiceCenter', {
  center_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  partner_name: { type: DataTypes.STRING },
  contact_person: { type: DataTypes.STRING },
  phone_number: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  gst_number: { type: DataTypes.STRING },
  pan_number: { type: DataTypes.STRING },
  aadhar_number: { type: DataTypes.STRING },
  company_address: { type: DataTypes.STRING },
  gst_certificate: { type: DataTypes.STRING },
  pan_card_document: { type: DataTypes.STRING },
  aadhar_card_document: { type: DataTypes.STRING },
  company_reg_certificate: { type: DataTypes.STRING },
  user_id: { type: DataTypes.BIGINT }, // FK to users

  // ✅ New field: status with default value
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },

  // ✅ Manually adding createdAt with default value
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'service_center',
  timestamps: false // Sequelize won't auto-manage timestamps
});

module.exports = ServiceCenter;
