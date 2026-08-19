const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gpx': 'application/gpx+xml; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Strip query string and hash
  const urlPath = req.url.split('?')[0].split('#')[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(DIR, safePath);
  let ext = path.extname(filePath).toLowerCase();

  // Special fallback for iOS Apple Touch Icons if requested with other names
  if (!fs.existsSync(filePath) && safePath.toLowerCase().includes('apple-touch-icon')) {
    filePath = path.join(DIR, 'apple-touch-icon.png');
    ext = '.png';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If it's a known static asset extension that doesn't exist, return 404 (do NOT return HTML!)
      if (ext && ext !== '.html') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      // Otherwise, fallback to index.html for SPA routing
      const indexFile = path.join(DIR, 'index.html');
      fs.readFile(indexFile, (e, data) => {
        if (e) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(data);
      });
      return;
    }

    // Serve static file
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isImage = ext === '.png' || ext === '.svg' || ext === '.ico' || ext === '.jpg';
    
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Error reading file');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': isImage ? 'public, max-age=86400' : 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚴 TrailGPS Web Server running at http://0.0.0.0:${PORT}`);
});
