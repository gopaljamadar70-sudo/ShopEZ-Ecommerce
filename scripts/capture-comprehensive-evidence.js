import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const CDP_PORT = 9222;
const EVIDENCE_DIR = 'C:\\ShopEZ\\Shopez_Documentation_Evidence';
const SCREENSHOT_DIR = path.join(EVIDENCE_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function launchChrome() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpProfile = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_cdp_comp_' + Date.now());

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

  await new Promise((r) => setTimeout(r, 1600));

  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshot.data, 'base64');
  const outPath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`[Captured] ${filename} (${buffer.length} bytes, ${width}x${height})`);
}

async function run() {
  console.log('[Pipeline] Starting comprehensive screenshot capture...');

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

  // 3. Get Seeded Products
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
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
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

  // Admin mark shipped/delivered
  await fetch(`http://localhost:5000/api/orders/${createdOrderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Delivered', trackingNumber: 'TRK-98234-SPZ' }),
  });

  console.log(`[Pipeline] Seeded order #${createdOrderId} for John Doe.`);

  const chromeProc = launchChrome();

  try {
    await waitForCDP();
    console.log('[Pipeline] Connected to Chrome CDP.');

    let tab;
    try {
      const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await listRes.json();
      tab = list.find((t) => t.type === 'page');
    } catch {}

    if (!tab) {
      const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
      tab = await newTabRes.json();
    }

    const client = createCDPClient(tab.webSocketDebuggerUrl);
    await client.waitReady();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // Clear local storage for public views
    const clearStorage = async () => {
      await client.send('Runtime.evaluate', {
        expression: `localStorage.clear();`,
      });
    };

    // Set Customer session
    const setCustomerSession = async () => {
      await client.send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('shopez_token', ${JSON.stringify(userToken)});
          localStorage.setItem('shopez_user', ${JSON.stringify(JSON.stringify(userObj))});
          localStorage.setItem('shopez_selected_product', ${JSON.stringify(firstProd._id)});
          localStorage.setItem('shopez_last_order', ${JSON.stringify(createdOrderId)});
        `,
      });
    };

    // Set Admin session
    const setAdminSession = async () => {
      await client.send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('shopez_token', ${JSON.stringify(adminToken)});
          localStorage.setItem('shopez_user', ${JSON.stringify(JSON.stringify(adminUser))});
          localStorage.setItem('shopez_selected_product', ${JSON.stringify(firstProd._id)});
          localStorage.setItem('shopez_last_order', ${JSON.stringify(createdOrderId)});
        `,
      });
    };

    // 01_Homepage.png
    console.log('Capturing 01_Homepage.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await clearStorage();
    await client.send('Page.reload');
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '01_Homepage.png', 1366, 768);

    // 02_Product_Listing.png (Electronics category filtered)
    console.log('Capturing 02_Product_Listing.png...');
    await client.send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Electronics'));
        if (btn) btn.click();
      `,
    });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreen(client, '02_Product_Listing.png', 1366, 768);

    // 03_Search_and_Filtering.png
    console.log('Capturing 03_Search_and_Filtering.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await new Promise((r) => setTimeout(r, 1200));
    await client.send('Runtime.evaluate', {
      expression: `
        const input = document.querySelector('input[type="text"]');
        if (input) {
          input.value = 'Wireless';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `,
    });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreen(client, '03_Search_and_Filtering.png', 1366, 768);

    // 04_Product_Details.png
    console.log('Capturing 04_Product_Details.png...');
    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('shopez_selected_product', ${JSON.stringify(firstProd._id)});`,
    });
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/product-detail' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '04_Product_Details.png', 1366, 768);

    // 05_Registration_Page.png
    console.log('Capturing 05_Registration_Page.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/register' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreen(client, '05_Registration_Page.png', 1366, 768);

    // 06_Login_Page.png
    console.log('Capturing 06_Login_Page.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/login' });
    await new Promise((r) => setTimeout(r, 1500));
    await captureScreen(client, '06_Login_Page.png', 1366, 768);

    // Set Customer session for checkout, cart, history, profile
    await setCustomerSession();

    // 07_Shopping_Cart.png (with items & coupon)
    console.log('Capturing 07_Shopping_Cart.png...');
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
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/cart' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '07_Shopping_Cart.png', 1366, 768);

    // 08_Checkout_and_Address.png
    console.log('Capturing 08_Checkout_and_Address.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/checkout' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '08_Checkout_and_Address.png', 1366, 768);

    // 09_Order_Confirmation.png
    console.log('Capturing 09_Order_Confirmation.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/order-success' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '09_Order_Confirmation.png', 1366, 768);

    // 10_Order_History.png
    console.log('Capturing 10_Order_History.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/orders' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '10_Order_History.png', 1366, 768);

    // 11_User_Profile.png
    console.log('Capturing 11_User_Profile.png...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/profile' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '11_User_Profile.png', 1366, 768);

    // Set Admin session for Admin screens
    await setAdminSession();
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/admin' });
    await client.send('Page.reload');
    await new Promise((r) => setTimeout(r, 2200));

    // 12_Admin_Dashboard.png (Overview & KPIs)
    console.log('Capturing 12_Admin_Dashboard.png...');
    await captureScreen(client, '12_Admin_Dashboard.png', 1366, 768);

    // 13_Admin_Product_Management.png (Admin Product Catalog & Add Product Modal)
    console.log('Capturing 13_Admin_Product_Management.png...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add New Product'));
          if (addBtn) addBtn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1200));
    await captureScreen(client, '13_Admin_Product_Management.png', 1366, 768);

    // Close modal if open
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel'));
          if (cancelBtn) cancelBtn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 600));

    // 14_Admin_Order_Management.png (Customer Orders management tab)
    console.log('Capturing 14_Admin_Order_Management.png...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const ordersBtn = btns.find(b => b.innerText.includes('Customer Orders'));
          if (ordersBtn) {
            ordersBtn.click();
            ordersBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          }
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1600));
    await captureScreen(client, '14_Admin_Order_Management.png', 1366, 768);

    // 15_Responsive_Mobile.png (390x844 viewport)
    console.log('Capturing 15_Responsive_Mobile.png...');
    await clearStorage();
    await client.send('Page.navigate', { url: 'http://localhost:5173/#/home' });
    await new Promise((r) => setTimeout(r, 2000));
    await captureScreen(client, '15_Responsive_Mobile.png', 390, 844);

    client.close();
    console.log('[Pipeline] All 15 screenshots successfully captured!');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});
