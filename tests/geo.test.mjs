// v1.3.0: one address per page (tools/aliases.mjs) and the plain-text introduction for AI assistants (tools/llms.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aliases, isAlias, redirectsFile, rewriteLinks} from '../tools/aliases.mjs';
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
  for (const fact of ['或心國際設計有限公司', '匠子 CHANZ STUDIO 是 re.O 的自有生活品牌', 'service@re-o.co', '+886-2-8966-5369', 'NT$ 2,300', '少量訂單也接']) assert(text.includes(fact), fact);
  const cases = index.pages.filter(p => p.category === 'cases' && !p.hidden && !isAlias(decodeURIComponent(p.path).replace(/^#\/read\//, '')));
  assert(cases.length >= 70);
  for (const p of cases) assert(text.includes(`](https://www.re-o.co/${p.path.replace(/^#\/read\//, '')}/)`), p.title);
  for (const from of Object.keys(aliases)) assert(!text.includes(`/${from}/)`), 'old address listed: ' + from);
  assert(!/\/products\/f款/i.test(text) && !text.includes(encodeURI('/products/f款')) && !text.includes(encodeURI('/products/F款')));
});
