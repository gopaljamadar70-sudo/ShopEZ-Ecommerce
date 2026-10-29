import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLOUDFLARED_EXE = 'C:\\ShopEZ\\scripts\\tools\\cloudflared.exe';
const LOG_FILE = 'C:\\ShopEZ\\live-preview.log';
const URL_FILE = 'C:\\ShopEZ\\live-domain.txt';

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  logStream.write(line);
}

log('Starting ShopEZ Full-Stack Application & Public Tunnel...');

// 1. Start Backend
const backendProc = spawn('node', ['src/server.js'], {
  cwd: 'C:\\ShopEZ\\backend',
  stdio: ['ignore', 'pipe', 'pipe'],
});
backendProc.stdout.on('data', d => logStream.write(`[BACKEND] ${d}`));
backendProc.stderr.on('data', d => logStream.write(`[BACKEND ERR] ${d}`));
log(`Backend process spawned (PID: ${backendProc.pid})`);

// 2. Start Frontend
const frontendProc = spawn('cmd.exe', ['/c', 'npm run dev'], {
  cwd: 'C:\\ShopEZ\\frontend',
  stdio: ['ignore', 'pipe', 'pipe'],
});
frontendProc.stdout.on('data', d => logStream.write(`[FRONTEND] ${d}`));
frontendProc.stderr.on('data', d => logStream.write(`[FRONTEND ERR] ${d}`));
log(`Frontend process spawned (PID: ${frontendProc.pid})`);

// Wait for servers to be ready
async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
  return false;
}

async function main() {
  log('Waiting for backend on http://localhost:5000/api/health...');
  const backendReady = await waitForServer('http://localhost:5000/api/health');
  log(`Backend ready: ${backendReady}`);

  log('Waiting for frontend on http://localhost:5173/...');
  const frontendReady = await waitForServer('http://localhost:5173/');
  log(`Frontend ready: ${frontendReady}`);

  if (!frontendReady) {
    log('Warning: Frontend did not respond in time, proceeding with tunnel anyway...');
  }

  // 3. Start Cloudflare Tunnel
  log('Starting Cloudflare Tunnel on http://localhost:5173...');
  const cfProc = spawn(CLOUDFLARED_EXE, ['tunnel', '--url', 'http://localhost:5173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let cfUrl = null;
  cfProc.stderr.on('data', (d) => {
    const text = d.toString();
    logStream.write(`[CF] ${text}`);
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !cfUrl) {
      cfUrl = match[0];
      log(`>>> CLOUDFLARE PUBLIC DOMAIN READY: ${cfUrl} <<<`);
      fs.writeFileSync(URL_FILE, `PRIMARY PUBLIC DOMAIN (Cloudflare):\n${cfUrl}\n\n`);
    }
  });

  // 4. Start LocalTunnel as fallback
  log('Starting LocalTunnel fallback on http://localhost:5173...');
  const ltProc = spawn('cmd.exe', ['/c', 'npx --yes localtunnel --port 5173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  ltProc.stdout.on('data', async (d) => {
    const text = d.toString();
    logStream.write(`[LT] ${text}`);
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.loca\.lt/);
    if (match) {
      const ltUrl = match[0];
      log(`>>> LOCALTUNNEL FALLBACK DOMAIN READY: ${ltUrl} <<<`);
      try {
        const ipRes = await fetch('https://loca.lt/mytunnelpassword');
        const ip = await ipRes.text();
        fs.appendFileSync(URL_FILE, `BACKUP PUBLIC DOMAIN (LocalTunnel):\n${ltUrl}\nTunnel Password: ${ip.trim()}\n\n`);
      } catch {
        fs.appendFileSync(URL_FILE, `BACKUP PUBLIC DOMAIN (LocalTunnel):\n${ltUrl}\n\n`);
      }
    }
  });

  // Keep process alive indefinitely
  process.on('SIGINT', () => {
    try { backendProc.kill(); } catch {}
    try { frontendProc.kill(); } catch {}
    try { cfProc.kill(); } catch {}
    try { ltProc.kill(); } catch {}
    process.exit();
  });
}

main().catch(err => {
  log(`Error in orchestrator: ${err.message}`);
});
