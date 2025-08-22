// models/PartRequest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PartRequest = sequelize.define('PartRequest', {
  serial_number: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  model_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  part_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requested_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  po_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
    validate: {
      isIn: [['Pending', 'Approved', 'Rejected', 'Dispatched', 'Completed']]
    }
  },
  docket_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  docket_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  courier_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  received_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Not Received',
    validate: {
      isIn: [['Not Received', 'Partially Received', 'Fully Received']]
    }
  },
  short_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  service_center_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fulfilled_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  complaint_id: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'part_requests',
  timestamps: true
});

module.exports = PartRequest;
