# BuggedOut backend
this is the API and database side of BuggedOut. tt handles auth, channels, questions, replies, ratings, admin deletes, image uploads, and seed data.

## tech stack
- Bun
- Express
- MySQL
- JWT auth
- Multer uploads

## setup
install dependencies from this directory:

```bash
bun install
```

create a `.env` file if your local MySQL setup differs from the defaults:

```bash
PORT=5001
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=forumdb
JWT_SECRET=dev-only-secret
```

## scripts
start the API:

```bash
bun run start
```

run with watch mode:

```bash
bun run dev
```

seed the database:

```bash
bun run seed
```

## seed users
the seed creates three demo users and one admin:

```txt
spencer / password123
alex / password123
mia / password123
admin / admin123
```

## notes
- the server creates the database and tables on startup.
- uploaded files go into `backend/uploads`.
- admin users can delete questions and replies.
