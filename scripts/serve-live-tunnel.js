import { spawn } from 'child_process';
import fs from 'fs';

const CLOUDFLARED = 'C:\\ShopEZ\\scripts\\tools\\cloudflared.exe';
const URL_FILE = 'C:\\ShopEZ\\live-public-url.txt';

console.log('[ShopEZ Live] Booting full-stack services...');

// 1. Start Backend Server
const backend = spawn('node', ['src/server.js'], {
  cwd: 'C:\\ShopEZ\\backend',
  stdio: ['ignore', 'pipe', 'pipe'],
});
backend.stdout.on('data', d => process.stdout.write(`[BE] ${d}`));
backend.stderr.on('data', d => process.stderr.write(`[BE ERR] ${d}`));

// 2. Start Frontend Vite Server
const frontend = spawn('cmd.exe', ['/c', 'npm run dev'], {
  cwd: 'C:\\ShopEZ\\frontend',
  stdio: ['ignore', 'pipe', 'pipe'],
});
frontend.stdout.on('data', d => process.stdout.write(`[FE] ${d}`));
frontend.stderr.on('data', d => process.stderr.write(`[FE ERR] ${d}`));

async function waitReady(url, maxRetries = 25) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
  return false;
}

async function startTunnel() {
  console.log('[ShopEZ Live] Waiting for local servers to be responsive...');
  const beOk = await waitReady('http://localhost:5000/api/health');
  console.log(`[ShopEZ Live] Backend (port 5000) active: ${beOk}`);

  const feOk = await waitReady('http://localhost:5173/');
  console.log(`[ShopEZ Live] Frontend (port 5173) active: ${feOk}`);

  console.log('[ShopEZ Live] Connecting Cloudflare Tunnel...');
  const cf = spawn(CLOUDFLARED, ['tunnel', '--url', 'http://localhost:5173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let publicUrl = null;
  cf.stderr.on('data', async (d) => {
    const text = d.toString();
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g);
    if (match) {
      for (const m of match) {
        if (!m.includes('api.trycloudflare.com') && !publicUrl) {
          publicUrl = m;
          console.log('\n============================================================');
          console.log(`>>> VERIFIED PUBLIC DOMAIN: ${publicUrl} <<<`);
          console.log('============================================================\n');
          fs.writeFileSync(URL_FILE, publicUrl);

          // Test public URL
          setTimeout(async () => {
            try {
              const testRes = await fetch(publicUrl);
              console.log(`[ShopEZ Live] Public domain verification: HTTP ${testRes.status} ${testRes.statusText}`);
            } catch (err) {
              console.log(`[ShopEZ Live] Waiting for DNS propagation: ${err.message}`);
            }
          }, 3000);
        }
      }
    }
  });

  cf.on('exit', (code) => {
    console.log(`[ShopEZ Live] Cloudflare tunnel exited with code ${code}. Restarting in 3s...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
