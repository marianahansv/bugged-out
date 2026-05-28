// starts the full local development environment.
// this file runs the backend and frontend together from one root-level command
// and stops both child processes when the dev session ends.

const services = [
  {
    name: 'backend',
    command: ['bun', 'run', 'dev'],
    cwd: './backend',
    env: {},
  },
  {
    name: 'frontend',
    command: ['bun', 'run', 'dev'],
    cwd: './frontend',
    env: {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    },
  },
];

const children = services.map(({ name, command, cwd, env }) => {
  console.log(`[${name}] starting ${command.join(' ')} in ${cwd}`);

  return Bun.spawn(command, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  });
});

let isShuttingDown = false;

function stopAll(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const child of children) {
    child.kill();
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

Promise.race(children.map((child) => child.exited)).then((exitCode) => {
  stopAll(exitCode ?? 0);
});
