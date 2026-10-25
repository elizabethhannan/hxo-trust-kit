// Loads every story in light and dark, collects console/page errors and runs axe-core.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import(process.env.PLAYWRIGHT_PATH ?? '/opt/npm-tools/node_modules/playwright/index.mjs')); }

const root = resolve('storybook-static');
const axeSrc = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try { const b = await readFile(join(root, p === '/' ? 'index.html' : p)); res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const index = JSON.parse(await readFile(join(root, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter(e => e.type === 'story');

const browser = await chromium.launch();
const failures = []; let runs = 0;
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  let errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  for (const s of stories) {
    errs = []; runs++;
    await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`);
    await page.waitForSelector('#storybook-root > *', { timeout: 15000 });
    await page.waitForTimeout(150);
    const dt = await page.evaluate(() => document.documentElement.dataset.theme);
    if (dt !== theme) errs.push(`theme attribute is ${dt}`);
    await page.evaluate(axeSrc);
    const v = await page.evaluate(async () => (await window.axe.run('#storybook-root', { resultTypes: ['violations'] })).violations
      .filter(x => x.impact === 'serious' || x.impact === 'critical').map(x => `${x.impact} ${x.id}: ${x.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`));
    if (errs.length || v.length) failures.push({ story: s.id, theme, errors: errs, axe: v });
  }
  await page.close();
}
await browser.close(); server.close();
console.log(`${stories.length} stories × 2 themes = ${runs} runs; ${failures.length} with problems`);
for (const f of failures) console.log(JSON.stringify(f));
process.exit(failures.length ? 1 : 0);
