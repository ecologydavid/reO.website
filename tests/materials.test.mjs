// v1.13.0 (owner, 2026-11-28): the nine material pages read as reference entries. The studio's own process text is
// real text on the page, and background knowledge comes with its sources.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {notes} from '../src/content/materialNotes.js';
import {photos} from '../src/content/materialPhotos.js';

const root = new URL('../', import.meta.url), read = file => readFileSync(new URL(file, root), 'utf8');
const slugs = [...read('src/components/site/materials.js').matchAll(/\['[^']+', '[^']+', '([^']+)'/g)].map(m => m[1]);

test('every one of the nine materials has its file, its three steps and their photographs', () => {
  assert.equal(slugs.length, 9);
  assert.deepEqual(Object.keys(notes).sort(), [...slugs].sort());
  for (const slug of slugs) {
    const n = notes[slug];
    assert(n.about.startsWith('re.O ') && n.about.endsWith('。') && n.about.length <= 80, slug + ' about');
    assert(n.file.length >= 3 && n.file.every(([label, value]) => label.length <= 6 && value), slug + ' file');
    assert(n.file.some(([label]) => label === '原料來源') && n.file.some(([label]) => label === '做成的作品'), slug + ' file rows');
    assert.equal(n.steps.length, 3, slug + ' steps');
    n.steps.forEach((s, i) => {
      assert(s.title && s.sub && s.text.endsWith('。'), slug + ' step ' + (i + 1));
      assert(existsSync(new URL(`public/assets/materials/${slug}-${i + 1}.webp`, root)), slug + ' step photo ' + (i + 1));
    });
    // One way of writing: a half-width space between Chinese and figures, no typos carried over from the picture.
    const text = [n.about, ...n.file.flat(), ...n.steps.map(s => s.text)].join('');
    assert(!/烘培|材料行成|樹酯/.test(text), slug + ' typos');
    assert(!/[一-鿿]\d|\d[一-鿿]/.test(text.replace(/\d+ ?(cm|度)/g, '')), slug + ' spacing: ' + (text.match(/.{6}[一-鿿]\d.{6}|.{6}\d[一-鿿].{6}/) || [''])[0]);
  }
});

test('background knowledge always names an opened public source, and keeps away from the studio\'s own claims', () => {
  for (const slug of slugs) {
    const facts = notes[slug].facts;
    assert(facts.length >= 2 && facts.length <= 5, slug + ' facts');
    for (const f of facts) {
      assert(/？$/.test(f.q) && f.a.length && f.a.every(p => p.endsWith('。')), slug + ': ' + f.q);
      assert(f.sources.length >= 1, slug + ' has a fact without a source: ' + f.q);
      for (const s of f.sources) assert(/^https:\/\//.test(s.url) && s.title.length > 6, slug + ' source: ' + s.title);
      // A figure is never given without the year it belongs to, in the answer or on its source.
      // (a quantity: so many tonnes, cups, reservoirs; a physical constant such as a melting point needs no year)
      if (/萬|億|公噸|座/.test(f.a.join(''))) assert(/\d{4}|民國|年/.test(f.a.join('')) || f.sources.some(s => s.year), slug + ' figure without a year: ' + f.q);
    }
  }
  // Figures of the studio's own picture that no public source supported stay out of the background section.
  const answers = slugs.flatMap(s => notes[s].facts.flatMap(f => f.a)).join('');
  for (const figure of ['28.5 億杯', '96 座', '28.4 億', '82.1%', '1260', '不足 25%', '30-50%']) assert(!answers.includes(figure), figure);
});

test('the page shows the notes, opens on a framed photograph and describes itself to search engines', () => {
  const reader = read('src/content/ContentReader.jsx'), body = read('src/content/MaterialBody.jsx'), intro = read('src/content/MaterialIntro.jsx'), css = read('src/content/material-intro.css'), meta = read('src/content/pageMeta.js');
  assert(reader.includes('{noted&&<MaterialBody slug={slug} onOpen={setLightbox}/>}') && reader.includes('materialData(extra.material'));
  // v1.14.0: the page places its own photographs beside the words; the loose gallery under them is gone.
  assert(reader.includes('shown=classic||noted?[]:photos'));
  for (const part of ['re.O 的{name}', '從廢料到材料', '背景知識', '現場紀錄', '資料來源', 'rel="noopener noreferrer"']) assert(body.includes(part), part);
  // The photograph is never spread past its own size (the owner found it soft at full width).
  assert(intro.includes("style={{'--nat':hero.width}}") && css.includes('calc(var(--nat,800)*1.12px)') && !css.includes('inset:0}\n.mat-intro-stage::after'));
  assert(meta.includes('｜re.O 循環材料') && meta.includes("'@type': 'Article'"));
});

// v1.14.0 (owner, 2026-11-28): words and photographs set together; his own photographs from 物料照片 are used,
// except the folder 百分料處理.
test('every material page has a large photograph beside its file and photographs beside the background', () => {
  const sizeOf = file => { const b = readFileSync(new URL('public' + file, root)); return b.length; };
  for (const slug of slugs) {
    const p = photos[slug];
    assert(p && p.lead && p.side.length >= 1 && p.side.length <= 2, slug + ' photographs');
    const all = [p.lead, ...p.side, ...p.more];
    assert.equal(new Set(all.map(im => im.src)).size, all.length, slug + ' repeats a photograph');
    for (const im of all) {
      assert(existsSync(new URL('public' + im.src, root)) && sizeOf(im.src) > 5000, im.src);
      assert(im.width > 400 && im.height > 280 && im.alt && im.alt.length >= 5, slug + ' ' + im.src);
      // Only the owner's own photographs carry a caption (his file names); the others stay unlabelled.
      assert.equal(Boolean(im.caption), im.src.startsWith('/assets/materials/'), im.src + ' caption');
    }
    assert(p.lead.alt.includes('re.O') || !p.lead.src.startsWith('/assets/'), slug + ' lead alt');
    // 現場紀錄 shows only when there are at least two more photographs.
    assert(p.more.length !== 1, slug + ' has a single extra photograph');
  }
  // The owner's photographs are on the three pages he had photographs for.
  for (const slug of ['wooden-beam', 'fly-ash', 'glass']) assert(photos[slug].lead.src.startsWith('/assets/materials/'), slug);
  // Nothing from the folder he excluded (its file names), in the list or on disk.
  const list = read('src/content/materialPhotos.js');
  for (const name of ['IMG_8004', 'IMG_8712', 'IMG_8713']) assert(!list.includes(name), name);
});
