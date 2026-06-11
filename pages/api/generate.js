const puppeteer = require("puppeteer-core");

let cachedBrowser = null;
let cachedPage = null;

async function getBrowser() {
  if (cachedBrowser) return { browser: cachedBrowser, page: cachedPage };

  const chromium = await import("@sparticuz/chromium").then(m => m.default || m);

  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-site-isolation-trials"
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  cachedBrowser = browser;
  cachedPage = page;
  return { browser, page };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, keyId } = req.body || {};
  if (!email || !password || !keyId) {
    return res.status(400).json({ error: "Missing email, password, or keyId" });
  }

  try {
    const { page } = await getBrowser();

    // 1. Login
    await page.goto("https://dashboard.platoboost.com/login", { waitUntil: "networkidle2", timeout: 30000 });
    await page.type('input[type="email"], input[name="email"]', email, { delay: 30 });
    await page.type('input[type="password"], input[name="password"]', password, { delay: 30 });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
    ]);

    // 2. Navigate to key page
    await page.goto(`https://dashboard.platoboost.com/keys/${keyId}`, { waitUntil: "networkidle2", timeout: 30000 });

    // 3. Click Generate Link
    const genBtn = await page.$('button:has-text("Generate"), [data-testid="generate-link"], .generate-link-btn');
    if (!genBtn) {
      return res.status(404).json({ error: "Generate button not found on page" });
    }
    await genBtn.click();

    // 4. Wait for link to appear
    await page.waitForFunction(() => {
      const el = document.querySelector('input[value*="auth.platorelay.com"], a[href*="auth.platorelay.com"], .link-output');
      return el && (el.value || el.href || el.textContent).includes("auth.platorelay.com");
    }, { timeout: 15000 });

    const link = await page.evaluate(() => {
      const el = document.querySelector('input[value*="auth.platorelay.com"], a[href*="auth.platorelay.com"], .link-output');
      return el.value || el.href || el.textContent;
    });

    return res.status(200).json({ success: true, link: link.trim() });
  } catch (err) {
    console.error("Automation error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
