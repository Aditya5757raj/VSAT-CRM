const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: 'vsat_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to vsat_database successfully!");
    connection.release(); 
  } catch (err) {
    console.error("❌ Failed to connect to vsat_database:", err);
  }
})();

module.exports = pool;
