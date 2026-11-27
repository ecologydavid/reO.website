// v1.11.0 (owner, 2026-11-28): on home every block has its own ground and, on desktop, fits one screen;
// About's photograph lies under its opening words; the studio has two ways to a larger picture.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const css = read('src/components/home-fit.css').replace(/\/\*[\s\S]*?\*\//g, '');

test('no two neighbouring home blocks share a ground', () => {
  const tone = Object.fromEntries([...css.matchAll(/--h-([a-z]+):(#[0-9a-f]{3,6})/g)].map(m => [m[1], m[2]]));
  const ground = selector => { const m = css.match(new RegExp(selector.replace(/[.#]/g, '\\$&') + '\\{background:var\\(--h-([a-z]+)\\)')); assert(m, selector); return tone[m[1]]; };
  // In page order, after the hero photograph.
  const order = ['.rv-process', '#classic', '#custom', '.rv-materials', '.brand-ledger', '.shop-window'].map(ground);
  assert.equal(new Set(order).size, order.length, 'six grounds, all different: ' + order.join(' '));
  order.forEach((c, i) => assert(/^#[0-9a-f]{3,6}$/.test(c) && c !== order[i + 1]));
});

test('a desktop block is sized from the height of the window', () => {
  assert(css.includes('--fit:calc(100svh - 72px)') && css.includes('main>section:not(.rv-hero){min-height:var(--fit)'));
  for (const part of ['.rv-products{--rv-row:', '.rv-modes .rv-frame{aspect-ratio:auto;height:', '.rv-swatches .rv-frame{aspect-ratio:auto;height:', 'main>section.rv-process{', '.site-logo-grid{grid-template-columns:repeat(12']) assert(css.includes(part), part);
  const home = read('src/components/Home.jsx');
  // The Process heading stands in the ring's left column on desktop, across the top on phones.
  assert(home.includes('{compact && <div className="rv-gutter">{head}</div>}') && /rv-cycle-side is-left">\s*\{head\}/.test(home));
  assert(home.indexOf("import './home-fit.css'") > home.indexOf("import './home-v10.css'"), 'home-fit.css loads last');
});

test("About: the photograph is the ground of the opening block, not a block of its own", () => {
  const about = read('src/content/AboutPage.jsx'), pages = read('src/content/pages.css');
  assert(about.includes('pg-top pg-top-photo') && about.includes('className="pg-ground"') && !about.includes('className="pg-hero"'));
  assert(pages.includes('.pg-top-photo::before') && pages.includes('.pg-top-photo .pg-title :is(.content-display,h1,.st-lead){color:#fff}'));
});

test('the studio can fold its side columns away and show the product preview over the whole window', () => {
  const editor = read('src/editor/Editor.jsx'), style = read('src/editor/editor-v4.css');
  assert(editor.includes('className="st-wide"') && editor.includes('className="st-full"') && editor.includes("setMenu(false);setFull(false)"));
  assert(style.includes('.st-layout.is-wide{grid-template-columns:0 minmax(0,1fr) 0}') && style.includes('.st-slot-product.is-full{position:fixed;inset:0'));
  // The earlier 放大成品 switch stays.
  assert(editor.includes("'還原並排':'放大成品'"));
});

// v1.12.0 (owner, 2026-11-28): he liked About's photograph under the words and the name tabs inside the home
// Classic photographs, and asked for both elsewhere.
test('a landing page with a photograph lays it under its opening words', () => {
  const library = read('src/content/ContentLibrary.jsx');
  assert(library.includes("landing.hero?' pg-top-photo':''") && library.includes('landing.hero&&<img className="pg-ground"'));
  assert(!library.includes('className="pg-hero"'), 'no separate photograph block');
});

test('the 公版獎盃 model row names each model in a tab inside its photograph', () => {
  const library = read('src/content/ContentLibrary.jsx'), home = read('src/components/Home.jsx'), tab = read('src/components/site/classic-tab.css');
  assert(library.includes("className={named?'ct-card':undefined}") && library.includes('{named?<ClassicTab id={named}/>:'));
  assert(!library.includes('is-named'), 'no name row under the photograph');
  // One tab component for home and the row.
  assert(home.includes("import ClassicTab from './site/ClassicTab.jsx'") && !home.includes('function ClassicTab'));
  assert(tab.includes('.ct-card:hover .rv-tab') && tab.includes('prefers-reduced-motion:reduce'));
});
