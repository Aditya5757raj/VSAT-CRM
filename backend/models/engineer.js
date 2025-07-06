const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Complaint = require('./complaint');

const Engineer = sequelize.define('Engineer', {
  complaint_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: Complaint,
      key: 'complaint_id'
    }
  },
  engineer_name: DataTypes.STRING,
  engineer_phone_no: DataTypes.STRING
}, {
  tableName: 'engineer_table',
  timestamps: false
});

// Associations
Engineer.belongsTo(Complaint, { foreignKey: 'complaint_id' });
Complaint.hasOne(Engineer, { foreignKey: 'complaint_id' });

module.exports = Engineer;
