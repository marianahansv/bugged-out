/**
 * populates the forum database with demo users, channels,
 * questions, and replies for demo and testing purposes.
 * 
 * this file:
 * - clears existing demo forum data
 * - creates sample users
 * - creates forum channels
 * - inserts sample questions and replies
 * - uses transactions to ensure database consistency
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');
const { hashPassword } = require('./auth');

const seedUsers = [
  { username: 'spencer', displayName: 'Spencer', password: 'password123', isAdmin: false },
  { username: 'alex', displayName: 'Alex', password: 'password123', isAdmin: false },
  { username: 'mia', displayName: 'Mia', password: 'password123', isAdmin: false },
  { username: 'admin', displayName: 'Admin', password: 'admin123', isAdmin: true },
];

const legacySeedUsernames = [
  'guest_demo',
  'mentor_demo',
  'maintainer_demo',
];

const forumSeed = [
  {
    channel: 'JavaScript',
    author: 'spencer',
    title: 'Async/Await Confusion',
    content: 'I understand promises at a basic level, but I still get lost when chaining asynchronous API calls. What is the cleanest mental model for async/await in real projects?',
    replies: [
      ['alex', 'Treat async functions as promise factories. `await` pauses inside the function, but the outer function still returns a promise.'],
      ['mia', 'A good practice is to keep one async boundary per task, then move parsing and transformation into plain synchronous helpers.'],
    ],
  },
  {
    channel: 'JavaScript',
    author: 'alex',
    title: 'When should I debounce search input?',
    content: 'I am building a search field for forum posts. Should I debounce at the component level or at the API request layer?',
    replies: [
      ['spencer', 'Debounce in the UI for responsiveness, but still guard the API so rapid requests do not create unnecessary load.'],
    ],
  },
  {
    channel: 'Python',
    author: 'spencer',
    title: 'Virtual Environments',
    content: 'Why should I use virtual environments for small scripts if I am only working alone on my machine?',
    replies: [
      ['alex', 'They keep dependencies reproducible and prevent one project from breaking another six months later.'],
    ],
  },
  {
    channel: 'Python',
    author: 'mia',
    title: 'How do you structure a Flask app after it grows past one file?',
    content: 'I keep starting with a single app file, then it turns into a mess. What is a practical folder structure once routes and services start growing?',
    replies: [
      ['spencer', 'Move routes, config, templates, and database helpers into separate modules early. Even a tiny blueprint split helps a lot.'],
    ],
  },
  {
    channel: 'CSS',
    author: 'alex',
    title: 'Centering a Div',
    content: 'What is the simplest modern way to center content both horizontally and vertically without hacks?',
    replies: [
      ['spencer', 'Flexbox or grid. I use `display: grid; place-items: center;` when it is a single-child layout.'],
    ],
  },
  {
    channel: 'CSS',
    author: 'spencer',
    title: 'How do you keep a minimalist UI from feeling unfinished?',
    content: 'I like clean interfaces, but my layouts sometimes end up looking empty instead of intentional. What details matter most?',
    replies: [
      ['mia', 'Typography, spacing rhythm, and a clear surface hierarchy do most of the work. Minimal does not mean unstyled.'],
    ],
  },
  {
    channel: 'React',
    author: 'spencer',
    title: 'State lives in too many components',
    content: 'My forum UI works, but I am lifting state and passing callbacks through several layers. When do you decide to centralize state?',
    replies: [
      ['alex', 'If several sibling components depend on the same fetch lifecycle, move that logic into a shared hook or parent container.'],
    ],
  },
  {
    channel: 'React',
    author: 'mia',
    title: 'How do you decide what belongs in a custom hook?',
    content: 'I understand custom hooks conceptually, but I do not know when extracting one is actually worth it.',
    replies: [
      ['spencer', 'When you see repeated fetch, loading, and error logic across screens, that is usually the moment.'],
    ],
  },
  {
    channel: 'SQL',
    author: 'alex',
    title: 'When should I use a relational database for a forum?',
    content: 'If a project has channels, posts, replies, and user-owned votes, is a relational schema still the best fit?',
    replies: [
      ['mia', 'Yes. Forums have strongly related entities, and SQL makes ownership, joins, and aggregation straightforward.'],
    ],
  },
  {
    channel: 'SQL',
    author: 'spencer',
    title: 'How should I seed realistic demo data?',
    content: 'I want a portfolio project to feel alive when someone opens it. What makes seed data feel intentional instead of random?',
    replies: [
      ['alex', 'Use a coherent set of channels, distinct voices, and questions that show different user journeys like search, replies, and voting.'],
    ],
  },
  {
    channel: 'Java',
    author: 'mia',
    title: 'Garbage Collection',
    content: 'How do you explain garbage collection to beginners without oversimplifying it too much?',
    replies: [
      ['spencer', 'I describe it as automatic memory reclamation for objects your program can no longer reach, then explain that timing is not guaranteed.'],
    ],
  },
  {
    channel: 'C++',
    author: 'alex',
    title: 'Memory Management',
    content: 'What is the best modern advice for managing memory in C++ without teaching raw `new` and `delete` first?',
    replies: [
      ['spencer', 'Lead with ownership and smart pointers. Raw allocation should feel like an exception, not the default.'],
    ],
  },
  {
    channel: 'Godot',
    author: 'spencer',
    title: 'Moving a Character',
    content: 'How do I structure character movement in Godot so input, velocity, and animation do not get tangled together?',
    replies: [
      ['alex', 'Split it into input capture, movement calculation, and animation state updates. That keeps each step easier to test mentally.'],
    ],
  },
  {
    channel: 'Prolog',
    author: 'alex',
    title: 'Unification',
    content: 'Can someone explain unification in Prolog with a practical beginner-friendly example?',
    replies: [
      ['spencer', 'Think of it as pattern matching with variable binding. A query succeeds when Prolog can make both sides match consistently.'],
    ],
  },
  {
    channel: 'Architecture',
    author: 'mia',
    title: 'How much architecture is enough for a portfolio project?',
    content: 'I want my codebase to look thoughtful, but I do not want to over-engineer a small app. Where is the line?',
    replies: [
      ['alex', 'Separate the obvious concerns: config, persistence, routes, and presentation. That is usually enough to show mature judgment.'],
    ],
  },
];

async function seedDatabase() {
  const pool = mysql.createPool({ ...dbConfig });
  let connection = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute('DELETE FROM ratings');
    await connection.execute('UPDATE replies SET parent_reply_id = NULL');
    await connection.execute('DELETE FROM replies');
    await connection.execute('DELETE FROM questions');
    await connection.execute('DELETE FROM channels');
    await connection.execute(
      `DELETE FROM users WHERE username IN (${[...seedUsers.map((user) => user.username), ...legacySeedUsernames].map(() => '?').join(', ')})`,
      [...seedUsers.map((user) => user.username), ...legacySeedUsernames]
    );

    const userIds = {};
    for (const user of seedUsers) {
      const { salt, hash } = hashPassword(user.password);
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, display_name, is_admin) VALUES (?, ?, ?, ?)',
        [user.username, `${salt}:${hash}`, user.displayName, user.isAdmin]
      );
      userIds[user.username] = result.insertId;
    }

    const uniqueChannels = [...new Set(forumSeed.map((entry) => entry.channel))];
    const channelIds = {};

    for (const channelName of uniqueChannels) {
      const [result] = await connection.execute(
        'INSERT INTO channels (channel_name) VALUES (?)',
        [channelName]
      );
      channelIds[channelName] = result.insertId;
    }

    for (const thread of forumSeed) {
      const [questionResult] = await connection.execute(
        'INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)',
        [channelIds[thread.channel], userIds[thread.author], thread.title, thread.content]
      );

      for (const [replyAuthor, replyContent] of thread.replies) {
        await connection.execute(
          'INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)',
          [questionResult.insertId, userIds[replyAuthor], replyContent]
        );
      }
    }

    await connection.commit();
    console.log(`Seeded ${uniqueChannels.length} channels and ${forumSeed.length} questions.`);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error seeding database:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

seedDatabase();
