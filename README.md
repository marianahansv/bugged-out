# BuggedOut
BuggedOut is a Q&A forum app where users can browse channels, post questions, reply in threads, and search across content. 
*built for CMPT 353 (full stack development) @usask*

## features
- browse and post in topic channels
- upload pictures for reference
- reply in nested threads
- search existing content
- guest-friendly! no account required to explore

## screenshots
*(coming soon once I finish updating the style)*

## tech stack
- frontend: React, Create React App, date-fns
- backend: Bun, Express, MySQL, multer, JWT
- database: MySQL

## requirements
- [Bun](https://bun.sh/)
- a local MySQL server

## how to run?
```bash
# 1. copy the env file
cp backend/.env.example backend/.env

# 2. update backend/.env with your local MySQL credentials

# 3. install dependencies
bun run install:all

# 4. start both apps
bun run dev
```

or run them separately:
```bash
bun run dev:backend
bun run dev:frontend
```

default local URLs:
- frontend: `http://localhost:3000`
- backend: `http://localhost:5001`

the backend creates the database automatically on startup — as long as MySQL is running, you don't need to create `forumdb` manually.

## seed demo data
```bash
cd backend
bun run seed
```
this populates the app with sample users, channels, questions, and replies so it's ready to review right away.

## run tests
```bash
cd frontend
bun test
```

## build
```bash
bun run build
```

## a note on hosting
the backend is real (Express + MySQL), so hosting it fully requires a platform that supports Node/Bun backends — something like Railway or Render works. the frontend can be deployed to Vercel or Netlify separately and pointed at the hosted backend.

uploaded files are stored locally in `backend/uploads/`, which is fine for demos but would need to move to object storage (like S3) for a real production deploy.

## known limitations
- the HTTP route layer lives in one file — it works, but splitting it into route modules would clean things up
- some component-level layout choices are still inline and could be pulled into smaller presentational components
- file uploads are local-only (see above)

## a little story
this was my final project for CMPT 353 at USask. the brief was to build a full-stack app, so i made a forum — because forums are genuinely useful and gave me a chance to think through relational data, auth, file handling, and search all at once. i used Bun instead of Docker to keep the local workflow lighter, which i'd probably do again.