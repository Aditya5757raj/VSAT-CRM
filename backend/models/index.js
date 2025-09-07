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
const PartRequest = require('./PartRequest');
const Brand = require('./Brand');        // ✅ New model
const Product = require('./product');    // ✅ New model
const Warehouse=require('./warehouse')
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

// ✅ ServiceCenter ↔ PartRequest
ServiceCenter.hasMany(PartRequest, { foreignKey: 'service_center_id', as: 'partRequests' });
PartRequest.belongsTo(ServiceCenter, { foreignKey: 'service_center_id', as: 'serviceCenter' });

// ✅ Brand ↔ Product (One-to-Many)
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

module.exports = {
  sequelize,
  User,
  Complaint,
  ServiceCenter,
  OperatingPincode,
  Engineer,
  TechnicianInformation,
  TechnicianPincode,
  CcAgent,
  PartRequest,
  Brand,       // ✅ export new model
  Product,
  Warehouse      // ✅ export new model
};
