import React,{useEffect,useMemo,useRef,useState} from 'react';
import {categoryInfo} from '../components/site/navigation.js';
import {collectionPages,groupFor,editorFor,cardImage,isBanner,splitCase,detailsFor} from './catalogue.js';
import {SiteArrow} from '../components/site/SiteHeader.jsx';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {landings} from './landings.jsx';
import {setPageMeta} from '../seo.js';
import './pages.css';
const pad=n=>String(n).padStart(2,'0');
const cta=page=>page.category==='materials'?'閱讀材料應用':page.category==='cases'?'閱讀完整案例':page.category==='products'?'查看商品詳情':'閱讀完整內容';
// Small card kept for related-content rows on article pages. Pages without a photo (policies, guides)
// get a text card under an ink rule rather than an empty grey box.
export function ContentCard({page}){const image=cardImage(page);return <article className={`content-entry${image?'':' is-text'}`}>{image&&<a className="content-entry-image" href={page.path} style={isBanner(image)?{aspectRatio:'2/1'}:undefined}><img src={image.src} alt={image.alt||page.title} loading="lazy" width={image.width} height={image.height}/></a>}<p className="content-entry-category">{page.subcategory||page.category_label}</p><h2><a href={page.path}>{page.title}</a></h2><p className="content-entry-description">{page.summary}</p><a className="folio-link" href={page.path}>{cta(page)}<SiteArrow/></a></article>}
// Case photo. On hover the photo narrows (to its own shape where it can, so the whole piece shows)
// and two detail shots slide in beside it, the last one counting the photos still to see; the client
// rises in a tab at the lower left. Details load on the first hover only.
export function CasePhoto({page,image,client}){
 const [peek,setPeek]=useState(false),{details,more}=detailsFor(page);
 const main=details.length?Math.min(.72,Math.max(.56,image.width/image.height*.75)):1;
 return <span className={`content-works-photo${details.length?' has-details':''}`} style={{'--main':main,'--n':details.length||1}} onPointerEnter={()=>setPeek(true)}>
  <img className="content-works-main" src={image.src} alt={image.alt||page.title} width={image.width} height={image.height} loading="lazy"/>
  {peek&&details.map((d,i)=><span className="content-works-detail" style={{'--i':i}} key={d.src}><img src={d.src} alt="" width={d.width} height={d.height}/>{i===details.length-1&&more>0&&<em>+{more}</em>}</span>)}
  {client&&<span className="content-works-client"><em>Client</em><span>{client}</span></span>}
 </span>;
}
// Index entry in the same language as the works index: photo, number and group, title, one line.
// Case cards lead with the work; the client's name stays off the photo until hover or focus.
function Entry({page,index,group,showLine}){
 const isCase=page.category==='cases',image=cardImage(page),[first,...rest]=page.title.split('｜');
 const {work:title,client}=isCase?splitCase(page.title):{work:first,client:''},line=isCase?'':rest.join('｜')||(showLine?page.summary:'');
 return <li data-reveal><a href={page.path}>
  {isCase&&image?<CasePhoto page={page} image={image} client={client}/>:<span className="content-works-photo" style={isBanner(image)?{aspectRatio:'2/1'}:undefined}>{image?<img src={image.src} alt={image.alt||page.title} width={image.width} height={image.height} loading="lazy"/>:<span className="content-type-letter">{page.category_label}</span>}</span>}
  <span className="content-works-meta"><em>{pad(index+1)}</em><span>{group}</span></span>
  <span className="content-works-title"><strong>{title}</strong><SiteArrow/></span>
  {line&&<span className="content-works-line">{line}</span>}
 </a></li>;
}
export default function ContentLibrary({category,filter:initialFilter=''}){
 const info=categoryInfo[category]||categoryInfo.cases,landing=landings[category]||{};
 const [filter,setFilter]=useState(initialFilter),[query,setQuery]=useState(''),[limit,setLimit]=useState(12);
 const root=useRef(null),index=useRef(null);
 const pool=useMemo(()=>collectionPages(category),[category]);
 const filters=useMemo(()=>[...new Set(pool.map(p=>groupFor(p,category)).filter(Boolean))],[pool,category]);
 const counts=useMemo(()=>Object.fromEntries(filters.map(f=>[f,pool.filter(p=>groupFor(p,category)===f).length])),[filters,pool,category]);
 useEffect(()=>{setFilter(initialFilter);setQuery('');setLimit(12);setPageMeta({title:info.label,description:info.intro})},[category,initialFilter,info.label]);
 const found=useMemo(()=>pool.filter(p=>(!filter||groupFor(p,category)===filter||(filter==='生活回收'&&/glass/.test(p.path)))&&(!query||(p.title+' '+p.summary+' '+JSON.stringify(p.metadata)).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))),[pool,filter,category,query]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.06});root.current.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[category,found,limit]);
 const choose=f=>{setFilter(f);setLimit(12);index.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 return <main className={`pg pg-library pg-${category}`} ref={root}>
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>{info.label}</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title">{landing.en&&<p className="content-display" aria-hidden="true">{landing.en}</p>}<h1>{landing.title||info.label}</h1><p>{info.intro}</p></div>
   {landing.card&&<div className={`pg-contact${landing.card==='groups'?' is-groups':''}`}>
    <dl>{landing.card==='groups'?filters.map(f=><div key={f}><dt><button className="pg-filter-link" onClick={()=>choose(f)}>{f}</button></dt><dd><strong>{counts[f]}</strong><span>{landing.unit}</span></dd></div>):landing.card.map(([en,label,value])=><div key={en}><dt><span>{en}</span>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="pg-actions">{landing.actions.map(([label,href,variant])=><Button key={href} href={href} variant={variant}>{label}</Button>)}</div>
   </div>}
  </header>
  {landing.hero&&<figure className="pg-hero"><img src={landing.hero.src} alt={landing.hero.alt} width={landing.hero.width} height={landing.hero.height} fetchPriority="high" style={{objectPosition:landing.hero.position}}/></figure>}
  {landing.band&&<landing.band/>}

  <section className="pg-index folio-gutter" ref={index} aria-labelledby="pg-index-title">
   <header className="content-works-head"><p className="content-display" aria-hidden="true">{landing.indexEn||'Index'}</p><h2 id="pg-index-title">{landing.indexTitle||`全部${info.label}`}</h2></header>
   {(filters.length>1||pool.length>12)&&<div className="content-tools"><div className="content-filters" aria-label="內容分類篩選"><button aria-pressed={!filter} onClick={()=>{setFilter('');setLimit(12)}}>全部</button>{filters.map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);setLimit(12)}}>{f}</button>)}</div><label className="content-search"><span>搜尋{info.label}</span><input value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}} type="search" placeholder="搜尋材料、作品或品牌" aria-label={`搜尋${info.label}`}/></label></div>}
   <p className="content-result-count" role="status">{found.length} 件{filter?`・${filter}`:''}</p>
   <ol className={`content-works-grid ${landing.grid||''}`}>{found.slice(0,limit).map((p,i)=><Entry page={p} index={i} group={editorFor(p)?`${editorFor(p)} 款`:groupFor(p,category)} showLine={category==='materials'} key={p.id}/>)}</ol>
   {!found.length&&<div className="content-empty"><h2>目前沒有符合的內容。</h2><p>試著使用品牌名稱、材質或作品名稱搜尋。</p><button className="folio-link" onClick={()=>{setFilter('');setQuery('')}}>清除搜尋與篩選<SiteArrow/></button></div>}
   {found.length>limit&&<button className="content-load-more" onClick={()=>setLimit(limit+12)}>載入更多內容（{found.length-limit}）<SiteArrow/></button>}
  </section>

  {landing.closing&&<section className="pg-closing folio-gutter" data-reveal><p>{landing.closing[0]}</p><div className="pg-actions">{landing.closing.slice(1).map(([label,href],i)=>i?<ArrowLink key={href} href={href}>{label}</ArrowLink>:<Button key={href} href={href} variant="ghost">{label}</Button>)}</div></section>}
 </main>;
}
