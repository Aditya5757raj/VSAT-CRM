// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./User');
const Engineer = require('./engineer');
const ServiceCenter = require('./service_center');
const OperatingPincode = require('./operating_pincode');
const Complaint = require('./Complaint');
const TechnicianInformation = require('./TechnicianInformation');
const TechnicianPincode = require('./TechnicianPincode');
const CcAgent = require('./CcAgent');

// ServiceCenter ↔ OperatingPincode
ServiceCenter.hasMany(OperatingPincode, { foreignKey: 'center_id' });
OperatingPincode.belongsTo(ServiceCenter, { foreignKey: 'center_id' });

// Complaint ↔ Engineer
Complaint.hasOne(Engineer, {
  foreignKey: 'complaint_id',
  as: 'engineer'
});
Engineer.belongsTo(Complaint, {
  foreignKey: 'complaint_id',
  as: 'complaint'
});

// TechnicianInformation ↔ TechnicianPincode
TechnicianInformation.hasMany(TechnicianPincode, {
  foreignKey: 'engineer_id',
  sourceKey: 'engineer_id',
  as: 'pincodes'
});
TechnicianPincode.belongsTo(TechnicianInformation, {
  foreignKey: 'engineer_id',
  targetKey: 'engineer_id',
  as: 'technician'
});

// ✅ User ↔ CcAgent
User.hasMany(CcAgent, { foreignKey: 'user_id', as: 'ccAgents' });
CcAgent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Complaint,
  ServiceCenter,
  OperatingPincode,
  Engineer,
  TechnicianInformation,
  TechnicianPincode,
  CcAgent
};
