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
import crypto from 'node:crypto';
import {hashAssets, smallCopies} from './images.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), dist = path.join(root, 'dist');
const base = process.env.BASE_PATH || '/', site = (process.env.SITE_URL || '').replace(/\/$/, '');
const index = JSON.parse(fs.readFileSync(path.join(root, 'src/data/content-index.json'), 'utf8'));
// Same mapping as src/router.js toPath, without the base.
const toPath = name => { let p = name.slice(2).split('?')[0]; if (p.startsWith('read/')) p = p.slice(5); p = p.replace(/\/+$/, ''); return p ? p + '/' : ''; };
const routes = [...new Set(['', 'brands/', ...['standard', 'products', 'cases', 'materials', 'journal', 'support'].map(c => `explore/${c}/`), ...index.pages.filter(p => !/^#\/read\/products\/f款/i.test(decodeURIComponent(p.path))).map(p => toPath(p.path))])];
const only = process.argv[2];
const list = only ? routes.filter(r => decodeURIComponent(r).includes(only)) : routes;

// v1.2.2: before anything is rendered, photos in /assets/ get addresses that follow their content, and the built files
// are pointed at them (tools/images.mjs). Running it again on the same folder changes nothing.
{ const named = hashAssets(dist); console.log(`prerender: ${named.photos} photos named by content, ${named.files} files updated`); }

// The plain shell, kept from the first run (later runs overwrite index.html with the prerendered home page).
const shellFile = path.join(dist, '404.html');
if (!only || !fs.existsSync(shellFile)) fs.copyFileSync(path.join(dist, 'index.html'), shellFile);
const shell = fs.readFileSync(shellFile);
// The plaque studio is not prerendered (it is a tool, not a page to index), but each model gets the shell at its own
// address, so /studio/D/ answers 200 instead of reaching the app through the host's 404 page.
fs.mkdirSync(path.join(dist, 'admin'), {recursive: true}); fs.writeFileSync(path.join(dist, 'admin', 'index.html'), shell);
for (const id of 'ABCDE') { fs.mkdirSync(path.join(dist, 'studio', id), {recursive: true}); fs.writeFileSync(path.join(dist, 'studio', id, 'index.html'), shell); }
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
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Chrome on a busy build machine can take a while to open its debugging port (2026-11-18: the 20s wait ran out on
// GitHub's runner). Wait up to 60s, and start it once more if it never answers; its own messages are shown on failure.
let chrome, targets, chromeLog = '';
for (let attempt = 1; attempt <= 2 && !targets?.length; attempt++) {
  chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--hide-scrollbars', '--window-size=1440,900', 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
  chrome.stderr.on('data', d => { chromeLog = (chromeLog + d).slice(-4000); });
  for (let i = 0; i < 240 && !targets?.length; i++) { await sleep(250); try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch {} }
  if (!targets?.length) { console.error(`prerender: Chrome did not answer (attempt ${attempt})`); chrome.kill(); await sleep(1000); }
}
if (!targets?.length) { console.error('prerender: giving up. Chrome said:\n' + chromeLog); process.exit(1); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const evaluate = async expression => (await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true})).result?.result?.value;
await send('Page.enable');
{ const made = await smallCopies({dist, root, origin, base, send, evaluate}); console.log(`prerender: small copies for ${made.photos} photos (${made.made} new, ${made.seconds}s)` + (made.failed ? `; ${made.failed} could not be resized and use the original` : '')); }

// Ready when the page has set its own title and address (src/seo.js) and nothing is still loading.
const ready = address => `decodeURIComponent(document.documentElement.dataset.page||'')===decodeURIComponent(${JSON.stringify(address)})&&!document.querySelector('.app-loading,.content-loading')&&!!document.querySelector('main')`;
// The saved page: what a visitor sees before the app starts. Runtime-only marks are removed so it starts clean.
const snapshot = `(()=>{const d=document.documentElement.cloneNode(true);delete d.dataset.page;d.querySelectorAll('[data-count]').forEach(e=>{e.textContent=e.dataset.count});d.querySelectorAll('.site-header-v5').forEach(h=>h.classList.remove('is-condensed','is-hidden'));d.querySelectorAll('link[rel=preload][as=image],body noscript,link[data-late]').forEach(l=>l.remove());d.querySelectorAll('link[onload]').forEach(l=>{l.media='print'});return '<!doctype html>\\n'+d.outerHTML})()`;
// v1.2.1: the characters this page sets in the heading face (every element whose font list starts with "reO Serif",
// hidden menus and panels included), so the page can carry one small font holding just those.
const serifText = `(()=>{const s=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName))continue;if(getComputedStyle(p).fontFamily.includes('reO Serif'))for(const c of n.nodeValue)if(c.trim()&&c.codePointAt(0)>32)s.add(c)}return [...s].sort().join('')})()`;

let done = 0;
const failed = [], started = Date.now(), written = [];
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
  written.push({out, text: await evaluate(serifText) || ''});
  if (++done % 25 === 0) console.log(`prerender: ${done}/${list.length}`);
}
ws.close();
chrome.kill();
server.close();
await sleep(400);
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

// ── Heading font per page (v1.2.1) ─────────────────────────────────────────────────────────────────────────────
// Noto Serif TC as Google slices it cost a page 16+ files (about 1.5 MB) at top priority, ahead of the photos. Google
// can also cut the font down to a given text: each page gets one file with only its own heading characters (roughly
// 30 kB per 100 characters), saved under dist/fonts/ by content hash and declared in the page as "reO Serif", the
// first name in --tx-serif. Characters that are not in it (text that appears later, the next page after an in-site
// click) fall through to the full family, which index.html adds once the page has loaded.
// If Google cannot be reached the page is left as it is: headings then wait for the full family, as before.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const hash = data => crypto.createHash('sha1').update(data).digest('hex').slice(0, 18);
const ranges = text => { const cps = [...new Set([...text].map(c => c.codePointAt(0)))].sort((a, b) => a - b), out = []; for (let i = 0; i < cps.length; i++) { let j = i; while (cps[j + 1] === cps[j] + 1) j++; out.push('U+' + cps[i].toString(16) + (j > i ? '-' + cps[j].toString(16) : '')); i = j; } return out.join(','); };
async function fontFor(text) {
  const r = await fetch('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;600&display=swap&text=' + encodeURIComponent(text), {headers: {'user-agent': UA}});
  const blocks = (await r.text()).match(/@font-face\s*{[^}]*}/g) || [];
  // More than a handful of blocks means Google ignored the text (too long) and answered with the whole family.
  if (!r.ok || !blocks.length || blocks.length > 4) throw new Error('no subset for ' + text.length + ' characters');
  const faces = new Map();
  for (const b of blocks) { const url = b.match(/url\((https:[^)]+)\)/)?.[1], weight = b.match(/font-weight:\s*(\d+)/)?.[1]; if (!url || !weight) throw new Error('unreadable font rule'); faces.set(url, [...(faces.get(url) || []), +weight]); }
  let css = '', preload = '', bytes = 0;
  for (const [url, weights] of faces) {
    const data = Buffer.from(await (await fetch(url)).arrayBuffer());
    if (data.length < 500) throw new Error('empty font file');
    const file = `fonts/${hash(data)}.woff2`;
    fs.mkdirSync(path.join(dist, 'fonts'), {recursive: true});
    fs.writeFileSync(path.join(dist, file), data); bytes += data.length;
    const w = [...new Set(weights)].sort((a, b) => a - b);
    css += `@font-face{font-family:"reO Serif";font-style:normal;font-weight:${w.length > 1 ? w[0] + ' ' + w.at(-1) : w[0]};font-display:swap;src:url(${base}${file}) format("woff2");unicode-range:${ranges(text)}}`;
    preload += `<link rel="preload" as="font" type="font/woff2" href="${base}${file}" crossorigin>`;
  }
  return {css, preload, bytes};
}
const fontCache = new Map(), chunkSize = 450;
let fontPages = 0, fontBytes = 0, fontFailed = 0;
const queue = [...written];
await Promise.all(Array.from({length: 6}, async () => {
  for (let job; (job = queue.shift());) {
    if (!job.text) continue;
    try {
      // The space travels with the first part, so words in a heading are spaced by the same font.
      const chars = [...job.text], parts = [];
      for (let i = 0; i < chars.length; i += chunkSize) parts.push((i ? '' : ' ') + chars.slice(i, i + chunkSize).join(''));
      const made = await Promise.all(parts.map(p => { if (!fontCache.has(p)) fontCache.set(p, fontFor(p)); return fontCache.get(p); }));
      const head = made.map(m => m.preload).join('') + '<style id="reo-serif">' + made.map(m => m.css).join('') + '</style>';
      const html = fs.readFileSync(job.out, 'utf8');
      if (!html.includes('</head>')) throw new Error('no head');
      fs.writeFileSync(job.out, html.replace('</head>', head + '</head>'));
      fontPages++; fontBytes += made.reduce((a, m) => a + m.bytes, 0);
    } catch (e) { fontFailed++; if (fontFailed <= 3) console.error('prerender: heading font skipped for ' + path.relative(dist, job.out) + ': ' + e.message); }
  }
}));
console.log(`prerender: heading fonts on ${fontPages} pages, average ${fontPages ? Math.round(fontBytes / fontPages / 1024) : 0} kB` + (fontFailed ? `; skipped on ${fontFailed}` : ''));
if (site && !only) {
  const today = new Date().toISOString().slice(0, 10), pages = list.filter(r => !failed.includes(r) && r !== 'brands/');
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(r => ` <url><loc>${site}/${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
}
console.log(`prerender: ${done} pages in ${((Date.now() - started) / 1000).toFixed(0)}s` + (failed.length ? `; NOT rendered (${failed.length}): ${failed.map(decodeURIComponent).join(', ')}` : ''));
process.exit(failed.length > list.length * 0.1 ? 1 : 0);
