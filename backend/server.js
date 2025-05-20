const express = require('express');
const mysql = require('mysql2/promise'); // Change the require
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const port = 5000;

const JWT_SECRET = 'CMPT353'; 

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt: salt, hash: hash };
}

function verifyPassword(password, storedSalt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// **IMPORTANT CHANGE:** Create a connection pool for efficiency
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to create tables (using promises)
async function createTables() {
  try {
    const connection = await pool.getConnection(); // Get a connection from the pool

    // Table creation queries (same as before)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) NULL,
        is_admin BOOLEAN DEFAULT FALSE
      );
    `;

    const createChannelsTable = `
      CREATE TABLE IF NOT EXISTS channels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        channel_name VARCHAR(255) UNIQUE NOT NULL
      );
    `;

    const createQuestionsTable = `
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
    `;

    const createRepliesTable = `
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
    `;

    const createRatingsTable = `
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
    `;

    await connection.execute(createUsersTable);
    console.log('Users table created or already exists.');
    await connection.execute(createChannelsTable);
    console.log('Channels table created or already exists.');
    await connection.execute(createQuestionsTable);
    console.log('Questions table created or already exists.');
    await connection.execute(createRepliesTable);
    console.log('Replies table created or already exists.');
    await connection.execute(createRatingsTable);
    console.log('Ratings table created or already exists.');

    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Call createTables to ensure tables exist
createTables();

//multer setup to support file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// authentication middleware (NOW USING JWT - SECURE)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  console.log('--- authenticateToken ---');
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Unauthorized - Invalid token' });
    }

    req.user = decoded; // Store the *decoded* user info in req.user
    console.log('Authenticated user:', decoded);
    next();
  });
};
//---------------------------------API ENPOINTS----------------------------------------

//========channels endpoints===========================================================
//create a channel
app.post('/addchannel', async (req, res) => {
  try {
    const { channel_name } = req.body;
    if (!channel_name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'INSERT INTO channels (channel_name) VALUES (?)',
      [channel_name]
    );
    connection.release();

    res.json({ message: 'Channel created successfully', channelId: results.insertId });
  } catch (err) {
    console.error('Error creating channel:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get all channels
app.get('/getallchannels', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute('SELECT * FROM channels');
    connection.release();

    res.json(results);
  } catch (err) {
    console.error('Error retrieving channels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========questions endpoints==========================================================
//create a new question in the forum
app.post('/addquestion', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { channel_id, title, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const user_id = req.user.id;

    if (!channel_id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const connection = await pool.getConnection();
    await connection.execute(
      "INSERT INTO questions (channel_id, user_id, title, content, image_url) VALUES (?, ?, ?, ?, ?)",
      [channel_id, user_id, title, content, image_url]
    );
    connection.release();

    res.json({ message: "Question added successfully" });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/getquestions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );
    connection.release();

    if (results.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(results[0]); // Send back a single question object
  } catch (err) {
    console.error('Error retrieving question:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get all questions in the specified channel
app.get('/getquestions', async (req, res) => {
  try {
    const channelId = req.query.channelId;

    let query = 'SELECT * FROM questions';
    let params = [];

    if (channelId) {
      query += ' WHERE channel_id = ?';
      params.push(channelId);
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();

    res.json(results);
  } catch (err) {
    console.error('Error retrieving questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========replies endpoints==========================================================
//create a reply to a question
app.post('/addreply', authenticateToken, async (req, res) => {
  try {
    const { question_id, content, parent_reply_id } = req.body;
    const user_id = req.user.id;

    if (!question_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'INSERT INTO replies (question_id, user_id, content, parent_reply_id) VALUES (?, ?, ?, ?)',
      [question_id, user_id, content, parent_reply_id]
    );

    const [newReplyResult] = await connection.execute(
      'SELECT r.*, u.display_name as author FROM replies r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [results.insertId]
    );

    connection.release();

    if (newReplyResult.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve new reply data' });
    }

    res.json(newReplyResult[0]);  // Send back the new reply data

  } catch (err) {
    console.error('Error creating reply:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get replies for a question
app.get('/getreplies', async (req, res) => {
  try {
    const questionId = req.query.questionId;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM replies WHERE question_id = ?',
      [questionId]
    );
    connection.release();

    res.json(results);
  } catch (err) {
    console.error('Error retrieving replies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========user registration endpoints=========================================
app.post('/register', async (req, res) => {
  const { username, password, display_name } = req.body;

  try {
    const { salt, hash } = hashPassword(password); // Hash the password
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)',
      [username, `${salt}:${hash}`, display_name]
    );
    connection.release();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (results.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const [storedSalt, storedHash] = user.password.split(':');
    const passwordMatch = verifyPassword(password, storedSalt, storedHash);

    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({ id: user.id, username: user.username, display_name: user.display_name }, JWT_SECRET, {
        expiresIn: '1h',
      });
      const { id, username, display_name, avatar_url, is_admin } = user;
      connection.release();
      res.json({ message: 'Login successful', user: { id, username, display_name, avatar_url, is_admin }, token: token });
    } else {
      connection.release();
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//========ratings endpoints==========================================================
app.post('/rate_question', authenticateToken, async (req, res) => {
  try {
    const { question_id, rating } = req.body;
    const user_id = req.user.id;

    if (!question_id || !rating || (rating !== 1 && rating !== -1)) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    const connection = await pool.getConnection();
    const [existingRating] = await connection.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND question_id = ? AND type = ?',
      [user_id, question_id, 'question']
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await connection.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND question_id = ? AND type = ?',
        [rating, user_id, question_id, 'question']
      );
      res.json({ message: 'Question rating updated successfully' });
    } else {
      // Insert new rating
      await connection.execute(
        'INSERT INTO ratings (user_id, type, question_id, rating) VALUES (?, ?, ?, ?)',
        [user_id, 'question', question_id, rating]
      );
      res.json({ message: 'Question rating added successfully' });
    }

    connection.release();
  } catch (err) {
    console.error('Error rating question:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get_question_rating', async (req, res) => {
  try {
    const question_id = req.query.question_id;

    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT SUM(rating) AS total_rating FROM ratings WHERE question_id = ? AND type = ?',
      [question_id, 'question']
    );
    connection.release();

    const total_rating = results[0] ? results[0].total_rating : 0;
    res.json({ question_id, total_rating });
  } catch (err) {
    console.error('Error getting question rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// rate a reply (upvote or downvote)
app.post('/rate_reply', authenticateToken, async (req, res) => {
  try {
    const { reply_id, rating } = req.body;
    const user_id = req.user.id;

    if (!reply_id || !rating || (rating !== 1 && rating !== -1)) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM ratings WHERE user_id = ? AND reply_id = ?',
      [user_id, reply_id]
    );

    if (results.length > 0) {
      // update existing rating
      await connection.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND reply_id = ?',
        [rating, user_id, reply_id]
      );
      connection.release();
      res.json({ message: 'Rating updated successfully' });
    } else {
      // insert new rating :)
      await connection.execute(
        'INSERT INTO ratings (user_id, type, reply_id, rating) VALUES (?, ?, ?, ?)',
        [user_id, 'reply', reply_id, rating]
      );
      connection.release();
      res.json({ message: 'Rating added successfully' });
    }
  } catch (err) {
    console.error('Error rating reply:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get the total rating for a reply
app.get('/get_reply_rating', async (req, res) => {
  try {
    const reply_id = req.query.reply_id;

    if (!reply_id) {
      return res.status(400).json({ error: 'Reply ID is required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT SUM(rating) AS total_rating FROM ratings WHERE reply_id = ?',
      [reply_id]
    );
    connection.release();

    const total_rating = results[0] ? results[0].total_rating : 0;
    res.json({ reply_id, total_rating });
  } catch (err) {
    console.error('Error getting reply rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/searchquestions', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM questions WHERE title LIKE ? OR content LIKE ?',
      [`%${query}%`, `%${query}%`] // Using LIKE for partial matches
    );
    connection.release();

    res.json(results);
  } catch (err) {
    console.error('Error searching questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});