import React,{useEffect,useRef,useState} from 'react';
import {findPage,loadPage,pages,resolveHref,editorFor,isIndexPage,isBanner} from './catalogue.js';
import {categoryInfo} from '../components/site/navigation.js';
import {SiteArrow} from '../components/site/SiteHeader.jsx';
import {ContentCard} from './ContentLibrary.jsx';
import {justifyRows} from './justify.js';
import {setPageMeta} from '../seo.js';
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
 return <div className="content-justified" ref={box}>{rows.map((row,r)=><div className="content-justified-row" key={r} style={row.open?{maxWidth:row.sum*target+gap*(row.items.length-1)}:undefined}>{row.items.map(i=>{const im=images[i];return <figure key={im.src} style={{flex:`${ratioOf(im)} 1 0`}}><button style={frameStyle(im)} onClick={()=>onOpen(im)} aria-label={`放大圖片 ${i+1}：${im.caption||im.alt||title}`}><img src={im.src} alt={im.alt||`${title} 圖片 ${i+1}`} loading="lazy" width={im.width} height={im.height}/></button>{im.caption&&<figcaption>{im.caption}</figcaption>}</figure>})}</div>)}</div>;
}
function Section({section,index}){return <section className="content-prose-section" id={`section-${index}`}><h2>{section.heading||'內容介紹'}</h2>{flowParagraphs(section.paragraphs).map((p,i)=><p key={i}>{p}</p>)}{!!section.items.length&&<ul>{section.items.map((p,i)=><li key={i}>{p}</li>)}</ul>}</section>}
function Photo({image,title,onOpen,eager=false,ratio}){return <button className="content-photo" style={{aspectRatio:String(ratio||ratioOf(image))}} onClick={()=>onOpen(image)} aria-label={`放大圖片：${image.alt||title}`}><img src={image.src} alt={image.alt||title} width={image.width} height={image.height} loading={eager?undefined:'lazy'}/></button>}
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
   <span className="content-works-photo" style={isBanner(w.hero)?{aspectRatio:'2/1'}:undefined}><img src={w.hero.src} alt={w.hero.alt||w.title} width={w.hero.width} height={w.hero.height} loading="lazy"/></span>
   <span className="content-works-meta"><em>{pad(i+1)}</em>{w.year&&<span>{w.year}</span>}</span>
   <span className="content-works-title"><strong>{w.title}</strong><SiteArrow/></span>
   {w.line&&<span className="content-works-line">{w.line}</span>}
  </a></li>)}</ol>
 </section>;
}
export default function ContentReader({path}){
 const index=findPage(path),[page,setPage]=useState(null),[error,setError]=useState(''),[gallery,setGallery]=useState(8),[lightbox,setLightbox]=useState(null);
 const closeImage=useRef(null),root=useRef(null);
 useEffect(()=>{let live=true;setPage(null);setError('');setGallery(8);if(!index){setError('找不到這篇內容。');return}loadPage(index.id).then(p=>{if(live){setPage(p);setPageMeta({title:p.title.replace(/｜/g,' '),description:p.summary})}}).catch(()=>{if(live)setError('內容暫時無法載入，請重新整理。')});return()=>{live=false}},[index?.id]);
 useEffect(()=>{if(!lightbox)return;const old=document.body.style.overflow,previous=document.activeElement;document.body.style.overflow='hidden';closeImage.current?.focus();const key=e=>{if(e.key==='Escape')setLightbox(null);if(e.key==='Tab'){e.preventDefault();closeImage.current?.focus()}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);previous?.focus()}},[lightbox]);
 useEffect(()=>{if(!page||!root.current)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.04});root.current.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[page,gallery]);
 if(error)return <main className="content-not-found folio-gutter"><h1>{error}</h1><a className="folio-link" href="#/explore/cases">探索站內內容<SiteArrow/></a></main>;
 if(!page)return <main className="content-loading folio-gutter" role="status">正在讀取內容…</main>;
 const category=editorFor(page)||page.subcategory==='公版獎盃'?'standard':categoryInfo[page.category]?page.category:'about',label=categoryInfo[category].label,editor=editorFor(page);
 const metadata=[['client','客戶'],['year','年份'],['material','材質'],['service','服務'],['kind','類別']].filter(([k])=>page.metadata[k]);
 const related=pages.filter(p=>p.category===page.category&&p.id!==page.id&&!isIndexPage(p)&&(category!=='standard'||p.subcategory==='公版獎盃')).slice(0,3);
 const {first,chapters,details,works,photos,plain}=arrangeArticle(page,findPage);
 const lead=first&&<Section section={first} index={0}/>;
 return <main className={`content-reader folio-gutter ${!page.hero?'text-only':''}`} ref={root}><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><a href={`#/explore/${category}`}>{label}</a><span>/</span><span>{page.title}</span></nav><div className="content-article-heading"><div><h1>{page.title}</h1>{page.subcategory&&<p>{page.subcategory}</p>}</div><dl className="content-metadata">{metadata.map(([key,label])=><div key={key}><dt>{label}</dt><dd>{Array.isArray(page.metadata[key])?page.metadata[key].join('、'):String(page.metadata[key])}</dd></div>)}</dl></div>{editor&&<div className="content-product-cta"><p>選擇這款公版獎盃，編排你的專屬文字與圖案。</p><a className="folio-link" href={`#/preview/${editor}`}>進入 {editor} 款排版工作室<SiteArrow/></a></div>}
   <div className={`content-article-lead${page.hero&&ratioOf(page.hero)<.9?' is-portrait':''}`}>{page.hero&&<figure style={{'--r':ratioOf(page.hero)}}><button style={frameStyle(page.hero)} onClick={()=>setLightbox(page.hero)} aria-label={`放大圖片：${page.title}`}><img src={page.hero.src} alt={page.hero.alt||page.title} width={page.hero.width} height={page.hero.height} fetchPriority="high"/></button></figure>}<div>{page.summary&&!repeats(page.summary,first)&&<p className="content-intro">{page.summary}</p>}{lead}</div></div>
   {plain?!!chapters.length&&<div className="content-article-body"><aside className="content-toc" aria-label="本頁內容"><span>本頁內容</span>{chapters.map((c,i)=><a key={i} href={`#${page.path.slice(1)}?section=${i+1}`} onClick={e=>{e.preventDefault();document.getElementById(`section-${i+1}`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}}>{c.section.heading||'內容介紹'}</a>)}</aside><div className="content-prose">{chapters.map((c,i)=><Section section={c.section} index={i+1} key={i}/>)}</div></div>
   :<div className="content-chapters">{details.length>0&&<Details details={details} title={page.title} onOpen={setLightbox}/>}{chapters.map((c,i)=><Chapter chapter={c} index={i+1} title={page.title} onOpen={setLightbox} key={i}/>)}</div>}
   {works&&<Works works={works}/>}
   {!!photos.length&&<section className="content-gallery" id="article-gallery"><header className="content-gallery-head"><h2>{works?'材料與工藝':'更多照片'}</h2><span>{pad(photos.length)}</span></header><Gallery images={photos.slice(0,gallery)} title={page.title} onOpen={setLightbox}/>{photos.length>gallery&&<button className="content-load-more" onClick={()=>setGallery(gallery+12)}>查看更多照片（{photos.length-gallery}）<SiteArrow/></button>}</section>}
   {!works&&!!page.links.length&&<section className="content-local-links"><h2>延伸閱讀與相關內容</h2>{page.links.map(l=><a href={resolveHref(l.path)} key={l.path}>{l.label}<SiteArrow/></a>)}</section>}
   {related.length>0&&<section className="content-related"><div><h2>繼續探索</h2><a className="folio-link" href={`#/explore/${category}`}>全部{label}<SiteArrow/></a></div><div className="content-grid">{related.map(p=><ContentCard page={p} key={p.id}/>)}</div></section>}
   {lightbox&&<div className="content-lightbox" role="dialog" aria-modal="true" aria-label="圖片放大檢視" onClick={()=>setLightbox(null)}><button ref={closeImage} className="content-lightbox-close" onClick={()=>setLightbox(null)}>關閉圖片 ×</button><img src={lightbox.src} alt={lightbox.alt||page.title}/></div>}
 </main>
}
