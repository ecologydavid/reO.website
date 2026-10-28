import index from '../data/content-index.json' with {type:'json'};
import cardBanners from '../data/card-images.json' with {type:'json'};
import casePhotos from '../data/case-photos.json' with {type:'json'};
import caseDetails from '../data/case-details.json' with {type:'json'};
export const pages=index.pages;
const urls=index.aliases;
const decodePath=path=>{try{return decodeURIComponent(path)}catch{return path}};
export function findPage(path){const decoded=decodePath(path);return pages.find(p=>decodePath(p.path)===decoded)||pages.find(p=>p.path===urls['https://www.re-o.co/'+decoded.replace(/^#\/read\//,'')]);}
export function resolveHref(path){const page=findPage(path);return page?.path||path}
export function isIndexPage(p){return ['/pages/material','/pages/case','/pages/news','/pages/trophy','/pages/recycling-design','/pages/recycle','/blog/posts','/pages/customer'].some(end=>p.path.endsWith(end))||p.category==='collections'||p.category==='archive'||p.path==='#/read/';}
export function materialGroup(p){if(/marble|glass/.test(p.path))return '石材與礦物';if(/wood|beam|chips/.test(p.path))return '木材與纖維';if(/coffee/.test(p.path))return '生活回收';return '產業副產物';}
export function caseGroup(p){if(/IP|聯名/.test(p.subcategory)||/Disney|Marvel|米奇|鋼鐵|金馬|LINE|Candace|8 Ball/i.test(p.title))return 'IP生活設計';if(/獎|杯|盃|獎牌/.test(p.title))return '企業獎盃';return '生活設計';}
export function groupFor(p,category){return category==='materials'?materialGroup(p):category==='cases'?caseGroup(p):p.subcategory||p.category_label;}
export const standardSlugs=['trophy','trophy-1','trophy-1-1','trophy-2025-1','the-way-to-peak-standard-trophy','f款-層疊獎牌。再生大理石。綠'];
export function editorFor(p){const slug=decodeURIComponent(p.path.split('/').pop());const i=standardSlugs.indexOf(slug);return i>=0?'ABCDEF'[i]:null}
export function collectionPages(category){
 if(category==='standard')return standardSlugs.map(slug=>pages.find(p=>decodeURIComponent(p.path)==='#/read/products/'+slug)).filter(Boolean);
 const result=pages.filter(p=>{if(isIndexPage(p))return false;if(category==='about')return ['about','contact'].includes(p.category);return p.category===category});
 if(category==='materials'){const order=['marble','glass','coffee','wooden','silt','chips','ash','veneer','aggergates'];result.sort((a,b)=>order.findIndex(x=>a.path.includes(x))-order.findIndex(x=>b.path.includes(x)))}return result;
}
const cache=new Map();
// Page JSON is fetched as-is from public/, so its image paths are rebased here for sub-path hosting
// (GitHub Pages); with the default base '/' this changes nothing. See vite.config.js.
const base=import.meta.env?.BASE_URL||'/';
const rebase=value=>typeof value==='string'?(base!=='/'&&/^\/(assets|content)\//.test(value)?base+value.slice(1):value):Array.isArray(value)?value.map(rebase):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rebase(v)])):value;
export function loadPage(id){if(!cache.has(id))cache.set(id,fetch('/content/pages/'+id+'.json').then(r=>{if(!r.ok)throw Error('讀取失敗');return r.json()}).then(rebase).catch(e=>{cache.delete(id);throw e}));return cache.get(id)}
// The old-site 2:1 banners print the client's name across the photo, so case cards show a clean
// product photo from the same page (case-photos.json, picked by hand) and name the client only on
// hover. Other pages keep their banner or hero.
export const isBanner=im=>Boolean(im)&&Math.abs(im.width/im.height-2)<.03;
export function cardImage(p){return casePhotos[p.path]||cardBanners[p.path]||p.hero}
// Two hand-checked detail shots per case (480px, case-details.json) and how many more photos the page has.
export const detailsFor=p=>caseDetails[p.path]||{details:[],more:0};
// Case titles name the client on either side of ｜: "作品｜T.B. Design x re.O", "作品｜快點行銷委製"
// or "台達｜作品". Returns the work and the client without the "x re.O" credit.
export function splitCase(title){
 const [a,...rest]=title.split('｜'),b=rest.join('｜');
 if(!b)return {work:a,client:''};
 const [work,client]=/re\.?[OＯ]\s*$|委製$/i.test(b)?[a,b]:[b,a];
 return {work,client:client.replace(/\s*x\s*re\.?[OＯ]\s*$|委製$/i,'').replace(/\s+x\s+/gi,' × ').trim()};
}
