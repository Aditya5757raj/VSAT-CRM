const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TechnicianPincode = sequelize.define('TechnicianPincode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  engineer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'technician_information',
      key: 'engineer_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'technician_pincode',
  timestamps: false
});

module.exports = TechnicianPincode;
