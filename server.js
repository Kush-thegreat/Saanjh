const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filename = path.resolve(root, relative);
  const isAllowed = ['index.html', 'checkout.html', 'collection.html', 'sunset-crush.html', 'cupids-bubblegum.html', 'lavender-love-letter.html', 'bubble-boba.html', 'sundae.html', 'product.js', 'styles.css', 'app.js', 'golden-hour.css', 'golden-hour.js', 'reviews.js', 'sunset-crush-reviews.html', 'cupids-bubblegum-reviews.html', 'lavender-love-letter-reviews.html', 'bubble-boba-reviews.html', 'sundae-reviews.html'].includes(relative) || (relative.startsWith('assets/') && ['.svg', '.png'].includes(path.extname(relative)));
  if (!filename.startsWith(root + path.sep) || !isAllowed) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(filename, (error, data) => {
    if (error) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
});
server.listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => console.log(`Local: http://localhost:${server.address().port}`));
