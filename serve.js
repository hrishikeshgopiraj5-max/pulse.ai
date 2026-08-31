/**
 * Pulse AI — Simple Static File Server for Development
 * Serves the frontend directory for local preview.
 * The API calls go to the live Render deployment.
 */
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Default to index.html for root
    if (pathname === '/') pathname = '/index.html';

    // Map clean URLs (e.g., /chat -> /chat.html)
    const filePath = path.join(FRONTEND_DIR, pathname);
    
    // Try exact path first, then .html extension
    let fullPath = filePath;
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      if (fs.existsSync(filePath + '.html')) {
        fullPath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        fullPath = path.join(filePath, 'index.html');
      } else {
        return new Response('Not Found', { status: 404 });
      }
    }

    const ext = path.extname(fullPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(fullPath);

    return new Response(content, {
      headers: { 'Content-Type': contentType },
    });
  },
});

console.log(`\n  ⚡ Pulse AI Frontend serving on http://localhost:${PORT}\n`);
