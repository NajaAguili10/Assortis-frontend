import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const htmlPath = resolve('dist/index.html');
const html = readFileSync(htmlPath, 'utf8');

if (html.includes('/src/main.tsx')) {
  throw new Error('dist/index.html points to /src/main.tsx. Production must serve the Vite build output.');
}

if (!/<script\s+[^>]*type="module"[^>]*src="\/assets\/[^"]+\.js"/.test(html)) {
  throw new Error('dist/index.html does not reference a built /assets/*.js module script.');
}

const assetsPath = resolve('dist/assets');
const jsAssets = readdirSync(assetsPath).filter((asset) => asset.endsWith('.js'));
const htmlJsAssets = [...html.matchAll(/src="\/assets\/([^"]+\.js)"/g)].map((match) => match[1]);
const moduleOnlyChunks = jsAssets.filter((asset) => {
  if (htmlJsAssets.includes(asset)) {
    return false;
  }

  const content = readFileSync(resolve(assetsPath, asset), 'utf8').trimStart();
  return /^(import|export)\b/.test(content) || /\nexport\s*\{/.test(content);
});

if (moduleOnlyChunks.length > 0) {
  throw new Error(`Production build contains module-only chunks not referenced by index.html: ${moduleOnlyChunks.join(', ')}`);
}

console.log('Production HTML check passed.');
