/**
 * defines the relational database schema for the forum and creates 
 * the database tables required for the forum application.
 * - users
 * - channels
 * - questions
 * - replies
 * - ratings
 * relationships between tables are enforced using foreign keys.
 */

async function createTables(pool) {
  const connection = await pool.getConnection();

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) NULL,
        is_admin BOOLEAN DEFAULT FALSE
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS channels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        channel_name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        channel_id INT,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url VARCHAR(255) NULL,
        FOREIGN KEY (channel_id) REFERENCES channels(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS replies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT,
        user_id INT,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url VARCHAR(255) NULL,
        parent_reply_id INT NULL,
        is_accepted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (question_id) REFERENCES questions(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_reply_id) REFERENCES replies(id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        type ENUM('question', 'reply') NOT NULL,
        question_id INT NULL,
        reply_id INT NULL,
        rating INT NOT NULL,
        UNIQUE KEY unique_rating (user_id, type, question_id, reply_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id),
        FOREIGN KEY (reply_id) REFERENCES replies(id)
      );
    `);
  } finally {
    connection.release();
  }
}

module.exports = {
  createTables,
};
