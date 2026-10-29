import fs from 'fs';
import path from 'path';
import https from 'https';

const toolsDir = 'C:\\ShopEZ\\scripts\\tools';
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

const exePath = path.join(toolsDir, 'cloudflared.exe');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(exePath) || fs.statSync(exePath).size < 10000000) {
    console.log('Downloading cloudflared for Windows...');
    await downloadFile('https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe', exePath);
    console.log('Downloaded successfully! Size:', fs.statSync(exePath).size);
  } else {
    console.log('cloudflared already exists:', fs.statSync(exePath).size);
  }
}

main().catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
