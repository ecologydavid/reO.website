// v1.10.0 (owner, 2026-11-28): the words under a page's first heading are set by Statement.jsx on every landing
// page and article, not as a grey paragraph. The words themselves stay the approved descriptions.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('landing pages, About, the FAQ and articles set their opening words with Statement', () => {
  const library = read('src/content/ContentLibrary.jsx'), about = read('src/content/AboutPage.jsx'), faq = read('src/content/FaqPage.jsx'), reader = read('src/content/ContentReader.jsx');
  assert(library.includes('<h1>{landing.title||info.label}</h1><Statement text={written['));
  assert(about.includes('<h1>關於 re.O</h1>') && about.includes('<Statement text="re.O（或心國際設計有限公司）'));
  assert(faq.includes('<Statement text="訂製、交期與配送，先看這裡。"/>'));
  assert(reader.includes('<Statement text={page.summary}/>') && !reader.includes('content-intro'));
  for (const file of [library, about, faq]) assert(!/<h1>[^<]*<\/h1><p>/.test(file), 'no bare paragraph under a page title');
});

test('the statement holds phrases only where the column is wide enough, and adds no fill or ornament', () => {
  const css = read('src/components/site/statement.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert(css.includes('.st{container-type:inline-size'));
  assert(/@container \(min-width:[\d.]+em\)\{[^}]*\.st-hold\{display:inline-block\}/.test(css));
  assert(!/background|box-shadow|gradient|border-radius/.test(css));
  // Numbered lines stay rows: flowParagraphs must not run "1. …" lines into one paragraph.
  assert(read('src/content/arrange.js').includes('(?!\\d)\\S/.test(p)'));
});
