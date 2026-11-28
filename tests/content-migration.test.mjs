import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {pages,findPage,classicPages,editorFor,isIndexPage} from '../src/content/catalogue.js';
import {navigation,supportLinks,contentHref} from '../src/components/site/navigation.js';
import {arrangeArticle} from '../src/content/arrange.js';
import {record} from '../src/content/record.js';
const root=new URL('../',import.meta.url);
test('About shows the owner’s event photos and keeps the new activities under the correct years',()=>{
 const newEvents=[
  ['文博會','展覽活動','2021','creative-expo'],
  ['水水文創沙龍','講座課程','2019','creative-salon'],
 ];
 for(const [title,kind,year,photo] of newEvents){
  const entry=record.find(event=>event.title===title);
  assert.equal(entry.kind,kind);
  assert.equal(entry.year,year);
  assert.equal(entry.src,`/assets/about-events/${photo}.webp`);
 }
 const ownerPhotos=record.filter(event=>event.src?.startsWith('/assets/about-events/'));
 assert.equal(ownerPhotos.length,11);
 // 蛋造設計's Melbourne show is not re.O's own exhibition (owner, 2026-11-27): out of the record, a case instead.
 assert(!record.some(event=>/蛋造/.test(event.outlet||'')));assert(findPage('#/read/pages/danzo-studio-marble-tray'));
 for(const entry of ownerPhotos){
  assert(!entry.generic&&entry.alt&&entry.w&&entry.h,entry.title);
  assert(existsSync(new URL('public'+entry.src,root)),entry.src);
 }
 assert(existsSync(new URL('public/assets/founder-dong-profile.webp',root)));
});
test('the retired policy is absent from navigation and the catalogue while shipping stays available',()=>{
 assert.equal(findPage('#/read/about/policy'),undefined);
 assert.equal(findPage(contentHref('https://www.re-o.co/about/policy')),undefined);
 assert(!supportLinks.some(([,href])=>href==='#/read/about/policy'));
 assert(!existsSync(new URL('public/content/pages/8483b3136d6494.json',root)));
 assert(findPage('#/read/about/delivery-policy'));
});
test('the two Delta glass tree entries share one case and keep the light-and-shadow cover',async()=>{
 const {cardImage,splitCase}=await import('../src/content/catalogue.js');
 const canonical='#/read/pages/delta-glass-tree-trophy',legacy='#/read/pages/new-page-7';
 const entry=findPage(canonical);
 assert.deepEqual(splitCase(entry.title),{work:'台達 玻璃樹模範獎盃',client:'Delta'});
 assert.equal(findPage(legacy),entry);
 assert.equal(findPage(contentHref('https://www.re-o.co/pages/new-page-7')),entry);
 assert(!pages.some(page=>page.path===legacy));
 assert.equal(classicPages('custom').filter(page=>page===entry).length,1);
 assert.match(cardImage(entry).src,/119276212b2bf99af7\.webp$/);
 assert(existsSync(new URL('public'+cardImage(entry).src,root)));
 const page=JSON.parse(readFileSync(new URL('public/content/pages/'+entry.id+'.json',root),'utf8'));
 assert.equal(page.title,entry.title);
 assert.deepEqual(page.hero,entry.hero);
 const {chapters}=arrangeArticle(page,findPage);
 assert.deepEqual(chapters.map(chapter=>chapter.image.src.split('/').pop()),[
  '26e4f9262d65e63e15.webp','bc6f73c905e5d02660.webp','f9a083db8afb679a0c.webp','76a09f1578f03bcfc1.webp',
 ]);
 // v1.4.0: the old address is answered by the host's redirect file (tools/aliases.mjs), no longer by a refresh page.
 const {redirectsFile}=await import('../tools/aliases.mjs');
 assert(redirectsFile('/').split('\n').includes('/pages/new-page-7/ /pages/delta-glass-tree-trophy/ 301'));
 assert(!existsSync(new URL('public/pages/new-page-7/index.html',root)));
});
test('all migrated pages and local related links resolve without old-site redirects',()=>{assert(pages.length>0);assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);assert.equal(new Set(pages.map(p=>p.id)).size,pages.length);for(const p of pages){const data=JSON.parse(readFileSync(new URL('public/content/pages/'+p.id+'.json',root),'utf8'));assert.equal(data.path,p.path);assert(data.sections.length||data.images.length,p.title);for(const l of data.links.filter(l=>!/f款/i.test(decodeURIComponent(l.path))))assert(findPage(l.path),p.title+' -> '+l.path);for(const im of [data.hero,...data.images].filter(Boolean))assert(existsSync(new URL('public'+im.src,root)),im.src);}});
test('six navigation groups keep standard and custom trophies apart and lead to valid internal pages',()=>{assert.equal(navigation.length,6);assert.deepEqual(navigation.slice(0,2).map(n=>n.href),['#/explore/standard','#/read/pages/custom']);const hrefs=[...navigation.flatMap(n=>[n.href,...n.links.map(([,href])=>href)]),...supportLinks.map(([,href])=>href)];for(const href of hrefs.filter(h=>!h.startsWith('https://www.pinkoi.com/'))){assert(href.startsWith('#/'));if(href.startsWith('#/read/'))assert(findPage(href),href);if(href.startsWith('#/explore/'))assert(classicPages(href.slice(10).split('?')[0]).length>0,href);}});
test('material and case listings exclude old listing indexes and hidden cases',()=>{
 assert.equal(classicPages('materials').length,9);
 const visibleCases=pages.filter(page=>page.category==='cases'&&!page.hidden&&!isIndexPage(page));
 assert.deepEqual(classicPages('cases'),visibleCases);
 assert.deepEqual(new Set([...classicPages('custom'),...classicPages('products')]),new Set(visibleCases));
});
test('five standard products keep one-click access to every offered editor model (F withdrawn, v70)',()=>{assert.deepEqual(classicPages('standard').map(editorFor),['A','B','C','D','E']);assert(!pages.some(p=>/f款/i.test(decodeURIComponent(p.path))));});
test('logo entries (39 with a case, one per case; 20 marks only since 2026-11-27) retain valid local destinations and source artwork',()=>{const logos=JSON.parse(readFileSync(new URL('src/data/logo-wall.json',root),'utf8'));assert(logos.length>=59);assert.equal(new Set(logos.map(l=>l.id)).size,logos.length);for(const l of logos){assert(existsSync(new URL(l.image.file||'public'+l.image.src,root)),l.id);if(l.href)assert(findPage(l.href),l.name);else assert(!l.preview&&!l.project,l.id+': a mark without a case carries no print or project');}});
test('canonical old source URLs resolve to new internal paths',()=>{assert(findPage(contentHref('https://www.re-o.co/pages/ase-outstanding-supplier-trophy')));assert(findPage(contentHref('https://www.re-o.co/products/trophy-1')));});
test('homepage hero figures match the content libraries',async()=>{const {siteStats}=await import('../src/components/site/stats.js');const models=JSON.parse(readFileSync(new URL('src/data/models.json',root),'utf8'));assert.deepEqual(siteStats.map(([n])=>Number(n)),[models.filter(m=>m.id!=='F').length,classicPages('cases').length,classicPages('materials').length]);for(const [,,href] of siteStats)assert(classicPages(href.slice(10)).length>0,href);});
test('case cards show a clean product photo and keep the client for hover',async()=>{const {cardImage,isBanner,splitCase}=await import('../src/content/catalogue.js');const photos=JSON.parse(readFileSync(new URL('src/data/case-photos.json',root),'utf8'));for(const [path,im] of Object.entries(photos)){assert(findPage(path),path);assert(!isBanner(im),path);assert(existsSync(new URL('public'+im.src,root)),im.src)}const cases=classicPages('cases');assert(cases.length>=60);for(const p of cases)assert(!isBanner(cardImage(p)),p.path);assert.deepEqual(splitCase('作品｜T.B. Design x re.O'),{work:'作品',client:'T.B. Design'});assert.deepEqual(splitCase('台達｜50週年模範獎座'),{work:'50週年模範獎座',client:'台達'});assert.deepEqual(splitCase('Uber Eats 商家合作夥伴獎｜快點行銷委製'),{work:'Uber Eats 商家合作夥伴獎',client:'快點行銷'});});
// Owner, 2026-11-28: four record entries show the public photograph of their linked report; IDDI (a grant) is out.
test('the record shows the report photographs the owner chose and leaves the grant out',async()=>{
 const {record}=await import('../src/content/record.js');
 assert(!record.some(event=>/IDDI/.test(event.title)));
 const tisdc=record.find(event=>event.title==='校園循環經濟講座：國立臺灣藝術大學');
 assert.equal(tisdc.outlet,'TISDC演講');
 for(const [title,name] of [['校園循環經濟講座：國立臺灣藝術大學','tisdc-ntua-2026'],['永續串造','sustain-chain-2026'],['瘋設祭','pinkoi-design-fest-2025'],['岩石蠟燭、大理石萬用筒！5 款台灣設計的再生居家配件','lavie-desk-2020']]){
  const entry=record.find(event=>event.title===title);
  assert.equal(entry.src,`/assets/press/${name}.webp`,title);
  assert(!entry.generic&&entry.href&&existsSync(new URL('public'+entry.src,root)),title);
 }
});
// Owner, 2026-11-28: exports say the render is a reference and the piece is handmade; the 公版 step 02 photo shows the
// current studio (3D preview beside the plate), set to the band's 4:3 frame.
test('studio exports carry the handmade note and the 公版 flow shows the current studio',()=>{
 const pdf=readFileSync(new URL('src/editor/PdfExport.js',root),'utf8'),eps=readFileSync(new URL('src/editor/EpsExport.js',root),'utf8');
 assert(pdf.includes('圖片渲染效果僅供參考，實際作品為手工製作') && eps.includes('every piece is handmade'));
 assert(readFileSync(new URL('src/content/landings.jsx',root),'utf8').includes("src:'/assets/studio-preview.webp',width:1600,height:1200"));
});
