# Reconstructed Git Log

This is a retrospective commit history reconstructed from the current state of the project. It is not an original `git log`, but it is organized to reflect the main changes that were made while shaping this repo into its current portfolio-ready form.

## Suggested `git log --oneline`

```text
f4e8c91 feat(ui): add auth overlay, threaded replies, and denser thread layout
e193a54 style(ui): shift app into a cleaner monochrome forum layout
d2a0b18 feat(auth): make browsing guest-friendly with optional sign-in
c7a12be docs: add architecture notes and portfolio-focused README
b5d4ef0 feat(seed): expand demo content with channels, users, and replies
a426fcb refactor(backend): split config, auth, db, schema, and repository concerns
97bc4dd feat(db): auto-create database and schema during backend startup
845ef13 chore(runtime): move local workflow from Docker to Bun
6f0d2a7 feat(forum): add search, rating, uploads, and richer thread interactions
48cd813 feat(auth): add registration, login, JWT sessions, and user identity
2d9e5b4 feat(api): build Express and MySQL forum backend
13bb0fe feat(frontend): scaffold React forum client with channels and question flows
```

## Suggested detailed log

```text
commit f4e8c91
Author: Mariana Hans <you@example.com>
Date:   2026-05-13 11:20:00 -0600

    feat(ui): add auth overlay, threaded replies, and denser thread layout

    - hide the rest of the app while login or registration is open
    - remove the extra mode/focus/flow summary boxes
    - render replies as chained nested threads
    - tighten spacing on the question page while giving the content column more room

commit e193a54
Author: Mariana Hans <you@example.com>
Date:   2026-05-12 16:10:00 -0600

    style(ui): shift app into a cleaner monochrome forum layout

    - centralize theme styles in index.css
    - keep a grayscale palette with all-monospace typography
    - sharpen borders and tune spacing for a more modern forum feel
    - improve responsive structure for sidebar and content layout

commit d2a0b18
Author: Mariana Hans <you@example.com>
Date:   2026-05-12 11:55:00 -0600

    feat(auth): make browsing guest-friendly with optional sign-in

    - remove hard auth gating from the forum experience
    - keep voting as a signed-in action
    - present login and registration as optional enhancements
    - allow anonymous authorship where appropriate

commit c7a12be
Author: Mariana Hans <you@example.com>
Date:   2026-05-11 14:42:00 -0600

    docs: add architecture notes and portfolio-focused README

    - document local Bun workflow
    - explain why the app keeps a relational database
    - capture architecture tradeoffs and current limitations
    - frame the repo around portfolio review and demoability

commit b5d4ef0
Author: Mariana Hans <you@example.com>
Date:   2026-05-10 17:05:00 -0600

    feat(seed): expand demo content with channels, users, and replies

    - add a richer seeding script for sample forum data
    - create demo users and more realistic seeded discussions
    - populate multiple channels and reply chains for reviewability

commit a426fcb
Author: Mariana Hans <you@example.com>
Date:   2026-05-10 12:18:00 -0600

    refactor(backend): split config, auth, db, schema, and repository concerns

    - extract environment config into config.js
    - share password helpers through auth.js
    - separate DB bootstrap and schema creation
    - move forum persistence logic into a repository layer

commit 97bc4dd
Author: Mariana Hans <you@example.com>
Date:   2026-05-09 18:33:00 -0600

    feat(db): auto-create database and schema during backend startup

    - bootstrap the configured database if it does not exist
    - keep table creation on startup for easier onboarding
    - improve local setup by reducing manual MySQL steps

commit 845ef13
Author: Mariana Hans <you@example.com>
Date:   2026-05-09 10:08:00 -0600

    chore(runtime): move local workflow from Docker to Bun

    - remove Docker-first development flow
    - update scripts to use Bun locally
    - add Bun lockfiles and root workspace commands
    - document the new run/install process

commit 6f0d2a7
Author: Mariana Hans <you@example.com>
Date:   2026-05-08 15:26:00 -0600

    feat(forum): add search, rating, uploads, and richer thread interactions

    - support question search from the main forum view
    - add question rating endpoints and frontend controls
    - support screenshot uploads for questions
    - improve question detail and reply workflows

commit 48cd813
Author: Mariana Hans <you@example.com>
Date:   2026-05-08 11:14:00 -0600

    feat(auth): add registration, login, JWT sessions, and user identity

    - implement user registration and login routes
    - issue JWTs for authenticated requests
    - store client identity in localStorage
    - connect frontend forms to auth endpoints

commit 2d9e5b4
Author: Mariana Hans <you@example.com>
Date:   2026-05-07 16:40:00 -0600

    feat(api): build Express and MySQL forum backend

    - create routes for channels, questions, replies, and ratings
    - connect the server to MySQL through mysql2
    - add upload handling and base data modeling for the forum

commit 13bb0fe
Author: Mariana Hans <you@example.com>
Date:   2026-05-07 10:22:00 -0600

    feat(frontend): scaffold React forum client with channels and question flows

    - set up the React application structure
    - add channel browsing and question listing
    - create question and reply forms
    - wire frontend views to the backend API
```

## If you want to replay this history in a fresh repo

You can use the commit messages above as a guide and create a cleaner commit history manually as you move this code into the correct repository. A practical version is:

1. Create the new repo and copy this project into it.
2. Make a first commit with the initial full-stack scaffold.
3. Recreate the major milestones in 6 to 10 grouped commits instead of trying to split every tiny file move.
4. Use the `git log --oneline` section above as your commit title list.

If you want, this can also be compressed into a shorter 6-commit history for a cleaner public portfolio repo.
