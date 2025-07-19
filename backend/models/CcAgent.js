// models/CcAgent.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CcAgent = sequelize.define('CcAgent', {
  id: {
    type: DataTypes.STRING,
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
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brands: {
    type: DataTypes.JSON,
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'cc_agents'
});

module.exports = CcAgent;
