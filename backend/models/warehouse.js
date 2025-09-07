const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,   // auto-generate UUID
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[6-9]\d{9}$/   // 10-digit starting with 6-9
    }
  },
  pincodes: {
    type: DataTypes.JSON,   // store array of pincodes as JSON
    allowNull: false
  }
}, {
  tableName: 'warehouses',
  timestamps: true
});

module.exports = Warehouse;
