// re.O case admin: the small service behind /admin/ on the public site.
//
// The admin page is static and holds no secret. Everything that changes the site goes through here:
//   1. the visitor signs in with Google; the page sends Google's signed ID token with every request;
//   2. this service checks the signature, that the token was issued for this site, and that the e-mail is on the list;
//   3. only case content may be written (rules.mjs), as one commit to the repository; the site's own workflow then
//      rebuilds and publishes it. Every save is a commit, so any change can be undone from the history.
//
// Settings (environment):
//   GOOGLE_CLIENT_ID   the OAuth client ID the admin page signs in with
//   ALLOWED_EMAILS     comma-separated Google accounts that may edit
//   GITHUB_TOKEN       fine-grained token for the one repository: Contents read/write, Actions read
//   GITHUB_REPO        owner/name, e.g. ecologydavid/reO.website        GITHUB_BRANCH  default main
//   ALLOWED_ORIGINS    comma-separated origins of the admin page, e.g. https://ecologydavid.github.io
import http from 'node:http';
import crypto from 'node:crypto';
import {readable, refuse} from './rules.mjs';

const env = process.env;
const settings = () => ({
  clientId: env.GOOGLE_CLIENT_ID || '', emails: (env.ALLOWED_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean),
  token: env.GITHUB_TOKEN || '', repo: env.GITHUB_REPO || '', branch: env.GITHUB_BRANCH || 'main',
  origins: (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
});

// ── Google sign-in ─────────────────────────────────────────────────────────────────────────────────────────────
let keys = {at: 0, list: []};
async function googleKeys(fetchKeys) {
  if (Date.now() - keys.at > 3600e3 || !keys.list.length) keys = {at: Date.now(), list: await fetchKeys()};
  return keys.list;
}
const fetchGoogleKeys = async () => (await (await fetch('https://www.googleapis.com/oauth2/v3/certs')).json()).keys;
const b64 = s => Buffer.from(s, 'base64url');
// Returns {email, name} for a valid token of an allowed account; throws a short reason otherwise.
export async function verifyIdToken(idToken, {clientId, emails}, fetchKeys = fetchGoogleKeys, now = Date.now()) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new Error('請先登入');
  let header, claims;
  try { header = JSON.parse(b64(parts[0])); claims = JSON.parse(b64(parts[1])); } catch { throw new Error('登入資訊無法讀取'); }
  if (header.alg !== 'RS256') throw new Error('登入資訊格式不符');
  const jwk = (await googleKeys(fetchKeys)).find(k => k.kid === header.kid);
  if (!jwk) { keys.at = 0; throw new Error('登入已過期，請重新登入'); }
  const ok = crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), crypto.createPublicKey({key: jwk, format: 'jwk'}), b64(parts[2]));
  if (!ok) throw new Error('登入資訊驗證失敗');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) throw new Error('登入來源不符');
  if (!clientId || claims.aud !== clientId) throw new Error('登入對象不符');
  if (!(claims.exp * 1000 > now)) throw new Error('登入已過期，請重新登入');
  const email = String(claims.email || '').toLowerCase();
  if (claims.email_verified !== true && claims.email_verified !== 'true') throw new Error('這個 Google 帳號的信箱尚未驗證');
  if (!emails.includes(email)) throw new Error('這個帳號沒有編輯權限');
  return {email, name: claims.name || email};
}

