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
    title: 'Why does my async function return a Promise?',
    content: 'I have an async function that fetches user data. When I log the result from another file, I get Promise { <pending> }. Where should I use await?',
    replies: [
      ['alex', 'Use `await` where you call the async function. An async function always returns a promise, even when it returns a plain object inside the function body.'],
      ['mia', 'If the caller has to stay sync, wrap the call in an async function or use `.then()`. The fetch and the code that reads the result need the same async flow.'],
    ],
  },
  {
    channel: 'JavaScript',
    author: 'alex',
    title: 'Search fires a request on every keypress',
    content: 'My search input calls the API each time the user types. The network tab fills up fast. Where should I add a debounce in a React app?',
    replies: [
      ['spencer', 'Add the debounce around the search state that triggers the fetch. Keep the input responsive, then wait a short delay before sending the request.'],
    ],
  },
  {
    channel: 'Python',
    author: 'spencer',
    title: 'Python misses a package after pip install',
    content: 'I installed requests with pip. My script still says ModuleNotFoundError. I might have more than one Python version installed. How do I check what is happening?',
    replies: [
      ['alex', 'Run `python -m pip show requests` with the same `python` command you use to run the script. If that works, the package is installed for that interpreter.'],
    ],
  },
  {
    channel: 'Python',
    author: 'mia',
    title: 'Flask route disappears after I split files',
    content: 'I moved my Flask routes into another file. The app starts, and the route is missing. What is the usual setup for this?',
    replies: [
      ['spencer', 'Use a Blueprint and register it in the file where you create the app. The route file defines the Blueprint. The app file calls `app.register_blueprint(...)`.'],
    ],
  },
  {
    channel: 'CSS',
    author: 'alex',
    title: 'Why is my centered div still a little off?',
    content: 'I used flex with justify-content and align-items set to center. The box still has a small offset. What should I check first?',
    replies: [
      ['spencer', 'Check the body margin first. Browsers add `margin: 8px` to the body by default, so full-page centering can look slightly shifted.'],
    ],
  },
  {
    channel: 'CSS',
    author: 'spencer',
    title: 'Button text sits low after reducing padding',
    content: 'I made my buttons smaller. Now the text looks a bit low inside the border. The font size is fine. What CSS should I adjust?',
    replies: [
      ['mia', 'Set a fixed `min-height` and remove vertical padding. Use `line-height: 1`. If it still looks low, inspect the font rendering and adjust the height by a pixel.'],
    ],
  },
  {
    channel: 'React',
    author: 'spencer',
    title: 'Child component needs to update parent state',
    content: 'I have a sidebar that selects a channel and a main panel that loads questions. The sidebar knows what was clicked. The main panel needs the selected id. What is the usual React pattern here?',
    replies: [
      ['alex', 'Keep the selected id in the shared parent. Pass a callback to the sidebar. Pass the selected id down to the main panel.'],
    ],
  },
  {
    channel: 'React',
    author: 'mia',
    title: 'useEffect keeps fetching in a loop',
    content: 'My component fetches data inside useEffect. I added the fetch function to the dependency array, and now the request keeps running. What causes this?',
    replies: [
      ['spencer', 'The function is probably being recreated on each render. Wrap it in `useCallback`. You can also move the fetch logic inside the effect if it only belongs there.'],
    ],
  },
  {
    channel: 'SQL',
    author: 'alex',
    title: 'How do I show posts with the author name?',
    content: 'My questions table stores user_id. I want the API to return each question with the display name from users. Should I make two queries or use a join?',
    replies: [
      ['mia', 'Use a `LEFT JOIN` from questions to users. That keeps the API response simple and still returns questions if the user row is missing.'],
    ],
  },
  {
    channel: 'SQL',
    author: 'spencer',
    title: 'Seed script fails when tables have foreign keys',
    content: 'My seed script deletes rows before inserting demo data. I added replies that can point to other replies. Now MySQL blocks the delete. How should I reset the table?',
    replies: [
      ['alex', 'Clear the child references before deleting the rows. For nested replies, set `parent_reply_id` to null. Delete replies after that.'],
    ],
  },
  {
    channel: 'Java',
    author: 'mia',
    title: 'Why does Java still use memory after I remove objects?',
    content: 'I removed items from a list and expected memory to drop right away. The app still shows high memory use for a while. Is that expected in Java?',
    replies: [
      ['spencer', 'That is expected. The garbage collector runs when the JVM decides it needs to. Removing references makes objects eligible to be freed. The JVM may keep memory allocated for later use.'],
    ],
  },
  {
    channel: 'C++',
    author: 'alex',
    title: 'Should I use new/delete for this object?',
    content: 'I am learning C++ and keep seeing examples with `new` and `delete`. For a small object used inside one function, do I need dynamic allocation?',
    replies: [
      ['spencer', 'Use a local variable when the object only lives inside one function. Use `std::unique_ptr` when ownership has to move to another scope.'],
    ],
  },
  {
    channel: 'Godot',
    author: 'spencer',
    title: 'Character keeps sliding after input stops',
    content: 'I am moving a CharacterBody2D in Godot. When I release the key, the character keeps sliding for a short time. Where should I reset velocity?',
    replies: [
      ['alex', 'Set the velocity from the current input every physics frame. If there is no input, set that axis to zero before calling `move_and_slide()`.'],
    ],
  },
  {
    channel: 'Prolog',
    author: 'alex',
    title: 'Why does this Prolog query return more answers?',
    content: 'I wrote a small parent rule in Prolog. The first answer is correct. Pressing semicolon gives more matches. Why does Prolog keep searching?',
    replies: [
      ['spencer', 'Prolog searches for every solution that satisfies the rule. The semicolon asks for the next match, so it backtracks through the facts.'],
    ],
  },
  {
    channel: 'Architecture',
    author: 'mia',
    title: 'Where should database code live in a small Express app?',
    content: 'My Express server file handles routes, database calls, and startup. The file is hard to scan. What is a reasonable first split?',
    replies: [
      ['alex', 'Move database queries into a repository file first. Keep the route handler focused on the request and response.'],
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
