const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OperatingPincode = sequelize.define('OperatingPincode', {
  center_id: {
    type: DataTypes.STRING,
    references: {
      model: 'service_center', // table name
      key: 'center_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  pincode: { type: DataTypes.STRING },
  services: { type: DataTypes.STRING }
}, {
  tableName: 'operating_pincode',
  timestamps: false,
});

module.exports = OperatingPincode;
