// Photos named by content and small copies for phones (v1.2.2): tools/images.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {rewriteRefs, hashAssets} from '../tools/images.mjs';

const map = new Map([['/assets/case-pinkoi.webp', '/i/assets/case-pinkoi.0123456789.webp'], ['/assets/case-cards/a.webp', '/i/assets/case-cards/a.aaaaaaaaaa.webp'], ['/assets/reo-logo.png', '/i/assets/reo-logo.bbbbbbbbbb.png']]);

test('only whole /assets/ addresses that the build renamed are changed', () => {
  const same = t => assert.equal(rewriteRefs(t, map), t, t);
  assert.equal(rewriteRefs('{"src":"/assets/case-pinkoi.webp","w":1}', map), '{"src":"/i/assets/case-pinkoi.0123456789.webp","w":1}');
  assert.equal(rewriteRefs("url(/assets/reo-logo.png)", map), 'url(/i/assets/reo-logo.bbbbbbbbbb.png)');
  assert.equal(rewriteRefs('srcset="/assets/case-cards/a.webp 720w, /assets/case-pinkoi.webp 1440w"', map), 'srcset="/i/assets/case-cards/a.aaaaaaaaaa.webp 720w, /i/assets/case-pinkoi.0123456789.webp 1440w"');
  same('"/assets/unknown.webp"');                                   // not a file the build renamed
  same('content="https://www.re-o.co/assets/reo-logo.png"');        // absolute addresses (link previews) keep the plain name
  same('"/i/assets/case-pinkoi.0123456789.webp"');                  // already renamed: a second run changes nothing
  same('`/assets/case-${id}.webp`');                                // built in code
  same('"/assets/case-pinkoi.webp.bak"');
  same("startsWith('/assets/case-cards/')");
});

test('a renamed photo keeps its bytes, the original stays, and the name follows the content', () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'reo-img-'));
  try {
    for (const d of ['assets/case-cards', 'assets/case-previews', 'app', 'content/pages']) fs.mkdirSync(path.join(dist, d), {recursive: true});
    fs.writeFileSync(path.join(dist, 'assets/cover.webp'), 'first');
    fs.writeFileSync(path.join(dist, 'assets/case-cards/t.webp'), 'thumb');
    fs.writeFileSync(path.join(dist, 'assets/case-previews/p-720-abc.webp'), 'kept as it is');
    fs.writeFileSync(path.join(dist, 'assets/model.bin'), 'not a photo');
    fs.writeFileSync(path.join(dist, 'app/index.js'), 'const a="/assets/cover.webp",b="/assets/case-previews/p-720-abc.webp",c="/assets/model.bin";');
    fs.writeFileSync(path.join(dist, 'content/pages/x.json'), '{"hero":{"src":"/assets/case-cards/t.webp"}}');
    fs.writeFileSync(path.join(dist, 'index.html'), '<link rel="icon" href="/assets/cover.webp"><meta content="https://x.co/assets/cover.webp">');
    assert.deepEqual(hashAssets(dist), {photos: 2, files: 3});
    const js = fs.readFileSync(path.join(dist, 'app/index.js'), 'utf8'), first = js.match(/\/i\/assets\/cover\.[0-9a-f]{10}\.webp/)[0];
    assert.equal(fs.readFileSync(path.join(dist, first), 'utf8'), 'first');
    assert(fs.existsSync(path.join(dist, 'assets/cover.webp')), 'the original stays for the admin and old links');
    assert(js.includes('"/assets/case-previews/p-720-abc.webp"') && js.includes('"/assets/model.bin"'));
    assert.match(fs.readFileSync(path.join(dist, 'content/pages/x.json'), 'utf8'), /\/i\/assets\/case-cards\/t\.[0-9a-f]{10}\.webp/);
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    assert(html.includes(`href="${first}"`) && html.includes('https://x.co/assets/cover.webp'));
    assert.deepEqual(hashAssets(dist), {photos: 2, files: 0}, 'a second run finds nothing left to change');
    // Replace the photo: a new build gives it a new address.
    fs.writeFileSync(path.join(dist, 'assets/cover.webp'), 'second');
    fs.writeFileSync(path.join(dist, 'app/index.js'), 'const a="/assets/cover.webp";');
    hashAssets(dist);
    const second = fs.readFileSync(path.join(dist, 'app/index.js'), 'utf8').match(/\/i\/assets\/cover\.[0-9a-f]{10}\.webp/)[0];
    assert.notEqual(second, first);
  } finally { fs.rmSync(dist, {recursive: true, force: true}); }
});
