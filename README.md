# BuggedOut

BuggedOut is a lightweight Q&A forum built with React, Bun, Express, and MySQL. Users can browse channels, ask questions, upload screenshots, reply in threads, and search existing content. Authentication is optional for exploration, which makes the app easy to demo in a portfolio setting.

## Portfolio highlights

- Full-stack app with a React frontend and Express/MySQL backend
- Bun-based local workflow instead of Docker
- Automatic database creation on backend startup
- Demo data seeding for quick reviewer onboarding
- Guest-friendly browsing flow with optional account login

## Tech stack

- Frontend: React, Create React App, date-fns
- Backend: Bun, Express, MySQL, multer, JWT
- Database: MySQL

## Project structure

- `frontend/`: React client
- `backend/`: Express API, MySQL bootstrap, repository layer, seeding, uploads
- `backend/config.js`: environment-driven server and DB configuration
- `backend/auth.js`: password hashing helpers shared by runtime and seed script
- `backend/db.js`: database bootstrap and pool lifecycle
- `backend/schema.js`: table creation
- `backend/repositories/forumRepository.js`: forum-specific queries
- `docs/architecture.md`: storage and system design notes

## Requirements

- [Bun](https://bun.sh/)
- A local MySQL server

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Update the values in `backend/.env` to match your local MySQL setup.
3. Install dependencies:

```bash
bun run install:all
```

## Run locally

Start both apps:

```bash
bun run dev
```

Or run them separately:

```bash
bun run dev:backend
bun run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

The backend creates the configured database automatically when it starts, so as long as MySQL itself is running, you do not need to create `forumdb` manually.

## Storage choice

This project should keep a database. Forum apps need durable storage for posts, replies, channels, and user state, and a relational model fits that data naturally.

- Current choice: MySQL
- Simpler portfolio alternative: SQLite

The reasoning and tradeoffs are documented in [docs/architecture.md](/Users/marianahans/Downloads/project/docs/architecture.md).

## Seed demo data

```bash
cd backend
bun run seed
```

This creates sample users, channels, questions, and replies to make the app easier to review.

## Build

```bash
bun run build
```

## Known limitations

- Uploaded files are stored locally in `backend/uploads/`, which is fine for local demos but should be replaced with object storage for production hosting.
- The backend now has a cleaner config/db/repository split, but the HTTP route layer still lives in one file and could be separated further into route modules.
- The UI theme is centralized, but some component-level layout choices still live inline and could be extracted into smaller presentational components over time.
