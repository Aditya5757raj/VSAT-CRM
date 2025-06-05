const db = require("../config/db");

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

let pool;

async function initDB() {
  try {
    // Connect without specifying a DB to create it
    const tempConnection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD
    });

    await tempConnection.query("CREATE DATABASE IF NOT EXISTS vsat_database");
    console.log("✅ Database 'vsat_database' created or already exists.");
    await tempConnection.end();

    // Now connect to the actual vsat_database
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'vsat_database',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create users table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.execute(createTableSQL);
    console.log("✅ Users table created or already exists.");

  } catch (err) {
    console.error("❌ Error during DB initialization:", err);
    process.exit(1);
  }
}

// Immediately initialize DB when this module is loaded
initDB();

module.exports = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  getPool: () => pool
};

