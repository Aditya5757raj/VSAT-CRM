const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ComplaintTransfer = sequelize.define('ComplaintTransfer', {
  transfer_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  complaint_id: { type: DataTypes.BIGINT }, // FK to Complaint
  form_center_username: { type: DataTypes.STRING },
  to_center_username: { type: DataTypes.STRING },
  transfer_reason: { type: DataTypes.STRING },
  additional_notes: { type: DataTypes.STRING },
  transfer_timestamp: { type: DataTypes.BIGINT },
  approved_by_admin: { type: DataTypes.BOOLEAN }
}, {
  tableName: 'complaint_transfer',
  timestamps: false,
});

module.exports = ComplaintTransfer;
