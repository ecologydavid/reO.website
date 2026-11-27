import React,{useEffect,useRef,useState} from 'react';
import {small,half,third} from '../components/site/responsive.js';
import {findPage,loadPage,pages,resolveHref,editorFor,isIndexPage,isBanner,classicPages,splitCase,peekPage,cardImage} from './catalogue.js';
import {categoryInfo} from '../components/site/navigation.js';
import {SiteArrow} from '../components/site/SiteHeader.jsx';
import {studioTab} from '../components/site/ui.jsx';
import {ContentCard} from './ContentLibrary.jsx';
import {justifyRows} from './justify.js';
import {setPageMeta} from '../seo.js';
import {articleMeta,articleData} from './pageMeta.js';
import {priceOf} from './landings.jsx';
import {classicNames} from '../components/site/classics.js';
import {materials} from '../components/site/materials.js';
import DoorNote from '../components/site/DoorNote.jsx';
import {edgeFill} from './edgeFill.js';
import MaterialIntro from './MaterialIntro.jsx';
import ShippingPolicy from './ShippingPolicy.jsx';
import ClassicPage,{arrangeClassic} from './ClassicPage.jsx';
import {arrangeArticle,flowParagraphs} from './arrange.js';
const ratioOf=im=>im?.width&&im?.height?im.width/im.height:4/3;
const frameStyle=im=>({aspectRatio:String(ratioOf(im))});
const pad=n=>String(n).padStart(2,'0');
// Migrated summaries are often the first paragraphs run together; skip them when the lead already says it.
const repeats=(summary,section)=>Boolean(section?.paragraphs.some(p=>p&&(summary.includes(p.slice(0,24))||p.includes(summary.slice(0,24)))));
function Gallery({images,title,onOpen}){
 const box=useRef(null),[width,setWidth]=useState(1200);
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));observer.observe(box.current);return()=>observer.disconnect()},[]);
 const gap=width<600?8:12,target=Math.max(140,Math.min(360,width*.27)),rows=justifyRows(images.map(ratioOf),width,target,gap);
 return <div className="content-justified" ref={box}>{rows.map((row,r)=><div className="content-justified-row" key={r} style={row.open?{maxWidth:row.sum*target+gap*(row.items.length-1)}:undefined}>{row.items.map(i=>{const im=images[i];return <figure key={im.src} style={{flex:`${ratioOf(im)} 1 0`}}><button style={frameStyle(im)} onClick={()=>onOpen(im)} aria-label={`放大圖片 ${i+1}：${im.caption||im.alt||title}`}><img src={im.src} {...small(im,third)} alt={im.alt||`${title} 圖片 ${i+1}`} loading="lazy" width={im.width} height={im.height}/></button>{im.caption&&<figcaption>{im.caption}</figcaption>}</figure>})}</div>)}</div>;
}
function Section({section,index}){return <section className="content-prose-section" id={`section-${index}`}><h2>{section.heading||'內容介紹'}</h2>{flowParagraphs(section.paragraphs).map((p,i)=><p key={i}>{p}</p>)}{!!section.items.length&&<ul>{section.items.map((p,i)=><li key={i}>{p}</li>)}</ul>}</section>}
// v61 (owner, 2026-11-16): a portrait photo in a fixed (square) frame is shown whole, never losing its top
// and base; the frame's sides continue the photo's own edge colours (edgeFill), as on the case cards.
function Photo({image,title,onOpen,eager=false,ratio}){
 const whole=Boolean(ratio)&&ratioOf(image)<ratio*.85,[fill,setFill]=useState(null),img=useRef(null);
 const sample=()=>{if(whole)setFill(edgeFill(img.current))};
 useEffect(()=>{if(img.current?.complete)sample()},[image.src,whole]);
 return <button className="content-photo" style={{aspectRatio:String(ratio||ratioOf(image)),background:fill||undefined}} onClick={()=>onOpen(image)} aria-label={`放大圖片：${image.alt||title}`}><img ref={img} className={whole?'is-whole':undefined} src={image.src} {...small(image,half)} alt={image.alt||title} width={image.width} height={image.height} loading={eager?undefined:'lazy'} onLoad={sample}/></button>;
}
// Each text section sits beside its own photo, alternating sides, so the page reads image first.
function Chapter({chapter,index,title,onOpen}){
 const {section,image}=chapter;
 return <section className={`content-chapter${image?'':' is-text'}`} id={`section-${index}`} data-reveal>
  {image&&<figure style={{'--r':ratioOf(image)}}><Photo image={image} title={title} onOpen={onOpen}/></figure>}
  <div className="content-chapter-text"><p className="content-chapter-index">{pad(index)}</p><h2>{section.heading||'內容介紹'}</h2>{flowParagraphs(section.paragraphs).map((p,i)=><p key={i}>{p}</p>)}{!!section.items.length&&<ul>{section.items.map((p,i)=><li key={i}>{p}</li>)}</ul>}</div>
 </section>;
}
// Short captions from the old site ("揮竿軌跡弧形") become a row of captioned detail photos.
function Details({details,title,onOpen}){
 if(details.every(d=>d.image))return <section className="content-details" aria-label="設計細節" data-reveal>{details.map((d,i)=><figure key={i}><Photo image={d.image} title={d.text} onOpen={onOpen} ratio={1}/><figcaption><span>{pad(i+1)}</span>{d.text}</figcaption></figure>)}</section>;
 return <ul className="content-keywords" aria-label="設計重點">{details.map((d,i)=><li key={i}>{d.text}</li>)}</ul>;
}
// Material and service pages list their works; each entry leads with the linked case's own photo.
function Works({works}){
 return <section className="content-works" aria-labelledby="content-works-title">
  <header className="content-works-head"><p className="content-display" aria-hidden="true">Works</p><h2 id="content-works-title">應用作品</h2></header>
  <ol className="content-works-grid is-works">{works.map((w,i)=><li key={w.href} data-reveal><a href={w.href}>
   <span className="content-works-photo" style={isBanner(w.hero)?{aspectRatio:'2/1'}:undefined}><img src={w.hero.src} {...small(w.hero,third)} alt={w.hero.alt||w.title} width={w.hero.width} height={w.hero.height} loading="lazy"/></span>
   <span className="content-works-meta"><em>{pad(i+1)}</em>{w.year&&<span>{w.year}</span>}</span>
   <span className="content-works-title"><strong>{w.title}</strong><SiteArrow/></span>
   {w.line&&<span className="content-works-line">{w.line}</span>}
  </a></li>)}</ol>
 </section>;
}
// `draft` (admin preview): a page object shown as it is, without loading, page meta or list position.
export default function ContentReader({path,draft}){
 const index=draft||findPage(path),[loaded,setPage]=useState(()=>draft?null:peekPage(index?.id)),page=draft||loaded,[error,setError]=useState(''),[gallery,setGallery]=useState(8),[lightbox,setLightbox]=useState(null);
 const closeImage=useRef(null),root=useRef(null);
 useEffect(()=>{if(draft)return;let live=true;setPage(peekPage(index?.id));setError('');setGallery(8);if(!index){setError('找不到這篇內容。');return}loadPage(index.id).then(p=>{if(live){setPage(p);const cat=editorFor(p)||p.subcategory==='公版獎盃'?'standard':categoryInfo[p.category]?p.category:'about';const id=editorFor(p),stuff=materials.find(m=>m[2]===decodeURIComponent(p.path.split('/').pop())),extra={classic:id?{id,name:classicNames[id],price:priceOf(id)}:null,material:stuff?[stuff[0],stuff[1]]:null},shot=cardImage(index)||p.hero;setPageMeta({...articleMeta(index,extra),trail:[['首頁','#/'],[categoryInfo[cat].label,`#/explore/${cat}`],[p.title,p.path]],image:shot,data:articleData(index,{...extra,image:shot})})}}).catch(()=>{if(live)setError('內容暫時無法載入，請重新整理。')});return()=>{live=false}},[index?.id,Boolean(draft)]);
 useEffect(()=>{if(!lightbox)return;const old=document.body.style.overflow,previous=document.activeElement;document.body.style.overflow='hidden';closeImage.current?.focus();const key=e=>{if(e.key==='Escape')setLightbox(null);if(e.key==='Tab'){e.preventDefault();closeImage.current?.focus()}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);previous?.focus()}},[lightbox]);
 useEffect(()=>{if(!page||!root.current)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.04});root.current.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[page,gallery]);
 if(error)return <main className="content-not-found folio-gutter"><h1>{error}</h1><a className="folio-link" href="#/explore/cases">探索站內內容<SiteArrow/></a></main>;
 if(!page)return <main className="content-loading folio-gutter" role="status">正在讀取內容…</main>;
 const category=editorFor(page)||page.subcategory==='公版獎盃'?'standard':categoryInfo[page.category]?page.category:'about',label=categoryInfo[category].label,editor=editorFor(page);
 const metadata=[['client','客戶'],['year','年份'],['material','材質'],['service','服務'],['kind','類別']].filter(([k])=>page.metadata[k]);
 // v63 wayfinding: a detail page knows its place in its list. Previous and next follow the list's own order, and
 // 繼續探索 shows the three entries after the next one (it used to repeat the list's first three on every page).
 const siblings=classicPages(category==='standard'?'standard':page.category),at=siblings.findIndex(p=>p.id===page.id);
 const prev=at>0?siblings[at-1]:null,next=at>=0&&at<siblings.length-1?siblings[at+1]:null;
 const related=at>=0?[2,3,4].map(k=>siblings[(at+k)%siblings.length]).filter((p,i,a)=>p&&p.id!==page.id&&p!==prev&&p!==next&&a.indexOf(p)===i):pages.filter(p=>p.category===page.category&&p.id!==page.id&&!isIndexPage(p)).slice(0,3);
 const short=p=>page.category==='cases'?splitCase(p.title).work:p.title.split('｜')[0];
 const {first,chapters,details,works,photos,plain}=arrangeArticle(page,findPage);
 const lead=first&&(page.path==='#/read/about/delivery-policy'?<ShippingPolicy section={first}/>:<Section section={first} index={0}/>);
 // v65: a material page opens with MaterialIntro (photo, name, its opening text) instead of the plain heading and lead.
 const material=page.category==='materials'&&!isIndexPage(page)&&!!page.hero;
 // v1.7.0: the five classic models open as a designed page (ClassicPage), photo strip included (v1.8.0).
 const classic=editor&&!draft?arrangeClassic(page):null,shown=classic?[]:photos;
 const toWorks=()=>document.getElementById('material-works')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 return <main className={`content-reader folio-gutter ${!page.hero?'text-only':''}`} ref={root}><nav className="content-breadcrumb has-back" aria-label="麵包屑"><a className="content-back" href={`#/explore/${category}`}><span aria-hidden="true">←</span>返回{label}</a><a href="#/">首頁</a><span aria-hidden="true">/</span><a href={`#/explore/${category}`}>{label}</a><span aria-hidden="true">/</span><span aria-current="page">{classic?`${editor} 款 ${classicNames[editor]}`:page.title}</span></nav>{classic?<ClassicPage page={page} id={editor} data={classic} onOpen={setLightbox}/>:material?<MaterialIntro page={page} lead={flowParagraphs([...(page.summary&&!repeats(page.summary,first)?[page.summary]:[]),...(first?.paragraphs||[])])} onWorks={works||chapters.length?toWorks:null}/>:<><div className="content-article-heading"><div><h1>{page.title}</h1>{page.subcategory&&<p>{page.subcategory}</p>}{page.published&&<p className="content-date">發表於 <time dateTime={page.published}>{page.published.replace(/-/g,'.')}</time></p>}</div><dl className="content-metadata">{metadata.map(([key,label])=><div key={key}><dt>{label}</dt><dd>{Array.isArray(page.metadata[key])?page.metadata[key].join('、'):String(page.metadata[key])}</dd></div>)}</dl></div>{editor&&<div className="content-product-cta"><p>選擇這款公版獎盃，編排你的專屬文字與圖案。</p><a className="folio-link" href={`#/preview/${editor}`} {...studioTab}>以 {editor} 款進入銘版排版工作室<SiteArrow/></a></div>}
   <div className={`content-article-lead${page.hero&&ratioOf(page.hero)<.9?' is-portrait':''}`}>{page.hero&&<figure style={{'--r':ratioOf(page.hero)}}><button style={frameStyle(page.hero)} onClick={()=>setLightbox(page.hero)} aria-label={`放大圖片：${page.title}`}><img src={page.hero.src} {...small(page.hero,half)} alt={page.hero.alt||page.title} width={page.hero.width} height={page.hero.height} fetchPriority="high"/></button></figure>}<div>{page.summary&&!repeats(page.summary,first)&&<p className="content-intro">{page.summary}</p>}{lead}{page.path==='#/read/pages/chanz-studio'&&<DoorNote/>}</div></div></>}
   {classic?null:plain?!!chapters.length&&<div className="content-article-body"><aside className="content-toc" aria-label="本頁內容"><span>本頁內容</span>{chapters.map((c,i)=><a key={i} href={`#${page.path.slice(1)}?section=${i+1}`} onClick={e=>{e.preventDefault();document.getElementById(`section-${i+1}`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}}>{c.section.heading||'內容介紹'}</a>)}</aside><div className="content-prose">{chapters.map((c,i)=><Section section={c.section} index={i+1} key={i}/>)}</div></div>
   :<div className="content-chapters">{details.length>0&&<Details details={details} title={page.title} onOpen={setLightbox}/>}{chapters.map((c,i)=><Chapter chapter={c} index={i+1} title={page.title} onOpen={setLightbox} key={i}/>)}</div>}
   {!!shown.length&&<section className="content-gallery" id="article-gallery"><header className="content-gallery-head"><h2>{works?'材料與工藝':'更多照片'}</h2><span>{pad(shown.length)}</span></header><Gallery images={shown.slice(0,gallery)} title={page.title} onOpen={setLightbox}/>{shown.length>gallery&&<button className="content-load-more" onClick={()=>setGallery(gallery+12)}>查看更多照片（{shown.length-gallery}）<SiteArrow/></button>}</section>}
   {/* v72: 材料與工藝 (origin and process) first, then the works. */}
   {material&&<span id="material-works" className="content-anchor"/>}
   {works&&<Works works={works}/>}
   {!works&&!classic&&!!page.links.length&&<section className="content-local-links"><h2>延伸閱讀與相關內容</h2>{page.links.map(l=><a href={resolveHref(l.path)} key={l.path}>{l.label}<SiteArrow/></a>)}</section>}
   {(prev||next)&&<nav className="content-pager" aria-label="同一列表的上一篇與下一篇">
    {prev?<a className="is-prev" href={prev.path}><em><span aria-hidden="true">←</span>上一則</em><strong>{short(prev)}</strong></a>:<span/>}
    <a className="is-all" href={`#/explore/${category}`}>回到{label}</a>
    {next?<a className="is-next" href={next.path}><em>下一則<span aria-hidden="true">→</span></em><strong>{short(next)}</strong></a>:<span/>}
   </nav>}
   {related.length>0&&<section className="content-related"><div><h2>繼續探索</h2><a className="folio-link" href={`#/explore/${category}`}>全部{label}<SiteArrow/></a></div><div className="content-grid">{related.map(p=><ContentCard page={p} key={p.id}/>)}</div></section>}
   {lightbox&&<div className="content-lightbox" role="dialog" aria-modal="true" aria-label="圖片放大檢視" onClick={()=>setLightbox(null)}><button ref={closeImage} className="content-lightbox-close" onClick={()=>setLightbox(null)}>關閉圖片 ×</button><img src={lightbox.src} alt={lightbox.alt||page.title}/></div>}
 </main>
}
