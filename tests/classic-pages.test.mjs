// v1.7.0 (owner, 2026-11-27): the five classic model pages (ClassicPage.jsx) and the home links that open them.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const root = new URL('../', import.meta.url), read = file => readFileSync(new URL(file, root), 'utf8');
const index = JSON.parse(read('src/data/content-index.json')), models = JSON.parse(read('src/data/models.json'));
const names = {A: 'APEX', B: 'BOND', C: 'CRYSTAL', D: 'DELTA', E: 'EXCEED'};
const pageOf = id => {
  const entry = index.pages.find(p => p.path === '#/read/products/' + models.find(m => m.id === id).slug);
  return {entry, page: JSON.parse(read(`public/content/pages/${entry.id}.json`))};
};

test('each classic model page holds the short concept, the full concept, five specification rows and a drawing', () => {
  for (const id of Object.keys(names)) {
    const {entry, page} = pageOf(id), text = JSON.stringify(page);
    assert(page.title.startsWith(`${id} 款 ${names[id]}｜`), page.title);
    assert.equal(entry.title, page.title);
    assert.equal(entry.summary, page.summary);
    assert(page.summary.length > 30 && page.summary.endsWith('。'), id + ' summary');
    assert.deepEqual(page.sections.map(s => s.heading), ['設計概念', '商品參數']);
    const [concept, spec] = page.sections;
    assert(concept.paragraphs.some(p => p !== page.summary && p.length > 60), id + ' concept');
    // Rows are 「項目：內容」; the labels stay short so the value keeps its width on a phone.
    assert.deepEqual(spec.paragraphs.map(p => p.split('：')[0]), ['材質', '尺寸', '包裝', '包裝尺寸', '淨重']);
    // One way of writing sizes and weights: 長 × 寬 × 高 with the unit once, a space before the unit.
    for (const row of [spec.paragraphs[1], spec.paragraphs[3]]) assert.match(row, /^[^：]+：長 [\d.]+ × 寬 [\d.]+ × 高 [\d.]+ cm$/, row);
    assert.match(spec.paragraphs[4], /^淨重：[\d.]+ (g|kg)$/);
    // No circled or boxed figures, no half-width punctuation between Chinese words, one spelling of 樹脂.
    assert(!/[①-⓿❶-➓]/.test(text), id + ' has circled figures');
    assert(!/樹酯|私訊/.test(text), id);
    for (const p of [page.summary, ...concept.paragraphs, ...spec.paragraphs, ...spec.items]) assert(!/[一-鿿][,()+/][一-鿿]/.test(p), p);
    const photos = [page.hero, ...page.images];
    assert.equal(page.images.filter(im => im.kind === 'drawing').length, 1, id + ' drawing');
    assert(photos.every(im => im.alt.includes(names[id]) || im.alt.includes('PEAK')) && new Set(photos.map(im => im.alt)).size === photos.length, id + ' photo descriptions');
    assert(photos.every(im => existsSync(new URL('public' + im.src, root))), id + ' photo files');
  }
});

test('the home cards and Classic photos open the model pages; the studio is entered from the page', () => {
  const home = read('src/components/Home.jsx'), page = read('src/content/ClassicPage.jsx');
  assert.match(home, /<a href=\{classicPage\(id\)\}/);
  assert.match(home, /<a className="rv-product-photo" href=\{classicPage\(m\.id\)\}/);
  assert.equal(home.match(/onPreview\(/g).length, 1, 'only the hero button 開始 X 款排版 opens the studio from home');
  assert(page.includes('以 {id} 款進入銘版排版工作室') && page.includes('{...studioTab}'));
  assert(!/[①-⓿❶-➓]/.test(page.replace(/\/\/.*$/gm, '')));
});
