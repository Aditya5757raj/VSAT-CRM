const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JobAssignment = sequelize.define('JobAssignment', {
  assignment_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  complaint_id: { type: DataTypes.STRING, allowNull: false }, // FK to Complaint
  technician_id: { type: DataTypes.BIGINT, allowNull: false }, // FK to Technician
  assigned_at: { type: DataTypes.BIGINT },
  status: { type: DataTypes.BIGINT }
}, {
  tableName: 'job_assignment',
  timestamps: false,
});

module.exports = JobAssignment;
