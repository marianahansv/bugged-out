# BuggedOut Architecture

## Recommended storage strategy

Yes, this project should keep a database.

A forum needs durable storage for:

- channels
- questions/posts
- threaded replies
- ratings
- user accounts

Without a database, posts disappear when the server restarts or become awkward to manage in flat files. For a portfolio project, persistent storage is a feature, not extra complexity.

## Why the current database approach makes sense

BuggedOut already uses a relational model well:

- `channels` group discussions
- `questions` belong to channels and optionally users
- `replies` belong to questions and can nest through `parent_reply_id`
- `ratings` connect users to questions or replies

That structure matches how forum data naturally behaves, which makes MySQL a reasonable choice.

## Simpler alternative

If you wanted the easiest possible demo setup, SQLite would also be a strong option for a portfolio. It removes the separate database service while still giving you real persistence and relational queries.

The tradeoff is:

- MySQL looks more production-like
- SQLite is easier for reviewers to run locally

## Current recommendation

For this repository, keep the database layer and keep the relational model.

The best near-term direction is:

1. Keep MySQL for now because the app already uses it and the schema fits a forum well.
2. Keep database bootstrapping on startup so onboarding stays simple.
3. Keep domain queries in a repository layer so the storage engine could be swapped later if you decide to move to SQLite.

## Current module layout

- `backend/config.js`: environment and runtime configuration
- `backend/auth.js`: password hashing helpers
- `backend/db.js`: pool creation and database bootstrap
- `backend/schema.js`: schema creation
- `backend/repositories/forumRepository.js`: forum-specific reads and writes
- `backend/server.js`: HTTP routes and request orchestration

This is closer to the structure used in similar forum-style apps, where request handling, persistence, and configuration are kept separate.
