const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Complaint = require('./Complaint');

const Engineer = sequelize.define('Engineer', {
  complaint_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Complaint,
      key: 'complaint_id'
    }
  },
  engineer_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'engineer_table',
  timestamps: false
});

// Associations
Engineer.belongsTo(Complaint, { foreignKey: 'complaint_id' });
Complaint.hasOne(Engineer, { foreignKey: 'complaint_id' });

module.exports = Engineer;
