// Post-build: embed all images from /public into the single HTML file as base64,
// so the app runs by simply double-clicking the .html file (no server needed).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const htmlIn = path.join(root, 'dist-single', 'index.html');
const htmlOut = path.join(root, 'dist-single', 'TrangNguyenDatViet.html');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });

const assets = {};
for (const file of walk(publicDir)) {
  const ext = path.extname(file).toLowerCase();
  const key = path.relative(publicDir, file).split(path.sep).join('/');
  let buf;
  let mime;
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    // Re-encode as JPEG (max 1920px wide) to keep the HTML file small
    buf = await sharp(file).resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    mime = 'image/jpeg';
  } else if (ext === '.svg') {
    buf = fs.readFileSync(file);
    mime = 'image/svg+xml';
  } else {
    continue;
  }
  assets[key] = `data:${mime};base64,${buf.toString('base64')}`;
  console.log(`  + ${key} (${Math.round(buf.length / 1024)} KB)`);
}

let html = fs.readFileSync(htmlIn, 'utf8');

// Inject asset map before any other script runs
const inject = `<script>window.__INLINE_ASSETS__=${JSON.stringify(assets)};</script>`;
html = html.replace('<head>', `<head>\n${inject}`);

// Replace favicon links with inlined versions
html = html
  .replace(/href="\.\/favicon\.svg"/g, `href="${assets['favicon.svg'] || ''}"`)
  .replace(/href="\.\/favicon\.png"/g, `href="${assets['favicon.png'] || ''}"`)
  .replace(/href="\.\/apple-touch-icon\.png"/g, `href="${assets['apple-touch-icon.png'] || ''}"`);

fs.writeFileSync(htmlOut, html);
fs.unlinkSync(htmlIn);
console.log(`\nDone: ${htmlOut} (${(fs.statSync(htmlOut).size / 1024 / 1024).toFixed(1)} MB)`);
