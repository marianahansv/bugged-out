/**
 * handles all database operations related to the forum system.
 * this includes:
 * - channels
 * - questions/posts
 * - replies/comments
 * - question searching
 *
 * each function interacts directly with the mySQL database using 
 * the provided connection pool.
 */

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

async function deleteQuestion(pool, questionId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [replyRows] = await connection.execute(
      'SELECT id FROM replies WHERE question_id = ?',
      [questionId]
    );
    const replyIds = replyRows.map((reply) => reply.id);

    if (replyIds.length > 0) {
      await connection.query('DELETE FROM ratings WHERE reply_id IN (?)', [replyIds]);
      await connection.execute('UPDATE replies SET parent_reply_id = NULL WHERE question_id = ?', [questionId]);
    }

    await connection.execute('DELETE FROM ratings WHERE question_id = ?', [questionId]);
    await connection.execute('DELETE FROM replies WHERE question_id = ?', [questionId]);
    const [result] = await connection.execute('DELETE FROM questions WHERE id = ?', [questionId]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

async function deleteReply(pool, replyId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [replyRows] = await connection.execute('SELECT id FROM replies WHERE id = ?', [replyId]);
    if (replyRows.length === 0) {
      await connection.rollback();
      return false;
    }

    const idsToDelete = [Number(replyId)];
    let currentParentIds = [Number(replyId)];

    while (currentParentIds.length > 0) {
      const [children] = await connection.query(
        'SELECT id FROM replies WHERE parent_reply_id IN (?)',
        [currentParentIds]
      );
      currentParentIds = children.map((reply) => reply.id);
      idsToDelete.push(...currentParentIds);
    }

    await connection.query('DELETE FROM ratings WHERE reply_id IN (?)', [idsToDelete]);

    for (const id of [...idsToDelete].reverse()) {
      await connection.execute('DELETE FROM replies WHERE id = ?', [id]);
    }

    await connection.commit();
    return idsToDelete.length > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createChannel,
  createQuestion,
  createReply,
  deleteQuestion,
  deleteReply,
  getQuestionById,
  listChannels,
  listQuestions,
  listReplies,
  searchQuestions,
};
