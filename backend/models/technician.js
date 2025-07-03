const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Technician = sequelize.define('Technician', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  availability_status: { type: DataTypes.BIGINT },
  assigned_center_id: { type: DataTypes.BIGINT } // FK to service_center
}, {
  tableName: 'technician',
  timestamps: false,
});

module.exports = Technician;