// ── GitHub ─────────────────────────────────────────────────────────────────────────────────────────────────────
async function gh(s, path, init = {}) {
  const r = await fetch(`https://api.github.com/repos/${s.repo}${path}`, {...init, headers: {authorization: `Bearer ${s.token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'reo-site-admin', ...(init.body ? {'content-type': 'application/json'} : {}), ...init.headers}});
  if (!r.ok && !init.allow?.includes(r.status)) throw new Error(`GitHub ${r.status} ${path.split('?')[0]}`);
  return r;
}
async function readFile(s, path) {
  const r = await gh(s, `/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(s.branch)}`, {headers: {accept: 'application/vnd.github.raw+json'}, allow: [404]});
  return r.status === 404 ? null : Buffer.from(await r.arrayBuffer());
}
// One commit for the whole save, on top of the branch as it is now.
async function commit(s, files, message, who) {
  const blobs = await Promise.all(files.map(async f => ({path: f.path, mode: '100644', type: 'blob', sha: (await (await gh(s, '/git/blobs', {method: 'POST', body: JSON.stringify({content: f.content, encoding: f.encoding === 'base64' ? 'base64' : 'utf-8'})})).json()).sha})));
  for (let attempt = 0; ; attempt++) {
    const head = (await (await gh(s, `/git/ref/heads/${s.branch}`)).json()).object.sha;
    const base = (await (await gh(s, `/git/commits/${head}`)).json()).tree.sha;
    const tree = (await (await gh(s, '/git/trees', {method: 'POST', body: JSON.stringify({base_tree: base, tree: blobs})})).json()).sha;
    const made = (await (await gh(s, '/git/commits', {method: 'POST', body: JSON.stringify({message, tree, parents: [head], author: {name: who.name, email: who.email}})})).json()).sha;
    const moved = await gh(s, `/git/refs/heads/${s.branch}`, {method: 'PATCH', body: JSON.stringify({sha: made}), allow: [422]});
    if (moved.ok) return made;
    if (attempt) throw new Error('儲存時網站內容剛好被更新，請再試一次');
  }
}
async function buildStatus(s) {
  const run = (await (await gh(s, `/actions/runs?branch=${encodeURIComponent(s.branch)}&per_page=1`)).json()).workflow_runs?.[0];
  return run ? {sha: run.head_sha, status: run.status, conclusion: run.conclusion, url: run.html_url, at: run.updated_at} : {};
}

// ── HTTP ───────────────────────────────────────────────────────────────────────────────────────────────────────
const types = {json: 'application/json', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png'};
async function body(req, limit = 40 * 1024 * 1024) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > limit) throw new Error('內容太大'); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
export async function handle(req, res, s = settings()) {
  const origin = req.headers.origin || '', url = new URL(req.url, 'http://x');
  const cors = s.origins.includes(origin) ? {'access-control-allow-origin': origin, vary: 'Origin', 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-max-age': '600'} : {};
  const send = (status, value, type = 'application/json; charset=utf-8') => { res.writeHead(status, {...cors, 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff'}); res.end(Buffer.isBuffer(value) ? value : JSON.stringify(value)); };
  try {
    if (req.method === 'OPTIONS') return send(204, {});
    if (url.pathname === '/health') return send(200, {ok: true});
    // A browser on another site gets no CORS headers and cannot read anything; this also refuses its writes outright.
    if (origin && !s.origins.includes(origin)) return send(403, {error: '來源不允許'});
    let who;
    try { who = await verifyIdToken((req.headers.authorization || '').replace(/^Bearer\s+/i, ''), s); } catch (e) { return send(401, {error: e.message}); }
    if (req.method === 'GET' && url.pathname === '/me') return send(200, who);
    if (req.method === 'GET' && url.pathname === '/file') {
      const path = url.searchParams.get('path') || '';
      if (!readable(path)) return send(400, {error: '不允許讀取這個檔案'});
      const data = await readFile(s, path);
      return data ? send(200, data, types[path.split('.').pop().toLowerCase()] || 'application/octet-stream') : send(404, {error: '找不到檔案'});
    }
    if (req.method === 'GET' && url.pathname === '/status') return send(200, await buildStatus(s));
    if (req.method === 'POST' && url.pathname === '/save') {
      const data = await body(req), why = refuse(data);
      if (why) return send(400, {error: why});
      const message = `後台：${String(data.message || '更新案例').replace(/\s+/g, ' ').slice(0, 80)}\n\n由 ${who.email} 透過網站後台儲存。`;
      return send(200, {commit: await commit(s, data.files, message, who)});
    }
    return send(404, {error: '沒有這個功能'});
  } catch (e) {
    console.error(e);
    return send(500, {error: e.message || '伺服器發生錯誤'});
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const s = settings(), missing = ['clientId', 'token', 'repo'].filter(k => !s[k]);
  if (missing.length || !s.emails.length || !s.origins.length) { console.error('reo-site-admin: missing settings', missing, {emails: s.emails.length, origins: s.origins.length}); process.exit(1); }
  http.createServer((req, res) => handle(req, res)).listen(Number(env.PORT) || 8080, () => console.log('reo-site-admin listening'));
}
