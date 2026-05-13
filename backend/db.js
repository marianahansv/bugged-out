const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

let pool;

/**
  Initializes the database:
    1. Connects to MySQL server
    2. Creates the database if it doesn't exist
    3. Creates a connection pool for future queries
 */
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await connection.end();

  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

/**
  Returns the initialized pool.
  Throws an error if initializeDatabase() hasn't been called yet.
 */
function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized yet.');
  }

  return pool;
}

module.exports = {
  initializeDatabase,
  getPool,
};

