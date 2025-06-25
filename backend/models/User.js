const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
