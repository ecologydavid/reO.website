// Prerender: after `vite build`, open every page of the built site in headless Chrome and save the HTML it renders
// to dist/<path>/index.html, so each page is a real file with its own title, description, canonical and content.
// Search engines and AI crawlers read these files directly; visitors get the same HTML first, then the app takes over.
//
//   node tools/prerender.mjs            (run by `pnpm build`)
//   node tools/prerender.mjs faq        only the routes whose address contains "faq" (for a quick check)
//   CHROME_PATH=/path/to/chrome         override the browser
//   BASE_PATH=/repo/  SITE_URL=https://… as for the Vite build (sub-path hosting, absolute URLs in sitemap.xml)
//
// dist/404.html keeps the plain app shell: hosts that serve it for unknown addresses (GitHub Pages) still open any
// route, e.g. the plaque studio (/studio/A/), which is not prerendered.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), dist = path.join(root, 'dist');
const base = process.env.BASE_PATH || '/', site = (process.env.SITE_URL || '').replace(/\/$/, '');
const index = JSON.parse(fs.readFileSync(path.join(root, 'src/data/content-index.json'), 'utf8'));
// Same mapping as src/router.js toPath, without the base.
const toPath = name => { let p = name.slice(2).split('?')[0]; if (p.startsWith('read/')) p = p.slice(5); p = p.replace(/\/+$/, ''); return p ? p + '/' : ''; };
const routes = [...new Set(['', 'brands/', ...['standard', 'products', 'cases', 'materials', 'journal'].map(c => `explore/${c}/`), ...index.pages.map(p => toPath(p.path))])];
const only = process.argv[2];
const list = only ? routes.filter(r => decodeURIComponent(r).includes(only)) : routes;

// The plain shell, kept from the first run (later runs overwrite index.html with the prerendered home page).
const shellFile = path.join(dist, '404.html');
if (!only || !fs.existsSync(shellFile)) fs.copyFileSync(path.join(dist, 'index.html'), shellFile);
const shell = fs.readFileSync(shellFile);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.bin': 'application/octet-stream', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml'};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  p = p.startsWith(base) ? p.slice(base.length) : p.replace(/^\//, '');
  const file = path.join(dist, p);
  // Always the plain shell for pages, so a page is rendered fresh even when an earlier run left its HTML in dist.
  if (!path.extname(p) || !file.startsWith(dist) || !fs.existsSync(file)) { res.writeHead(200, {'content-type': types['.html']}); return res.end(shell); }
  res.writeHead(200, {'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const chromePath = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
if (!chromePath) { console.error('prerender: no Chrome found; set CHROME_PATH'); process.exit(1); }
const port = 9400 + Math.floor(Math.random() * 400), profile = fs.mkdtempSync(path.join(dist, '.prerender-'));
const chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--hide-scrollbars', '--window-size=1440,900', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 80 && !targets?.length; i++) { await sleep(250); try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch {} }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const evaluate = async expression => (await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true})).result?.result?.value;
await send('Page.enable');

// Ready when the page has set its own title and address (src/seo.js) and nothing is still loading.
const ready = address => `decodeURIComponent(document.documentElement.dataset.page||'')===decodeURIComponent(${JSON.stringify(address)})&&!document.querySelector('.app-loading,.content-loading')&&!!document.querySelector('main')`;
// The saved page: what a visitor sees before the app starts. Runtime-only marks are removed so it starts clean.
const snapshot = `(()=>{const d=document.documentElement.cloneNode(true);delete d.dataset.page;d.querySelectorAll('[data-count]').forEach(e=>{e.textContent=e.dataset.count});d.querySelectorAll('.site-header-v5').forEach(h=>h.classList.remove('is-condensed','is-hidden'));d.querySelectorAll('link[rel=preload][as=image],body noscript').forEach(l=>l.remove());return '<!doctype html>\\n'+d.outerHTML})()`;

let done = 0;
const failed = [], started = Date.now();
for (const route of list) {
  const address = base + route;
  await send('Page.navigate', {url: origin + address});
  let ok = false;
  for (let i = 0; i < 80 && !ok; i++) { await sleep(100); ok = await evaluate(ready(address)); }
  if (!ok) { failed.push(route); continue; }
  await sleep(120);
  const html = await evaluate(snapshot);
  const out = path.join(dist, decodeURIComponent(route), 'index.html');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, html);
  if (++done % 25 === 0) console.log(`prerender: ${done}/${list.length}`);
}
ws.close();
chrome.kill();
server.close();
await sleep(400);
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}
if (site && !only) {
  const today = new Date().toISOString().slice(0, 10), pages = list.filter(r => !failed.includes(r) && r !== 'brands/');
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(r => ` <url><loc>${site}/${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
}
console.log(`prerender: ${done} pages in ${((Date.now() - started) / 1000).toFixed(0)}s` + (failed.length ? `; NOT rendered (${failed.length}): ${failed.map(decodeURIComponent).join(', ')}` : ''));
process.exit(failed.length > list.length * 0.1 ? 1 : 0);
