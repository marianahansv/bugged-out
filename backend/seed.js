require('dotenv').config();
const mysql = require('mysql2/promise');
const { hashPassword } = require('./server');

async function seedDatabase() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    let connection = null; // Declare connection outside try

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Delete data (correct order)
        try {
            await connection.execute("DELETE FROM replies");
            console.log("Deleted all existing replies.");

            await connection.execute("DELETE FROM ratings");
            console.log("Deleted all existing ratings.");

            await connection.execute("DELETE FROM questions");
            console.log("Deleted all existing questions.");

            await connection.execute("DELETE FROM channels");
            console.log("Deleted all existing channels.");
        } catch (deleteError) {
            await connection.rollback();
            throw deleteError;
        }

        // Insert channels
        const channels = ['C++', 'CSS', 'Godot', 'Java', 'JavaScript', 'Prolog', 'Python'];
        const channelIds = {};

        for (const channelName of channels) {
            try {
                const [result] = await connection.execute(
                    "INSERT INTO channels (channel_name) VALUES (?)",
                    [channelName]
                );
                channelIds[channelName] = result.insertId;
            } catch (insertChannelError) {
                await connection.rollback();
                throw insertChannelError;
            }
        }

        // Insert questions and capture their IDs
        const questionIds = {}; // To store question IDs
        try {
            const [jsResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['JavaScript'], 1, 'Async/Await Confusion', 'I\'m having trouble understanding async/await in JavaScript.']
            );
            questionIds['Async/Await Confusion'] = jsResult.insertId;

            const [cppResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['C++'], 2, 'Memory Management', 'What are the best practices for memory management in C++?']
            );
            questionIds['Memory Management'] = cppResult.insertId;

            const [pythonResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['Python'], 1, 'Virtual Environments', 'Why should I use virtual environments in Python?']
            );
            questionIds['Virtual Environments'] = pythonResult.insertId;

            const [cssResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['CSS'], 2, 'Centering a Div', 'What is the best way to center a div both horizontally and vertically?']
            );
            questionIds['Centering a Div'] = cssResult.insertId;

            const [godotResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['Godot'], 1, 'Moving a Character', 'How do I properly move a character in Godot?']
            );
            questionIds['Moving a Character'] = godotResult.insertId;

            const [javaResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['Java'], 2, 'Garbage Collection', 'How does garbage collection work in Java?']
            );
            questionIds['Garbage Collection'] = javaResult.insertId;

            const [prologResult] = await connection.execute(
                "INSERT INTO questions (channel_id, user_id, title, content) VALUES (?, ?, ?, ?)",
                [channelIds['Prolog'], 1, 'Unification', 'Can someone explain unification in Prolog with a simple example?']
            );
            questionIds['Unification'] = prologResult.insertId;

        } catch (insertQuestionError) {
            await connection.rollback();
            throw insertQuestionError;
        }

        // Insert replies using questionIds
        try {
            if (questionIds['Async/Await Confusion']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Async/Await Confusion'], 2, 'Async/await makes asynchronous code look and behave more like synchronous code.']
                );
            }

            if (questionIds['Memory Management']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Memory Management'], 1, 'Use smart pointers to manage memory automatically.']
                );
            }
            if (questionIds['Virtual Environments']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Virtual Environments'], 2, 'They help you isolate project dependencies.']
                );
            }
            if (questionIds['Centering a Div']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Centering a Div'], 1, 'Flexbox or Grid are the modern ways to do it.']
                );
            }
            if (questionIds['Moving a Character']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Moving a Character'], 2, 'Use the move_and_slide method.']
                );
            }
            if (questionIds['Garbage Collection']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Garbage Collection'], 1, 'Java automatically manages memory by reclaiming unused objects.']
                );
            }
            if (questionIds['Unification']) {
                await connection.execute(
                    "INSERT INTO replies (question_id, user_id, content) VALUES (?, ?, ?)",
                    [questionIds['Unification'], 2, 'It\'s a matching process between terms.']
                );
            }
        } catch (insertReplyError) {
            await connection.rollback();
            throw insertReplyError;
        }

        await connection.commit();
        console.log('Database seeded with channels, questions, and replies!');
    } catch (error) {
        await connection.rollback();
        console.error('Error seeding database:', error);
    } finally {
        if (connection) connection.release();
        if (pool) pool.end();
    }
}

seedDatabase();
