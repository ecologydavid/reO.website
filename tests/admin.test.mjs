// The case admin (v75): what may be written, how a draft becomes files, and who may sign in.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {writable, readable, refuse, limits} from '../admin-service/rules.mjs';
import {verifyIdToken, handle} from '../admin-service/server.mjs';
import {toDraft, newDraft, buildChanges, problems, groupOf, files, pageFile} from '../src/admin/model.mjs';

const root = new URL('../', import.meta.url), read = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const data = () => ({index: read(files.index), covers: read(files.covers), details: read(files.details), cards: read(files.cards)});
const page18 = 'public/content/images/' + 'a'.repeat(18) + '.webp';

test('the admin can only write case content', () => {
  assert.equal(writable('src/data/content-index.json'), 'text');
  assert.equal(writable('public/content/pages/38c4eca66b12e3.json'), 'text');
  assert.equal(writable(page18), 'image');
  assert.equal(writable('public/assets/case-cards/' + 'b'.repeat(18) + '.jpg'), 'image');
  for (const p of ['src/App.jsx', '.github/workflows/deploy-pages.yml', 'package.json', 'src/data/models.json', 'public/content/images/../../../src/App.jsx', 'public/content/images/photo.webp', 'public/index.html', 'admin-service/server.mjs', 'public/content/pages/x.json'])
    assert.equal(writable(p), null, p);
  assert(readable('public/assets/case-pinkoi.webp') && readable(files.cards));
  assert(!readable('package.json') && !readable('public/content/images/../../.env') && !readable('.env'));
});

test('a save is refused unless every file is allowed, well formed and small enough', () => {
  const ok = {files: [{path: files.cards, content: '{}', encoding: 'utf8'}, {path: page18, content: 'AAAA', encoding: 'base64'}]};
  assert.equal(refuse(ok), null);
  assert(refuse({files: []}));
  assert(refuse({files: [{path: 'src/App.jsx', content: 'x', encoding: 'utf8'}]}));
  assert(refuse({files: [{path: files.cards, content: '{not json', encoding: 'utf8'}]}));
  assert(refuse({files: [{path: page18, content: '<svg onload=alert(1)>', encoding: 'utf8'}]}), 'an image must arrive as bytes');
  assert(refuse({files: [{path: files.cards, content: 'e30=', encoding: 'base64'}]}), 'data files must arrive as text');
  assert(refuse({files: [{path: page18, content: 'A'.repeat(limits.imageBytes * 2), encoding: 'base64'}]}));
  assert(refuse({files: Array.from({length: limits.files + 1}, () => ok.files[0])}));
});

test('an unchanged case saves back to the same page and list entry', () => {
  const d = data(), entry = d.index.pages.find(p => p.path === '#/read/pages/pinkoi-trophy'), page = read(pageFile(entry.id));
  const draft = toDraft(entry, page, d.covers[entry.path], d.details[entry.path]), made = buildChanges(draft, d, () => 'unused');
  assert.equal(made.thumbs.length, 0, 'nothing new to make');
  assert.deepEqual(made.page.sections, page.sections);
  assert.deepEqual(made.page.hero, {...page.hero, caption: page.hero.caption || ''});
  assert.deepEqual(made.page.images.map(i => i.src), page.images.filter(i => i.src !== page.hero.src).map(i => i.src));
  assert.deepEqual(made.page.metadata, page.metadata);
  assert.equal(made.page.caseId, page.caseId, 'fields the editor does not show are kept');
  const texts = Object.fromEntries(made.texts().map(f => [f.path, JSON.parse(f.content)]));
  assert.deepEqual(Object.keys(texts).sort(), [pageFile(entry.id), ...Object.values(files)].sort());
  assert.deepEqual(texts[files.covers], d.covers);
  assert.deepEqual(texts[files.details], d.details);
  assert.deepEqual(texts[files.cards], d.cards);
  assert.equal(texts[files.index].pages.length, d.index.pages.length);
  const saved = texts[files.index].pages.find(p => p.path === entry.path);
  assert.equal(saved.title, entry.title); assert.equal(saved.group, '企業獎盃'); assert.equal(saved.hidden, undefined);
});

