import {toPath} from './router.js';
import {recordPage} from './analytics.js';
// One place sets the document title, description and their social-card copies, so every route reads
// as its own page to search engines and link previews. Routes call setPageMeta from their own effect;
// App only handles the editor, so a parent effect never overwrites a page's title.
const fallback={title:'re.O｜循環材料與設計的可能。',description:'re.O 循環設計。以回收石材與再生材料製作公版與客製化獎盃，線上編輯銘版並下載排版預覽 PDF。'};
const clip=t=>{t=String(t||'').replace(/\s+/g,' ').trim();return t.length>150?t.slice(0,149)+'…':t};
function meta(attr,key,value){
 let el=document.head.querySelector(`meta[${attr}="${key}"]`);
 if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.append(el)}
 el.setAttribute('content',value);
}
// The deployed address comes from index.html's canonical (%SITE_URL%, filled at build time); empty in local builds.
// Read from the link-preview image, whose address never changes (the canonical is rewritten per page). A pattern, not
// the literal path: the sub-path build rewrites quoted /assets/ paths, which would also strip the repository name.
const site=typeof document==='undefined'?'':(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')||'').replace(/\/[a-z]+\/og-image\.jpg$/,'');
const appBase=import.meta.env?.BASE_URL||'/';
// trail: [[label, route name], …] from home to this page; written as BreadcrumbList data for search engines.
export function setPageMeta({title,description,trail}={}){
 const here=site+'/'+window.location.pathname.slice(appBase.length);
 const link=document.head.querySelector('link[rel=canonical]');if(link)link.setAttribute('href',here);
 meta('property','og:url',here);
 let crumbs=document.getElementById('reo-breadcrumb');
 if(trail?.length){
  if(!crumbs){crumbs=document.createElement('script');crumbs.type='application/ld+json';crumbs.id='reo-breadcrumb';document.head.append(crumbs)}
  crumbs.textContent=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:trail.map(([name,route],i)=>({'@type':'ListItem',position:i+1,name,item:site+'/'+toPath(route).slice(appBase.length)}))});
 }else crumbs?.remove();
 // tools/prerender.mjs saves a page once this names the address it asked for.
 document.documentElement.dataset.page=window.location.pathname;
 const t=title?`re.O｜${title}`:fallback.title,d=clip(description)||fallback.description;
 document.title=t;
 meta('name','description',d);meta('property','og:title',t);meta('property','og:description',d);
 meta('name','twitter:title',t);meta('name','twitter:description',d);
 recordPage();
}
