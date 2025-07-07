const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ServiceCenter = sequelize.define('ServiceCenter', {
  center_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
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
  user_id: { type: DataTypes.BIGINT } // FK to users
}, {
  tableName: 'service_center',
  timestamps: false,
});

module.exports = ServiceCenter;
