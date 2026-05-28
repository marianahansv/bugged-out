/**
 * manages mysql startup and connection pooling for the backend.
 * this file creates the configured database if needed and exposes the shared pool
 * used by route handlers, schema setup, and repository queries.
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

let pool;

/**
  initializes the database:
    1. connects to MySQL server
    2. creates the database if it doesn't exist
    3. creates a connection pool for future queries
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
  returns the initialized pool.
  throws an error if initializeDatabase() hasn't been called yet.
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
