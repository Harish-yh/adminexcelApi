const { Pool } = require('pg');

// Create and export a new pool instance with your database configuration
const pool = new Pool({
  user: 'postgres',
  host: '192.168.90.43',
  database: 'NBZ_BUS',
  password: 'admin',
  port: 5432, // default port for PostgreSQL
});

module.exports = pool;

