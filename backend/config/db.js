// // sequelize.js
// const { Sequelize } = require('sequelize');
// require('dotenv').config({ path: '../.env' });

// const sequelize = new Sequelize('vsat_database', process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
//   host: process.env.DATABASE_HOST,
//   dialect: 'mysql',
//   logging: false, // disable SQL logging
// });

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Sequelize: Connected to vsat_database');
//   } catch (error) {
//     console.error('❌ Sequelize connection error:', error);
//   }
// })();

// module.exports = sequelize;
// sequelize.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 26257,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // for CockroachDB's managed certificates
      },
    },
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize: Connected to vsat_database');
  } catch (error) {
    console.error('❌ Sequelize connection error:', error);
  }
})();

module.exports = sequelize;

