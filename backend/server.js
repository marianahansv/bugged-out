const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('./auth');
const { port, jwtSecret } = require('./config');
const { initializeDatabase, getPool } = require('./db');
const { createTables } = require('./schema');
const {
  createChannel,
  createQuestion,
  createReply,
  getQuestionById,
  listChannels,
  listQuestions,
  listReplies,
  searchQuestions,
} = require('./repositories/forumRepository');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function startServer() {
  try {
    const pool = await initializeDatabase();
    await createTables(pool);
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

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
const attachUserIfPresent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    req.user = decoded;
    next();
  });
};
//---------------------------------API ENPOINTS----------------------------------------

//========channels endpoints===========================================================
//create a channel
app.post('/addchannel', async (req, res) => {
  try {
    const { channel_name } = req.body;
    const normalizedName = channel_name?.trim();

    if (!normalizedName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const channelId = await createChannel(getPool(), normalizedName);
    res.json({ message: 'Channel created successfully', channelId });
  } catch (err) {
    console.error('Error creating channel:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get all channels
app.get('/getallchannels', async (req, res) => {
  try {
    const results = await listChannels(getPool());
    res.json(results);
  } catch (err) {
    console.error('Error retrieving channels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========questions endpoints==========================================================
//create a new question in the forum
app.post('/addquestion', attachUserIfPresent, upload.single('image'), async (req, res) => {
  try {
    const { channel_id, title, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const user_id = req.user?.id ?? null;

    if (!channel_id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await createQuestion(getPool(), {
      channelId: channel_id,
      userId: user_id,
      title,
      content,
      imageUrl: image_url,
    });
    res.json({ message: "Question added successfully" });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/getquestions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await getQuestionById(getPool(), questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    console.error('Error retrieving question:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get all questions in the specified channel
app.get('/getquestions', async (req, res) => {
  try {
    const channelId = req.query.channelId;

    const results = await listQuestions(getPool(), channelId);
    res.json(results);
  } catch (err) {
    console.error('Error retrieving questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========replies endpoints==========================================================
//create a reply to a question
app.post('/addreply', attachUserIfPresent, async (req, res) => {
  try {
    const { question_id, content, parent_reply_id } = req.body;
    const user_id = req.user?.id ?? null;

    if (!question_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newReply = await createReply(getPool(), {
      questionId: question_id,
      userId: user_id,
      content,
      parentReplyId: parent_reply_id,
    });

    if (!newReply) {
      return res.status(500).json({ error: 'Failed to retrieve new reply data' });
    }

    res.json(newReply);

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

    const results = await listReplies(getPool(), questionId);
    res.json(results);
  } catch (err) {
    console.error('Error retrieving replies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//========user registration endpoints=========================================
app.post('/register', async (req, res) => {
  const { username, password, display_name } = req.body;
  const normalizedUsername = username?.trim();
  const normalizedDisplayName = display_name?.trim();

  try {
    if (!normalizedUsername || !normalizedDisplayName || !password) {
      return res.status(400).json({ error: 'Username, display name, and password are required.' });
    }

    const { salt, hash } = hashPassword(password);
    await getPool().execute(
      'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)',
      [normalizedUsername, `${salt}:${hash}`, normalizedDisplayName]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already taken.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [results] = await getPool().execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const [storedSalt, storedHash] = user.password.split(':');
    const passwordMatch = verifyPassword(password, storedSalt, storedHash);

    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({ id: user.id, username: user.username, display_name: user.display_name }, jwtSecret, {
        expiresIn: '1h',
      });
      const { id, username, display_name, avatar_url, is_admin } = user;
      res.json({ message: 'Login successful', user: { id, username, display_name, avatar_url, is_admin }, token: token });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//========ratings endpoints==========================================================
app.post('/rate_question', attachUserIfPresent, async (req, res) => {
  try {
    const { question_id, rating } = req.body;
    const user_id = req.user?.id ?? null;

    if (!question_id || !rating || (rating !== 1 && rating !== -1)) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    if (user_id === null) {
      return res.status(401).json({ error: 'Please log in to rate questions.' });
    }

    const connection = await getPool().getConnection();
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

    const connection = await getPool().getConnection();
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
app.post('/rate_reply', attachUserIfPresent, async (req, res) => {
  try {
    const { reply_id, rating } = req.body;
    const user_id = req.user?.id ?? null;

    if (!reply_id || !rating || (rating !== 1 && rating !== -1)) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    if (user_id === null) {
      return res.status(401).json({ error: 'Please log in to rate replies.' });
    }

    const connection = await getPool().getConnection();
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

    const connection = await getPool().getConnection();
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

    const results = await searchQuestions(getPool(), query);
    res.json(results);
  } catch (err) {
    console.error('Error searching questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

startServer();
