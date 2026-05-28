/**
 * centralizes environment-based configuration for the backend application.
 * this file contains the server port, mysql connection settings, and jwt secret.
 *
 * loads and exports application configuration settings from the .env file
 * - stores server configuration values
 * - stores MySQL database connection settings
 * - provides the JWT secret used for authentication
 */

require('dotenv').config();

const port = Number(process.env.PORT ?? 5001);

const dbConfig = {
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'forumdb',
};

module.exports = {
  port,
  dbConfig,
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret',
};
