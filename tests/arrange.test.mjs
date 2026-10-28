import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pages,findPage,cardImage} from '../src/content/catalogue.js';
import {arrangeArticle} from '../src/content/arrange.js';
const root=new URL('../',import.meta.url);
const load=path=>JSON.parse(readFileSync(new URL('public/content/pages/'+findPage(path).id+'.json',root),'utf8'));

test('material pages become a works index led by each linked case photo',()=>{
 const page=load('#/read/pages/material-recycled-marble'),a=arrangeArticle(page,findPage);
 assert.equal(a.works.length,21);
 assert.deepEqual(a.works[0],{title:'富邦 長春公開賽 高爾夫球獎盃',year:'2022–2025',line:'造型取自揮桿時球桿軌跡劃出的弧形，延伸成完整圓形構，代表目標、專注與循環不止的訓練精神',href:'#/read/pages/the-senior-pga-of-taiwan',hero:cardImage(findPage('#/read/pages/the-senior-pga-of-taiwan'))});
 assert.equal(a.chapters.length,0);
 assert(a.photos.every(im=>!/點擊/.test(im.alt)),'link banners are not repeated in the gallery');
});

test('case pages pair the short captions with their detail photos and drop duplicated metadata',()=>{
 const page=load('#/read/pages/the-senior-pga-of-taiwan'),a=arrangeArticle(page,findPage);
 assert.equal(a.first.heading,'設計理念');
 assert.deepEqual(a.details.map(d=>[d.text,d.image.alt]),[['收束勝利V','勝利V字型高爾夫球獎盃側面展示'],['揮竿軌跡弧形','揮竿運動軌跡設計上方展示'],['高爾夫球球梯','金色高爾夫球球梯造型特寫']]);
 assert(!a.chapters.some(c=>c.section.heading==='詳細資訊'));
});

test('every photo is shown once and every section keeps its text',()=>{
 for(const index of pages){
  const page=JSON.parse(readFileSync(new URL('public/content/pages/'+index.id+'.json',root),'utf8')),a=arrangeArticle(page,findPage);
  const shown=[...a.chapters.map(c=>c.image),...a.details.map(d=>d.image),...a.photos].filter(Boolean).map(im=>im.src);
  assert.equal(new Set(shown).size,shown.length,page.title);
  for(const c of a.chapters)assert(c.section.paragraphs.length||c.section.items.length,page.title);
 }
});
