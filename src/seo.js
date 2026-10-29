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
export function setPageMeta({title,description}={}){
 const t=title?`re.O｜${title}`:fallback.title,d=clip(description)||fallback.description;
 document.title=t;
 meta('name','description',d);meta('property','og:title',t);meta('property','og:description',d);
 meta('name','twitter:title',t);meta('name','twitter:description',d);
}
