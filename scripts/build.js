'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const pages = [
  'index.html', 'collection.html', 'checkout.html',
  'sunset-crush.html', 'cupids-bubblegum.html',
  'lavender-love-letter.html', 'bubble-boba.html', 'sundae.html',
  'styles.css', 'app.js', 'product.js'
];

fs.mkdirSync(output, { recursive: true });
for (const file of pages) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
console.log('Website prepared in dist/ for Netlify.');
