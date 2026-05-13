async function listChannels(pool) {
  const [results] = await pool.execute('SELECT * FROM channels ORDER BY channel_name ASC');
  return results;
}

async function createChannel(pool, channelName) {
  const [results] = await pool.execute(
    'INSERT INTO channels (channel_name) VALUES (?)',
    [channelName]
  );

  return results.insertId;
}

async function createQuestion(pool, { channelId, userId, title, content, imageUrl }) {
  await pool.execute(
    'INSERT INTO questions (channel_id, user_id, title, content, image_url) VALUES (?, ?, ?, ?, ?)',
    [channelId, userId, title, content, imageUrl]
  );
}

async function getQuestionById(pool, questionId) {
  const [results] = await pool.execute(
    `SELECT q.*, COALESCE(u.display_name, 'Anonymous') AS author
     FROM questions q
     LEFT JOIN users u ON q.user_id = u.id
     WHERE q.id = ?`,
    [questionId]
  );

  return results[0] ?? null;
}

async function listQuestions(pool, channelId) {
  let query = `SELECT q.*, COALESCE(u.display_name, 'Anonymous') AS author
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id`;
  const params = [];

  if (channelId) {
    query += ' WHERE q.channel_id = ?';
    params.push(channelId);
  }

  query += ' ORDER BY q.timestamp DESC';

  const [results] = await pool.execute(query, params);
  return results;
}

async function searchQuestions(pool, queryText) {
  const [results] = await pool.execute(
    `SELECT q.*, COALESCE(u.display_name, 'Anonymous') AS author
     FROM questions q
     LEFT JOIN users u ON q.user_id = u.id
     WHERE q.title LIKE ? OR q.content LIKE ?
     ORDER BY q.timestamp DESC`,
    [`%${queryText}%`, `%${queryText}%`]
  );

  return results;
}

async function createReply(pool, { questionId, userId, content, parentReplyId }) {
  const [results] = await pool.execute(
    'INSERT INTO replies (question_id, user_id, content, parent_reply_id) VALUES (?, ?, ?, ?)',
    [questionId, userId, content, parentReplyId]
  );

  const [newReplyResult] = await pool.execute(
    `SELECT r.*, COALESCE(u.display_name, 'Anonymous') AS author
     FROM replies r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [results.insertId]
  );

  return newReplyResult[0] ?? null;
}

async function listReplies(pool, questionId) {
  const [results] = await pool.execute(
    `SELECT r.*, COALESCE(u.display_name, 'Anonymous') AS author
     FROM replies r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.question_id = ?
     ORDER BY r.timestamp ASC`,
    [questionId]
  );

  return results;
}

module.exports = {
  createChannel,
  createQuestion,
  createReply,
  getQuestionById,
  listChannels,
  listQuestions,
  listReplies,
  searchQuestions,
};

