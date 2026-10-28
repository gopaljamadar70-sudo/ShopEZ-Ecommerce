import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const CDP_PORT = 9222;
const SCREENSHOT_DIR = 'C:\\ShopEZ\\documentation-evidence\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function launchChrome() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpProfile = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_cdp_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  return chromeProc;
}

async function waitForCDP(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Chrome CDP port 9222 did not become ready.');
}

function createCDPClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) {
        cb.reject(new Error(data.error.message));
      } else {
        cb.resolve(data.result);
      }
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  const waitReady = () => {
    return new Promise((resolve) => {
      if (ws.readyState === WebSocket.OPEN) return resolve();
      ws.onopen = () => resolve();
    });
  };

  const close = () => {
    try {
      ws.close();
    } catch {}
  };

  return { send, waitReady, close };
}

async function captureScreen(client, filename, width = 1366, height = 768) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });

  await new Promise((r) => setTimeout(r, 1800)); // Allow rendering to settle

  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshot.data, 'base64');
  const outPath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`[Captured] ${filename} (${buffer.length} bytes, ${width}x${height})`);
}

async function run() {
  console.log('[Capture Pipeline] Spawning headless Chrome instance...');
  const chromeProc = launchChrome();

  try {
    await waitForCDP();
    console.log('[Capture Pipeline] Connected to Chrome DevTools Protocol at port 9222.');

    console.log('[Capture Pipeline] Fetching authentic demo authentication tokens and data from API...');

    // 1. Authenticate Admin
    const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shopez.com', password: 'password123' }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.data.token;
    const adminUser = adminData.data;

    // 2. Authenticate Customer John
    const userLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'password123' }),
    });
    const userData = await userLoginRes.json();
    const userToken = userData.data.token;
    const userObj = userData.data;

    // 3. Get Products
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prods = (await prodRes.json()).data;
    const firstProd = prods[0];
    const secondProd = prods[1];

    // 4. Create an authentic order for Customer John to show in Order Success and History
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        orderItems: [
          { product: firstProd._id, qty: 1 },
          { product: secondProd._id, qty: 2 },
        ],
        shippingAddress: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
        },
        paymentMethod: 'Credit Card',
        couponCode: 'WELCOME10',
      }),
    });
    const orderData = await orderRes.json();
    const createdOrderId = orderData.data._id;

    // Pay order
    await fetch(`http://localhost:5000/api/orders/${createdOrderId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ id: `TXN_${Date.now()}_CONFIRMED`, status: 'COMPLETED' }),
    });

    // Admin mark shipped/delivered for demonstration
    await fetch(`http://localhost:5000/api/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Delivered', trackingNumber: 'TRK-98234-SPZ' }),
    });

    console.log(`[Capture Pipeline] Authentic order created & paid: #${createdOrderId}`);

    // Create new CDP Tab or use existing page tab
    let tab;
    try {
      const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await listRes.json();
      tab = list.find((t) => t.type === 'page');
    } catch (e) {
      console.log('Could not list pages:', e.message);
    }

    if (!tab) {
      const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
      tab = await newTabRes.json();
    }
    const client = createCDPClient(tab.webSocketDebuggerUrl);
    await client.waitReady();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // SCREENSHOT 1: 01-home-or-landing.png
    console.log('[Capture] 01-home-or-landing.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '01-home-or-landing.png', 1366, 768);

    // SCREENSHOT 2: 02-signup.png
    console.log('[Capture] 02-signup.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/register' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreen(client, '02-signup.png', 1366, 768);

    // SCREENSHOT 3: 03-login.png
    console.log('[Capture] 03-login.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/login' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreen(client, '03-login.png', 1366, 768);

    // Set logged-in customer in localStorage
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('shopez_token', ${JSON.stringify(userToken)});
        localStorage.setItem('shopez_user', ${JSON.stringify(JSON.stringify(userObj))});
        localStorage.setItem('shopez_selected_product', ${JSON.stringify(firstProd._id)});
        localStorage.setItem('shopez_last_order', ${JSON.stringify(createdOrderId)});
      `,
    });

    // SCREENSHOT 4: 04-main-dashboard.png (Authenticated customer session)
    console.log('[Capture] 04-main-dashboard.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '04-main-dashboard.png', 1366, 768);

    // Setup rich cart with coupon for primary-feature-input
    const sampleCart = [
      {
        product: firstProd._id,
        name: firstProd.name,
        image: firstProd.images[0],
        price: firstProd.price,
        countInStock: firstProd.countInStock,
        qty: 1,
      },
      {
        product: secondProd._id,
        name: secondProd.name,
        image: secondProd.images[0],
        price: secondProd.price,
        countInStock: secondProd.countInStock,
        qty: 2,
      },
    ];

    const sampleCoupon = {
      code: 'WELCOME10',
      discountPercentage: 10,
      discountAmount: Number(((firstProd.price + secondProd.price * 2) * 0.1).toFixed(2)),
    };

    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('shopez_cart', ${JSON.stringify(JSON.stringify(sampleCart))});
        localStorage.setItem('shopez_coupon', ${JSON.stringify(JSON.stringify(sampleCoupon))});
      `,
    });

    // SCREENSHOT 5: 05-primary-feature-input.png (Shopping Cart with coupon & pricing summary)
    console.log('[Capture] 05-primary-feature-input.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/cart' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '05-primary-feature-input.png', 1366, 768);

    // SCREENSHOT 6: 06-primary-feature-result.png (Order receipt & confirmation)
    console.log('[Capture] 06-primary-feature-result.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/order-success' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '06-primary-feature-result.png', 1366, 768);

    // SCREENSHOT 7: 07-history-or-records.png (Customer order history ledger)
    console.log('[Capture] 07-history-or-records.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/orders' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '07-history-or-records.png', 1366, 768);

    // Set logged-in Admin in localStorage
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('shopez_token', ${JSON.stringify(adminToken)});
        localStorage.setItem('shopez_user', ${JSON.stringify(JSON.stringify(adminUser))});
      `,
    });

    // SCREENSHOT 8: 08-admin-or-settings.png (Admin console with KPI revenue cards & CRUD)
    console.log('[Capture] 08-admin-or-settings.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/admin' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '08-admin-or-settings.png', 1366, 768);

    // SCREENSHOT 9: 09-responsive-mobile.png (Mobile Viewport 390x844)
    console.log('[Capture] 09-responsive-mobile.png');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '09-responsive-mobile.png', 390, 844);

    client.close();
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${tab.id}`).catch(() => {});
    console.log('[Capture Pipeline] All 9 genuine screenshots successfully captured!');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

run().catch((err) => {
  console.error('[Capture Error]:', err);
  process.exit(1);
});
