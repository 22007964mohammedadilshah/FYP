const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,       
  host: process.env.DB_HOST,       
  database: process.env.DB_NAME,   
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT,       
});

// Test the database connection
pool.query('SELECT 1')
  .then(() => {
      console.log("Database connection successful");
  })
  .catch(err => {
      console.error("Database connection failed:", err.stack);
  });

module.exports = pool; // Export the pool instance
