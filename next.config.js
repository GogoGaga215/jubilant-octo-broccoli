/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
}
module.exports = nextConfig
