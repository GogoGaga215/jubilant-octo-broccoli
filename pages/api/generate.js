const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, destUrl } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Go to Platorelay/Platoboost login
    await page.goto('https://platoboost.com/login', { waitUntil: 'networkidle2', timeout: 30000 });

    // Fill login
    await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 10000 });
    await page.type('input[type="email"], input[name="email"], #email', email);
    await page.type('input[type="password"], input[name="password"], #password', password);

    // Click login button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
      page.click('button[type="submit"], .btn-primary, button:has-text("Login"), button:has-text("Sign in")').catch(() => {
        // Try pressing Enter instead
        return page.keyboard.press('Enter');
      }),
    ]);

    // Check if logged in (look for dashboard elements)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Login failed — check credentials');
    }

    // Navigate to link creation page
    await page.goto('https://platoboost.com/dashboard/links/create', { waitUntil: 'networkidle2', timeout: 30000 });

    // Fill destination URL
    await page.waitForSelector('input[placeholder*="URL"], input[name="url"], input[name="destination"], textarea', { timeout: 10000 });
    await page.type('input[placeholder*="URL"], input[name="url"], input[name="destination"], textarea', destUrl || 'https://example.com');

    // Click generate/create button
    await page.click('button:has-text("Create"), button:has-text("Generate"), button:has-text("Save"), .btn-primary').catch(() => {
      return page.keyboard.press('Enter');
    });

    // Wait for result
    await page.waitForTimeout(3000);

    // Try to extract the generated link from the page
    const link = await page.evaluate(() => {
      // Look for auth.platorelay.com or gateway.platoboost.com links
      const links = Array.from(document.querySelectorAll('a[href*="platorelay"], a[href*="platoboost"], input[value*="platorelay"], input[value*="platoboost"], .link-output, .generated-url'));
      if (links.length > 0) {
        return links[0].href || links[0].value || links[0].textContent;
      }
      // Check clipboard copy buttons
      const copyBtns = Array.from(document.querySelectorAll('button'));
      for (const btn of copyBtns) {
        if (btn.textContent.toLowerCase().includes('copy')) {
          const parent = btn.closest('.card, .box, .result, .link-item, [class*="link"]');
          if (parent) {
            const urlEl = parent.querySelector('a, input, .url, [class*="url"]');
            if (urlEl) return urlEl.href || urlEl.value || urlEl.textContent;
          }
        }
      }
      return null;
    });

    if (!link) {
      // Take screenshot for debugging
      const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
      throw new Error('Could not extract generated link. Dashboard layout may have changed.');
    }

    return res.status(200).json({
      url: link,
      tokenLength: link.split('d=')[1]?.length || 484,
      validFor: '24h',
    });

  } catch (error) {
    console.error('Automation error:', error);
    return res.status(500).json({
      error: error.message || 'Automation failed',
      hint: 'Platorelay/Platoboost dashboard may have changed. Check if you need to verify email first, or if 2FA is enabled.',
    });
  } finally {
    if (browser) await browser.close();
  }
                                                                                                                    }
