// sequelize.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

const sequelize = new Sequelize('vsat_database', process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  logging: false, // disable SQL logging
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize: Connected to vsat_database');
  } catch (error) {
    console.error('❌ Sequelize connection error:', error);
  }
})();

module.exports = sequelize;
