import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {pages,findPage,classicPages,editorFor,isIndexPage} from '../src/content/catalogue.js';
import {navigation,supportLinks,contentHref} from '../src/components/site/navigation.js';
import {arrangeArticle} from '../src/content/arrange.js';
const root=new URL('../',import.meta.url);
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
 const redirect=readFileSync(new URL('public/pages/new-page-7/index.html',root),'utf8');
 assert(redirect.includes('url=../delta-glass-tree-trophy/'));
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
test('39 logo entries (one per case; 行政院國家永續發展委員會 folded into 行政院, 2026-11-08) retain valid local destinations and source artwork',()=>{const logos=JSON.parse(readFileSync(new URL('src/data/logo-wall.json',root),'utf8'));assert.equal(logos.length,39);for(const l of logos){assert(existsSync(new URL('public'+l.image.src,root)));if(l.href)assert(findPage(l.href),l.name);}});
test('canonical old source URLs resolve to new internal paths',()=>{assert(findPage(contentHref('https://www.re-o.co/pages/ase-outstanding-supplier-trophy')));assert(findPage(contentHref('https://www.re-o.co/products/trophy-1')));});
test('homepage hero figures match the content libraries',async()=>{const {siteStats}=await import('../src/components/site/stats.js');const models=JSON.parse(readFileSync(new URL('src/data/models.json',root),'utf8'));assert.deepEqual(siteStats.map(([n])=>Number(n)),[models.filter(m=>m.id!=='F').length,classicPages('cases').length,classicPages('materials').length]);for(const [,,href] of siteStats)assert(classicPages(href.slice(10)).length>0,href);});
test('case cards show a clean product photo and keep the client for hover',async()=>{const {cardImage,isBanner,splitCase}=await import('../src/content/catalogue.js');const photos=JSON.parse(readFileSync(new URL('src/data/case-photos.json',root),'utf8'));for(const [path,im] of Object.entries(photos)){assert(findPage(path),path);assert(!isBanner(im),path);assert(existsSync(new URL('public'+im.src,root)),im.src)}const cases=classicPages('cases');assert(cases.length>=60);for(const p of cases)assert(!isBanner(cardImage(p)),p.path);assert.deepEqual(splitCase('作品｜T.B. Design x re.O'),{work:'作品',client:'T.B. Design'});assert.deepEqual(splitCase('台達｜50週年模範獎座'),{work:'50週年模範獎座',client:'台達'});assert.deepEqual(splitCase('Uber Eats 商家合作夥伴獎｜快點行銷委製'),{work:'Uber Eats 商家合作夥伴獎',client:'快點行銷'});});
