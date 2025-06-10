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
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create products table
const createProductsTableSQL = `
CREATE TABLE IF NOT EXISTS products (
  user_id INT PRIMARY KEY,
  serial_number VARCHAR(50), -- Can be NULL
  model_no VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(100),
  purchase_date DATE NOT NULL,
  warranty_expiry DATE NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;



    // Create jobs table
    const createJobsTableSQL = `
  CREATE TABLE IF NOT EXISTS jobs (
    job_id VARCHAR(20) PRIMARY KEY,
    customer_id INT NOT NULL,
    call_type ENUM('Installation', 'Reinstallation', 'Demo', 'Repairs') NOT NULL,
    call_priority ENUM('Normal', 'Urgent') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    house_no VARCHAR(50),
    street VARCHAR(100),
    landmark VARCHAR(100),
    pin_code VARCHAR(6) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    product_type VARCHAR(50),
    city VARCHAR(100),
    state_code VARCHAR(10),
    available_date DATE,
    preferred_time VARCHAR(50),
    comments TEXT,
    full_address TEXT NOT NULL, -- ←✅ FIX: add this comma
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
  );
`;


    await pool.execute(createUsersTableSQL);
    console.log("✅ Users table created or already exists.");

    await pool.execute(createProductsTableSQL);
    console.log("✅ Products table created or already exists.");

    await pool.execute(createJobsTableSQL);
    console.log("✅ Jobs table created or already exists.");

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
