// v1.3.0: one address per page (tools/aliases.mjs) and the plain-text introduction for AI assistants (tools/llms.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {aliases, merged, isAlias, redirectsFile, rewriteLinks} from '../tools/aliases.mjs';
import {llmsText} from '../tools/llms.mjs';

const root = new URL('../', import.meta.url);
const index = JSON.parse(readFileSync(new URL('src/data/content-index.json', root), 'utf8'));
const models = JSON.parse(readFileSync(new URL('src/data/models.json', root), 'utf8'));
const known = new Set(index.pages.map(p => decodeURIComponent(p.path).replace(/^#\/read\//, '')));
const landings = ['explore/standard', 'explore/products', 'explore/cases', 'explore/materials', 'explore/journal', 'explore/support'];

test('every old address is a real page of the migrated site, and lands on a page that exists', () => {
  for (const [from, to] of Object.entries(aliases)) {
    assert(known.has(from), 'not in the content index: ' + from);
    const target = to.split('#')[0].replace(/\/$/, '');
    assert(known.has(target) || landings.includes(target), from + ' → ' + to);
    assert(!isAlias(target), 'a redirect must not lead to another redirect: ' + to);
    assert(to.split('#')[0].endsWith('/'), 'targets are written with their closing slash: ' + to);
  }
  for (const [from, to] of Object.entries(merged)) { assert(!known.has(from), 'still a page: ' + from); assert(known.has(to.replace(/\/$/, '')), from + ' → ' + to); }
  assert(isAlias('pages/contact/') && isAlias('/pages/awards') && isAlias(encodeURI('categories/翻轉鏡') + '/'));
  assert(!isAlias('pages/about/') && !isAlias(''));
});

test('the redirect file answers both spellings of an address, and saved pages link straight to the page', () => {
  const lines = redirectsFile('/').split('\n').filter(l => l && !l.startsWith('#'));
  for (const l of lines) assert.match(l, /^\/\S+ \/\S+ 301$/);
  assert(lines.includes('/pages/awards /pages/about/#about-awards 301') && lines.includes('/pages/awards/ /pages/about/#about-awards 301'));
  // Chinese addresses: as typed and percent-encoded; the target is always encoded.
  assert(lines.includes(`/categories/翻轉鏡/ /explore/products/ 301`) && lines.includes(`/${encodeURI('categories/翻轉鏡')}/ /explore/products/ 301`));
  assert(lines.some(l => l.startsWith('/products/摺紙花器 ') && l.includes(encodeURI('摺紙花器-origami-series'))));
  const html = '<a href="/pages/awards/">a</a><a href="/pages/about/">b</a><a href="/categories/翻轉鏡/">c</a><a href="/pages/material-recycled-marble/">d</a>';
  assert.equal(rewriteLinks(html, '/'), '<a href="/pages/about/#about-awards">a</a><a href="/pages/about/">b</a><a href="/explore/products/">c</a><a href="/pages/material-recycled-marble/">d</a>');
});

test('llms.txt introduces the company, how to order, the prices and every listed case, with no old address', () => {
  const text = llmsText({site: 'https://www.re-o.co', index, models});
  assert(text.startsWith('# re.O\n\n> '));
  for (const fact of ['或心國際設計有限公司', '匠子 CHANZ STUDIO 是 re.O 的自有生活品牌', 'service@re-o.co', '+886-2-8966-5369', 'NT$ 2,300', '都接少量訂單', '設計與開模費用']) assert(text.includes(fact), fact);
  const cases = index.pages.filter(p => p.category === 'cases' && !p.hidden && !isAlias(decodeURIComponent(p.path).replace(/^#\/read\//, '')));
  assert(cases.length >= 70);
  for (const p of cases) assert(text.includes(`](https://www.re-o.co/${p.path.replace(/^#\/read\//, '')}/)`), p.title);
  for (const from of Object.keys(aliases)) assert(!text.includes(`/${from}/)`), 'old address listed: ' + from);
  assert(!/\/products\/f款/i.test(text) && !text.includes(encodeURI('/products/f款')) && !text.includes(encodeURI('/products/F款')));
});

// v1.4.0: titles, descriptions and structured data (src/content/pageMeta.js).
const {written, articleMeta, articleData, faqData, nameOf, org} = await import('../src/content/pageMeta.js');
const count = text => [...text].length;

test('hand-written titles and descriptions fit a search result and name re.O', () => {
  for (const [route, {title, description}] of Object.entries(written)) {
    const shown = title.includes('re.O') ? title : title + '｜re.O';
    assert(count(shown) <= 38, route + ' title too long: ' + count(shown));
    assert(count(description) >= 35 && count(description) <= 150, route + ' description: ' + count(description));
    assert(route === '#/' || route.startsWith('#/explore/') || known.has(route.replace(/^#\/read\//, '')), 'unknown route ' + route);
  }
  // The plaque studio's name is fixed (v71), and the main island delivery time is 1 to 3 days (owner, 2026-11-26).
  for (const {title, description} of Object.values(written)) assert(!/線上排版|1 至 2 天|1～2 天/.test(title + description));
});

test('every page gets its own title and a description, by rule, from its own fields', () => {
  const seen = new Map();
  for (const p of index.pages.filter(p => !p.hidden && !isAlias(decodeURIComponent(p.path).replace(/^#\/read\//, '')))) {
    // The five classic models are titled from their letter, name and price, as the page itself does (ContentReader).
    const letter = 'ABCDE'[['trophy', 'trophy-1', 'trophy-1-1', 'trophy-2025-1', 'the-way-to-peak-standard-trophy'].indexOf(p.path.split('/').pop())];
    const {title, description} = articleMeta(p, letter ? {classic: {id: letter, name: {A: 'APEX', B: 'BOND', C: 'CRYSTAL', D: 'DELTA', E: 'EXCEED'}[letter], price: '2,000'}} : {});
    assert(title && description, p.path);
    assert(count(title) <= 40, p.title + ' → ' + title);
    assert(!/，。|。。|undefined|null/.test(description), description);
    assert(!seen.has(title), `same title: ${p.path} and ${seen.get(title)}`);
    seen.set(title, p.path);
  }
  assert.equal(nameOf({title: '台達 玻璃樹模範獎盃｜Delta x re.O'}), '台達 玻璃樹模範獎盃');
  assert.equal(nameOf({title: '行政院國家永續發展委員會｜國家永續發展獎獎盃'}), '行政院國家永續發展委員會 國家永續發展獎獎盃');
  assert.equal(nameOf({title: 'Uber Eats 商家合作夥伴獎｜快點行銷委製'}), 'Uber Eats 商家合作夥伴獎');
  const classic = articleMeta({path: '#/read/products/trophy-2025-1', title: 'D款獎盃', summary: ''}, {classic: {id: 'D', name: 'DELTA', price: '2,300'}});
  assert.equal(classic.title, 'D 款 DELTA 公版獎盃｜NT$ 2,300・3 個工作天起');
});

test('structured data states the price, the maker and the client the page itself states', () => {
  const d = articleData({title: 'D款', category: 'products', summary: 's'}, {classic: {id: 'D', name: 'DELTA', price: '2,300'}});
  assert.deepEqual(d.offers, {'@type': 'Offer', priceCurrency: 'TWD', price: 2300, availability: 'https://schema.org/MadeToOrder', seller: {'@id': org}});
  const a = articleData({title: 'A款', category: 'products'}, {classic: {id: 'A', name: 'APEX', price: '2,500～2,800'}});
  assert.equal(a.offers['@type'], 'AggregateOffer'); assert.equal(a.offers.lowPrice, 2500); assert.equal(a.offers.highPrice, 2800);
  const c = articleData({title: '台達 玻璃樹模範獎盃｜Delta x re.O', category: 'cases', metadata: {client: '台達', year: '2022-2024', material: '玻璃、木橫擔'}}, {});
  assert.equal(c.creator['@id'], org); assert.equal(c.sourceOrganization.name, '台達'); assert.equal(c.dateCreated, undefined);
  assert.equal(articleData({title: 'x', category: 'cases', metadata: {year: '2025'}}, {}).dateCreated, '2025');
  assert.equal(articleData({title: 'x', category: 'materials'}, {}), null);
  assert.deepEqual(faqData([['問', '答']]).mainEntity[0], {'@type': 'Question', name: '問', acceptedAnswer: {'@type': 'Answer', text: '答'}});
});

// v1.5.0: the FAQ's data (src/content/faq.js) and the brand marks made by tools/logos.py.
const faq = await import('../src/content/faq.js');
test('FAQ: every question has its own address and a full answer in words; numbers run in page order', () => {
  const ids = faq.questions.map(q => q.id), asked = faq.questions.map(q => q.q);
  assert.equal(new Set(ids).size, ids.length); assert.equal(new Set(asked).size, asked.length);
  assert(faq.questions.length >= 20);
  faq.questions.forEach((q, i) => {
    assert.equal(q.n, String(i + 1).padStart(2, '0'));
    assert.match(q.id, /^[a-z][a-z-]*$/); assert(q.q.endsWith('？'), q.q);
    assert(q.a.length >= 12 && /[。）]$/.test(q.a), q.q);
    assert(!/^Q?\d/.test(q.q), 'the number is not part of the question: ' + q.q);
  });
  // Facts the owner fixed on 2026-11-26.
  const all = faq.questions.map(q => q.a).join('\n');
  assert(all.includes('1～3 天') && !all.includes('1～2 天'));
  assert(all.includes('3 次校稿') && !/2～3 ?次/.test(all));
  assert(faq.questions.find(q => q.id === 'small').a.includes('設計與開模費用'));
  for (const g of faq.groups) assert(existsSync(new URL('public' + g.photo[0], root)), g.photo[0]);
  const text = llmsText({site: 'https://www.re-o.co', index, models});
  for (const q of faq.questions) assert(text.includes(`- ${q.q} ${q.a}`), q.q);
});

test('every partner mark has its picture, made to the one rule (tools/logos.py)', () => {
  const logos = JSON.parse(readFileSync(new URL('src/data/logo-wall.json', root), 'utf8'));
  for (const l of logos) {
    assert.equal(l.mark?.src, `/assets/logos/${l.id}.webp`, l.id + ': run tools/logos.py');
    assert(existsSync(new URL('public' + l.mark.src, root)), l.mark.src);
    assert.equal(l.mark.width / l.mark.height, 5 / 4);
  }
});
