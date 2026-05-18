import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const htmlPath = resolve('dist/index.html');
const html = readFileSync(htmlPath, 'utf8');

if (html.includes('/src/main.tsx')) {
  throw new Error('dist/index.html points to /src/main.tsx. Production must serve the Vite build output.');
}

if (!/<script\s+[^>]*type="module"[^>]*src="\/assets\/[^"]+\.js"/.test(html)) {
  throw new Error('dist/index.html does not reference a built /assets/*.js module script.');
}

console.log('Production HTML check passed.');
