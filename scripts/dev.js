/* Starts the mock EZFacility API and the site together; Ctrl+C stops both. */
import { spawn } from 'node:child_process';

// npm run dev -- --port 4180   (site port; the mock uses MOCK_EZ_PORT)
const i = process.argv.indexOf('--port');
const env = { ...process.env, ...(i > -1 ? { PORT: process.argv[i + 1] } : {}) };

const procs = [
  ['mock-ez', 'mock-ezfacility/server.js'],
  ['site', 'server/app.js'],
].map(([name, file]) => {
  const p = spawn(process.execPath, [file], { stdio: ['ignore', 'pipe', 'pipe'], env });
  const tag = line => line && console.log(`[${name}] ${line}`);
  p.stdout.on('data', d => String(d).trimEnd().split('\n').forEach(tag));
  p.stderr.on('data', d => String(d).trimEnd().split('\n').forEach(tag));
  p.on('exit', code => { console.log(`[${name}] exited (${code})`); shutdown(code ?? 1); });
  return p;
});

let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  procs.forEach(p => p.exitCode === null && p.kill());
  setTimeout(() => process.exit(code), 200);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
