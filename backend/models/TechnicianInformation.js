const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TechnicianInformation = sequelize.define('TechnicianInformation', {
  engineer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  eng_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: DataTypes.STRING,
  contact: DataTypes.STRING,
  qualification: DataTypes.STRING,
  product: DataTypes.STRING,
  operating_pincode: DataTypes.STRING,
  pan_number: DataTypes.STRING,
  aadhar_number: DataTypes.STRING,
  driving_license_number: DataTypes.STRING,
  pan_card: DataTypes.STRING,
  aadhar_card: DataTypes.STRING,
  driving_licence: DataTypes.STRING,
status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  service_center_id: {
    type: DataTypes.STRING,
    allowNull: true  // Change to `false` if you want to enforce it
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'technician_information',
  timestamps: false
});

module.exports = TechnicianInformation;
