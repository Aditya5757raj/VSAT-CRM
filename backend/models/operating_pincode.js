const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OperatingPincode = sequelize.define('OperatingPincode', {
  center_id: { type: DataTypes.BIGINT }, // FK to service_center
  pincode: { type: DataTypes.STRING },
  services: { type: DataTypes.STRING }
}, {
  tableName: 'operating_pincode',
  timestamps: false,
});

module.exports = OperatingPincode;