test('a new case gets a page, a list entry, a cover, a card copy and hover details', () => {
  const d = data(), draft = newDraft(), photo = (n, w, h) => ({src: `/content/images/${String(n).repeat(18)}.webp`, width: w, height: h, alt: ''});
  Object.assign(draft, {title: ' 測試獎盃 ', slug: 'test-trophy', summary: '摘要', group: '生活設計', photos: [photo(1, 1440, 1080), photo(2, 1080, 1440), photo(3, 1440, 960)], hero: photo(1).src,
    sections: [{heading: '設計｜一', text: '第一段\n\n第二行', items: []}, {heading: '', text: '', items: []}], coverFrom: {src: photo(1).src, square: true, pos: .4}});
  draft.meta = {client: '客戶', year: '2026', material: '', service: '專案訂製'};
  assert.deepEqual(problems(draft, d.index), []);
  const made = buildChanges(draft, d, path => 'f'.repeat(14));
  assert.equal(made.path, '#/read/pages/test-trophy');
  assert.deepEqual(made.page.sections, [{heading: '設計｜一', paragraphs: ['第一段', '第二行'], items: []}], 'empty sections are dropped');
  assert.deepEqual(made.page.metadata, {client: '客戶', year: '2026', service: '專案訂製'});
  assert.equal(made.page.images.length, 2);
  // The caller makes the copies in order; a square cover asks for its card copy once it exists.
  for (let i = 0; i < made.thumbs.length; i++) { const t = made.thumbs[i]; t.set({src: `/${t.folder}/${String(i).repeat(18)}.webp`, width: t.limit, height: t.limit}); }
  assert.deepEqual(made.thumbs.map(t => [t.folder, t.limit, t.square ?? null]), [['content/images', 1440, .4], ['assets/case-details', 480, null], ['assets/case-details', 480, null], ['assets/case-cards', 720, null]]);
  const texts = Object.fromEntries(made.texts().map(f => [f.path, JSON.parse(f.content)]));
  const cover = texts[files.covers]['#/read/pages/test-trophy'];
  assert.equal(cover.src, '/content/images/000000000000000000.webp'); assert.equal(cover.alt, '測試獎盃');
  assert.equal(texts[files.cards][cover.src], '/assets/case-cards/333333333333333333.webp');
  assert.deepEqual(texts[files.details]['#/read/pages/test-trophy'], {more: 0, details: [{src: '/assets/case-details/111111111111111111.webp', width: 480, height: 480}, {src: '/assets/case-details/222222222222222222.webp', width: 480, height: 480}]});
  const index = texts[files.index], entry = index.pages.at(-1);
  assert.equal(index.pages.length, d.index.pages.length + 1);
  assert.equal(index.statistics.counts_by_category.cases, d.index.statistics.counts_by_category.cases + 1);
  assert.equal(entry.title, '測試獎盃'); assert.equal(entry.group, '生活設計'); assert.equal(entry.subcategory, '品牌禮品與生活器物'); assert.equal(groupOf(entry), '生活設計');
  for (const f of made.texts()) assert.equal(writable(f.path), 'text', f.path);
});

test('the editor names what is missing before a save', () => {
  const d = data(), draft = newDraft();
  assert(problems(draft, d.index).length >= 3);
  Object.assign(draft, {title: 'x', slug: 'pinkoi-trophy', photos: [{src: '/content/images/a.webp', width: 1, height: 1}]});
  assert.deepEqual(problems(draft, d.index), ['這個網址名稱已經有案例使用']);
  draft.slug = 'Bad Slug'; assert.equal(problems(draft, d.index).length, 1);
  draft.slug = 'good-slug-2'; draft.meta.year = '去年'; assert.equal(problems(draft, d.index).length, 1);
  draft.meta.year = '2023–2025'; assert.deepEqual(problems(draft, d.index), []);
});

// A Google-style ID token signed with a key made for the test.
const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
const jwk = {...publicKey.export({format: 'jwk'}), kid: 'test-key', alg: 'RS256', use: 'sig'}, keys = async () => [jwk];
const b64 = v => Buffer.from(JSON.stringify(v)).toString('base64url');
function token(claims, key = privateKey, header = {alg: 'RS256', kid: 'test-key', typ: 'JWT'}) {
  const body = b64(header) + '.' + b64({iss: 'https://accounts.google.com', aud: 'client-1', exp: Math.floor(Date.now() / 1000) + 600, email: 'Owner@Example.com', email_verified: true, name: 'Owner', ...claims});
  return body + '.' + crypto.sign('RSA-SHA256', Buffer.from(body), key).toString('base64url');
}
const who = {clientId: 'client-1', emails: ['owner@example.com']};

test('only a valid Google sign-in from an allowed account passes', async () => {
  assert.deepEqual(await verifyIdToken(token({}), who, keys), {email: 'owner@example.com', name: 'Owner'});
  const refused = async (t, s = who) => { await assert.rejects(() => verifyIdToken(t, s, keys)); };
  await refused('');
  await refused(token({email: 'stranger@example.com'}));
  await refused(token({aud: 'another-site'}));
  await refused(token({exp: Math.floor(Date.now() / 1000) - 5}));
  await refused(token({iss: 'https://evil.example'}));
  await refused(token({email_verified: false}));
  await refused(token({}), {clientId: '', emails: who.emails});
  await refused(token({}, crypto.generateKeyPairSync('rsa', {modulusLength: 2048}).privateKey), who);
  const good = token({}), parts = good.split('.');
  await refused(parts[0] + '.' + b64({iss: 'https://accounts.google.com', aud: 'client-1', exp: 9999999999, email: 'owner@example.com', email_verified: true}) + '.' + parts[2]);
  await refused(b64({alg: 'none', kid: 'test-key'}) + '.' + parts[1] + '.');
});

test('the service answers nothing without a sign-in and refuses other sites', async () => {
  const s = {...who, token: 't', repo: 'o/r', branch: 'main', origins: ['https://site.example']};
  const ask = async (method, url, headers = {}) => { const res = {}; await handle({method, url, headers, [Symbol.asyncIterator]: async function* () {}}, {writeHead: (status, h) => { res.status = status; res.headers = h; }, end: b => { res.body = String(b); }}, s); return res; };
  assert.equal((await ask('GET', '/health')).status, 200);
  for (const path of ['/me', '/file?path=src/data/case-cards.json', '/status']) assert.equal((await ask('GET', path, {origin: 'https://site.example'})).status, 401, path);
  assert.equal((await ask('POST', '/save', {origin: 'https://site.example'})).status, 401);
  const other = await ask('POST', '/save', {origin: 'https://evil.example', authorization: 'Bearer x'});
  assert.equal(other.status, 403); assert.equal(other.headers['access-control-allow-origin'], undefined);
  assert.equal((await ask('GET', '/me', {origin: 'https://site.example'})).headers['access-control-allow-origin'], 'https://site.example');
});
