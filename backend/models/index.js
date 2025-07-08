const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

// Import models
const User = require('./User');
const Engineer = require('./engineer');
const ServiceCenter = require('./service_center');
const OperatingPincode = require('./operating_pincode');
const Complaint = require('./Complaint');
const TechnicianInformation=require('./TechnicianInformation')


// 🔗 Define Associations

// ✅ ServiceCenter - OperatingPincode (One-to-Many)
ServiceCenter.hasMany(OperatingPincode, { foreignKey: 'center_id' });
OperatingPincode.belongsTo(ServiceCenter, { foreignKey: 'center_id' });

Complaint.hasOne(Engineer, {
  foreignKey: 'complaint_id',
  as: 'engineer' // optional alias
});
Engineer.belongsTo(Complaint, {
  foreignKey: 'complaint_id',
  as: 'complaint' // optional alias
});
module.exports = {
  sequelize,
  User,
  Complaint,
  ServiceCenter,
  OperatingPincode,
  Engineer,
  TechnicianInformation
};
