const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

// Import models
const User = require('./User');
const Customer = require('./Customer');
const Product = require('./Product');
const Complaint = require('./Complaint');
const ServiceCenter = require('./service_center');
const OperatingPincode = require('./operating_pincode');
const Technician = require('./technician');
const JobAssignment = require('./job_assignment');

// 🔗 Define Associations

// ✅ Customer - Complaint (One-to-Many)
Customer.hasMany(Complaint, { foreignKey: 'customer_id' });
Complaint.belongsTo(Customer, { foreignKey: 'customer_id' });

// ✅ Product - Complaint (One-to-Many)
Product.hasMany(Complaint, { foreignKey: 'product_id' });
Complaint.belongsTo(Product, { foreignKey: 'product_id' });

// ✅ ServiceCenter - OperatingPincode (One-to-Many)
ServiceCenter.hasMany(OperatingPincode, { foreignKey: 'center_id' });
OperatingPincode.belongsTo(ServiceCenter, { foreignKey: 'center_id' });

// ✅ ServiceCenter - Technician (One-to-Many)
ServiceCenter.hasMany(Technician, { foreignKey: 'center_id' });
Technician.belongsTo(ServiceCenter, { foreignKey: 'center_id' });

// ✅ Technician - JobAssignment (One-to-Many)
Technician.hasMany(JobAssignment, { foreignKey: 'technician_id' });
JobAssignment.belongsTo(Technician, { foreignKey: 'technician_id' });

// ✅ Complaint - JobAssignment (One-to-One or One-to-Many based on your logic)
Complaint.hasOne(JobAssignment, { foreignKey: 'complaint_id' });
JobAssignment.belongsTo(Complaint, { foreignKey: 'complaint_id' });

// ✅ ServiceCenter - JobAssignment (One-to-Many)
ServiceCenter.hasMany(JobAssignment, { foreignKey: 'service_center_id' });
JobAssignment.belongsTo(ServiceCenter, { foreignKey: 'service_center_id' });

// 🔁 Optionally: OperatingPincode can have more associations if required in future
// e.g., OperatingPincode.hasMany(SomeModel, { foreignKey: 'pincode_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Customer,
  Product,
  Complaint,
  ServiceCenter,
  OperatingPincode,
  Technician,
  JobAssignment
};
