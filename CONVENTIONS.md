## Project structure

- `frontend/`: React client
- `backend/`: Express API, MySQL bootstrap, repository layer, seeding, uploads
- `backend/config.js`: environment-driven server and DB configuration
- `backend/auth.js`: password hashing helpers shared by runtime and seed script
- `backend/db.js`: database bootstrap and pool lifecycle
- `backend/schema.js`: table creation
- `backend/repositories/forumRepository.js`: forum-specific queries

## Engineering Conventions
- No artifacts.
- Less code is better than more code. However, verbose wins over intricate logic.
- Code should be self-explanatory
- Prefer `const` over `let`; use ternary expressions instead of reassignment
- Rewrite existing components over adding new ones.
- Flag obsolete files to keep the codebase lightweight.
- Avoid race conditions at all costs.
- Always output the full component unless told otherwise.
- Be explicit on where snippets go (e.g., below “abc”, above “xyz”).
- Avoid legacy patterns.
- Use TypeScript for all code files. 
- Never commit without running prettier on changed files first