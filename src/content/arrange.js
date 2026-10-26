// Turns a migrated page into an image-led article: lead text, photo chapters, captioned details,
// a works index (material and service pages) and the photos left over for the gallery.
import {cardImage} from './catalogue.js';
const ratio=im=>im.width/im.height;
// Social-share cards (1200×630), thumbnails and thin banners never anchor a chapter.
const isCard=im=>im.width<700||(im.width===1200&&im.height===630);
const fitsChapter=im=>!isCard(im)&&ratio(im)<=2.2;
const isFiller=s=>!s.items.length&&s.paragraphs.join('')==='商品描述';
// Old case pages follow the concept text with three short captions, one per detail photo.
const isCaption=s=>!s.heading&&!s.items.length&&s.paragraphs.length===1&&s.paragraphs[0].length<=16;
// e.g. ["木橫擔｜大理石","WOODEN CROSSRAM | MARBLE"]; the metadata already names the material.
const isMaterialLabel=s=>!s.heading&&s.paragraphs.length===2&&/^[A-Z0-9 |&.\-]+$/.test(s.paragraphs[1]);
const yearLine=t=>/^\/\s*\d{4}/.test(t);

function worksFor(page,rest,find){
 if(!['materials','services'].includes(page.category)||!rest.length||rest.length!==page.links.length)return null;
 const works=rest.map((s,i)=>{
  const link=page.links[i],target=find(link.path),texts=s.paragraphs.filter(Boolean);
  const title=s.heading||texts.shift()||link.label,year=texts.find(yearLine);
  return {title,year:year?.replace(/^\/\s*/,'').replace(/-/g,'–'),line:texts.find(t=>t!==year)||'',href:target?.path||link.path,hero:target&&cardImage(target)};
 });
 return works.every(w=>w.hero)?works:null;
}

export function arrangeArticle(page,find){
 const hasMeta=Boolean(page.metadata?.client||page.metadata?.year);
 const sections=page.sections.filter(s=>(s.paragraphs.length||s.items.length)&&!isFiller(s)&&!(hasMeta&&s.heading==='詳細資訊'));
 const first=sections[0],rest=sections.slice(1),others=page.images.filter(im=>im.src!==page.hero?.src);
 const works=worksFor(page,rest,find);
 if(works)return {first,chapters:[],details:[],works,photos:others.filter(im=>!isCard(im)&&!/點擊/.test(im.alt||'')),plain:false};
 if(!page.images.length)return {first,chapters:rest.map(section=>({section})),details:[],works:null,photos:[],plain:true};
 const used=new Set();
 let details=rest.filter(isCaption).map(s=>({text:s.paragraphs[0]}));
 const slots=others.slice(1,1+details.length);
 if(details.length&&slots.length===details.length&&slots.every(im=>!isCard(im)&&ratio(im)>.6&&ratio(im)<1.7)){details=details.map((d,i)=>({...d,image:slots[i]}));slots.forEach(im=>used.add(im))}
 const body=rest.filter(s=>!isCaption(s)&&!(isMaterialLabel(s)&&page.metadata?.material));
 const free=others.filter(im=>!used.has(im)&&fitsChapter(im));
 const chapters=body.map(section=>{const image=free.shift();if(image)used.add(image);return {section,image}});
 return {first,chapters,details,works:null,photos:others.filter(im=>!used.has(im)&&!isCard(im)),plain:false};
}
