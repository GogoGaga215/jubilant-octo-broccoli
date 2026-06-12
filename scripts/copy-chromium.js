const fs = require('fs');
const path = require('path');

// Find the chromium pack tar in node_modules
const chromiumPackPath = path.join(
  process.cwd(),
  'node_modules',
  '@sparticuz',
  'chromium',
  'bin',
  'chromium-pack.tar'
);

const publicDir = path.join(process.cwd(), 'public');
const destPath = path.join(publicDir, 'chromium-pack.tar');

if (fs.existsSync(chromiumPackPath)) {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.copyFileSync(chromiumPackPath, destPath);
  console.log('Copied chromium-pack.tar to public/');
} else {
  console.log('chromium-pack.tar not found in node_modules, will use remote URL instead');
}

