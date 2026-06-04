# BuggedOut frontend
this is the React side of BuggedOut. it renders the forum, channel filters, question pages, auth modals, reply threads, voting controls, and admin delete buttons.

## tech stack
- React
- Create React App
- date-fns
- plain CSS

## setup
install dependencies from this directory:

```bash
bun install
```

the frontend talks to the backend through `REACT_APP_API_URL`.

for local development:

```bash
REACT_APP_API_URL=http://localhost:5001 bun run dev
```

I=if the variable is missing, the app falls back to the local API URL in `src/api.js`.

## scripts
start the dev server:

```bash
bun run dev
```

build for production:

```bash
bun run build
```

run tests:

```bash
bun test
```

