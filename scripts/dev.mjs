import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';

const processes = [
  spawn('npm', ['run', 'dev'], { cwd: './backend', stdio: 'inherit', shell: isWindows }),
  spawn('npm', ['run', 'dev'], { cwd: './frontend', stdio: 'inherit', shell: isWindows }),
];

const shutdown = () => {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

for (const child of processes) {
  child.on('exit', code => {
    if (code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
}
