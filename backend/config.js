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

