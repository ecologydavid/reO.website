import React,{useCallback,useEffect,useId,useRef,useState} from 'react';
import models from '../data/models.json';
import SiteHeader from './site/SiteHeader.jsx';
import SiteFooter from './site/SiteFooter.jsx';
import LogoWall from './site/LogoWall.jsx';
import ShopWindow from './site/ShopWindow.jsx';
import {siteStats} from './site/stats.js';
import GoldDust from './GoldDust.jsx';
import {setPageMeta} from '../seo.js';
import {Arrow,Button,SectionHead,Frame} from './site/ui.jsx';
import './home.css';
import './home-v10.css';

// Recycled-marble process in eight steps. The material page charts three stages (廢棄回收・研磨成粉・
// 比例澆注); the journal articles 重新定義「廢料」, 實驗再生材質, 強化材質脫氣升級 and 工廠步驟把關
// describe the steps in between. Photos come from those same pages.
const sequence=[
 {label:'石材切割',line:'大理石原塊切割後，留下破碎邊角料。',src:'/content/images/28a451782e04bc72f1.webp',alt:'切割機正在切割大理石原塊',width:1440,height:960},
 {label:'廢棄回收',line:'回收邊角料，重新成為材料來源。',src:'/content/images/4c8f7e6331677eaa2e.webp',alt:'回收的大理石加工邊角料',width:810,height:1440},
 {label:'破碎研磨',line:'破碎、乾燥、過篩，讓碎塊統一成粉。',src:'/content/images/f7cf2451cb151f0457.webp',alt:'破碎後的大理石邊料',width:1440,height:1440},
 {label:'比例調配',line:'經材質實驗與比例優化，與樹脂調和。',src:'/content/images/002e36c018ceece1c4.webp',alt:'re.O 工作室的材料調配容器',width:1440,height:1080},
 {label:'振動脫氣',line:'高頻振動與真空腔，去除材質中的氣泡。',src:'/content/images/70c8dcab73d64c4d81.webp',alt:'re.O 工作室的真空脫氣設備',width:1440,height:1080},
 {label:'倒模成型',line:'以設計模具灌注、固化成形。',src:'/content/images/0b9cc353f2982e96ef.webp',alt:'成排的灌注模具',width:1440,height:1440},
 {label:'品質檢驗',line:'逐一挑出毛刺、白點、指痕與灰塵。',src:'/content/images/eaa0be28bf809c8400.webp',alt:'B 款獎盃再生大理石構件與木質盃身的表面細節',width:1317,height:988},
 {label:'打磨組裝',line:'回到工作室研磨、組裝，完成作品。',src:'/content/images/e8b500fc458fa120e4.webp',alt:'B 款獎盃 木客微光 × 匠子 完成品',width:1440,height:1080,top:true}
];
// Four phases carry the idea at a glance (scrap becomes a trophy); each holds two consecutive steps.
const phases=[
 {en:'Reclaim',name:'回收',note:'邊角料成為原料'},
 {en:'Regenerate',name:'再生',note:'研磨成粉，重新調配'},
 {en:'Reform',name:'成形',note:'灌注成新的石材'},
 {en:'Reuse',name:'再利用',note:'檢驗打磨，成為獎盃'}
];
const pad=n=>String(n).padStart(2,'0');
// D and E lead the hero. Positions keep every trophy outside the headline column at any width;
// D swaps to its three-colour photo only when the stage is wide enough to show all three. The panel's
// haze is a 160px copy blurred ahead of time, so no live blur filter runs over the hero.
const slideMs=12000;
const heroSlides=[
 {id:'E',name:'The way to PEAK',src:'/assets/hero-wide.webp',haze:'/assets/hero-haze-E.webp',width:2400,height:1800,position:'37% 60%',alt:'E 款 The way to PEAK 黑金與白銀再生大理石公版獎盃'},
 {id:'D',name:'再生大理石・白／黑／綠',src:'/content/images/8485826e9190eb7057.webp',wide:'/content/images/0ec85ee98fb1103204.webp',haze:'/assets/hero-haze-D.webp',width:1440,height:1080,position:'50% 58%',widePosition:'41% 58%',alt:'D 款再生大理石公版獎盃'}
];
function Hero({onPreview}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[away,setAway]=useState(false),hero=useRef(null),[wide,setWide]=useState(()=>matchMedia('(min-width: 1280px)').matches);
 useEffect(()=>{const query=matchMedia('(min-width: 1280px)'),change=()=>setWide(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
 // Off screen the slow zoom and the progress bar pause, so the hero costs nothing while you read on.
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setAway(!entry.isIntersecting));observer.observe(hero.current);return()=>observer.disconnect()},[]);
 // Endless loop, 12s per slide. With motion the progress bar drives the change (so pausing freezes
 // it exactly); under reduced motion a plain timer does. The pause button satisfies WCAG 2.2.2.
 const next=useCallback(()=>setActive(a=>(a+1)%heroSlides.length),[]),still=useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{if(paused||away||!still.current)return;const timer=setTimeout(next,slideMs);return()=>clearTimeout(timer)},[active,paused,away,next]);
 const slide=heroSlides[active],srcOf=s=>wide&&s.wide?s.wide:s.src;
 return <section className={`rv-hero${paused?' is-paused':''}${away?' is-away':''}`} ref={hero} aria-labelledby="rv-hero-title" aria-roledescription="輪播">
  <GoldDust gust={active} running={!paused}/>
  {/* A frosted column carries the headline; the featured trophy stays clear beside it. */}
  <div className="rv-hero-panel">
   {heroSlides.map((s,i)=><img key={s.id} className={`rv-hero-haze${i===active?' is-active':''}`} src={s.haze} alt="" aria-hidden="true"/>)}
   <p className="rv-hero-kicker"><span>re.O</span>循環設計</p>
   <div className="rv-hero-copy">
    <h1 id="rv-hero-title"><span><span>回收石材，</span></span><span><span>灌注新的榮耀。</span></span></h1>
    <p>大理石邊料研磨成粉，與樹脂調配、澆注、打磨。</p>
    <div className="rv-hero-actions"><Button href="#collection" variant="light">探索公版獎盃</Button><Button onClick={()=>onPreview(slide.id)} variant="glass">開始 {slide.id} 款排版</Button></div>
    <div className="rv-hero-picks"><p><span>A–F</span>選一款開始排版</p><ul>{models.map(m=><li key={m.id}><button onClick={()=>onPreview(m.id)} aria-label={`開始 ${m.id} 款 ${m.name} 排版`}><img src={`/assets/product-thumb-${m.id}.webp`} alt="" width="360" height="270"/><span>{m.id}</span></button></li>)}</ul></div>
   </div>
   <ul className="rv-hero-stats">{siteStats.map(([n,label,href])=><li key={label}><a href={href}><strong>{n}</strong><span>{label}</span></a></li>)}</ul>
  </div>
  <div className="rv-hero-stage">
   {heroSlides.map((s,i)=><img key={s.id} className={`rv-hero-photo${i===active?' is-active':''}`} src={srcOf(s)} alt={i===active?s.alt:''} aria-hidden={i!==active||undefined} width={s.width} height={s.height} style={{objectPosition:wide&&s.wide?s.widePosition:s.position}} fetchPriority={i?undefined:'high'}/>)}
   <div className="rv-hero-tabs" role="group" aria-label="主推公版獎盃">{heroSlides.map((s,i)=><button key={s.id} aria-pressed={i===active} onClick={()=>setActive(i)}><span className="rv-hero-bar">{i===active&&<i key={active} onAnimationEnd={next}/>}</span><strong>{s.id}</strong><span>{s.name}</span></button>)}<button className="rv-hero-toggle" onClick={()=>setPaused(p=>!p)} aria-label={paused?'播放輪播':'暫停輪播'}><svg viewBox="0 0 16 16" aria-hidden="true"><path d={paused?'M5 3.5v9l7.5-4.5z':'M5 3.5v9M11 3.5v9'} fill={paused?'currentColor':'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
  </div>
 </section>;
}
// The film turning from the end of one strip to the start of the next: two true quarter-circle turns
// drawn at the real pixel width, so the curve stays round at any size. The ribbon's outer edges run
// straight on from the strips' outer edges and small fillets round the inner corners. The film has
// thickness: a darker edge shows under the ribbon (and under each strip), the upper edge catches light.
function FilmTurn({compact}){
 const box=useRef(null),[w,setW]=useState(0),shade=useId().replace(/:/g,'');
 useEffect(()=>{const sizes=new ResizeObserver(([entry])=>setW(entry.contentRect.width));sizes.observe(box.current);return()=>sizes.disconnect()},[]);
 const H=compact?64:96,band=compact?30:44,hole=compact?8:13,f=compact?8:12,t=compact?4:6,R=H/2,xr=w-band/2,xl=band/2;
 // o shifts the centre line sideways (perforations run at ±hole); the first turn is a right turn, the second a left.
 const line=o=>`M${xr+o} 0A${R+o} ${R+o} 0 0 1 ${xr-R} ${R+o}L${xl+R} ${R+o}A${R-o} ${R-o} 0 0 0 ${xl+o} ${H}`;
 return <svg className="rv-film-turn" ref={box} viewBox={`0 0 ${w||1} ${H}`} height={H} aria-hidden="true" data-reveal>{w>0&&<>
  {/* The far side of each turn catches a little light, as a curved surface would. */}
  <defs><linearGradient id={shade} gradientUnits="userSpaceOnUse" x1="0" x2={w} y1="0" y2="0"><stop offset="0" stopColor="#3a3b36"/><stop offset={(band+R)/w} stopColor="#151615"/><stop offset={1-(band+R)/w} stopColor="#151615"/><stop offset="1" stopColor="#3a3b36"/></linearGradient></defs>
  <path className="rv-film-fillet" d={`M${w-band+1} ${f}A${f} ${f} 0 0 0 ${w-band+1-f} 0L${w-band+1} 0ZM${band-1} ${H-f}A${f} ${f} 0 0 0 ${band-1+f} ${H}L${band-1} ${H}Z`}/>
  <path className="rv-film-ribbon rv-film-edge" d={line(0)} pathLength="1" style={{strokeWidth:band}} transform={`translate(0 ${t})`}/>
  <path className="rv-film-ribbon" d={line(0)} pathLength="1" style={{strokeWidth:band,stroke:`url(#${shade})`}}/>
  <path className="rv-film-holes" d={line(-hole)}/><path className="rv-film-holes" d={line(hole)}/>
  <path className="rv-film-light" d={line(1.5-band/2)}/>
 </>}</svg>;
}
// Phase titles sit on brackets spanning exactly their two frames: above the first strip, below the last,
// so the four ideas frame the film and read in its order.
function PhaseMarks({list,side}){return <div className={`rv-film-phases is-${side}`} data-reveal>{list.map(p=><p key={p.en}><strong>{p.name}</strong><span>{p.en}</span><em>{p.note}</em></p>)}</div>}
function Process(){
 // The steps run as film: strips of four frames (two on phones), each read left to right, and a
 // ribbon of film loops from the end of one strip back to the start of the next.
 const [compact,setCompact]=useState(()=>matchMedia('(max-width: 760px)').matches);
 useEffect(()=>{const query=matchMedia('(max-width: 760px)'),change=()=>setCompact(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
 const per=compact?2:4,strips=[],film=useRef(null);
 for(let i=0;i<sequence.length;i+=per)strips.push(sequence.slice(i,i+per).map((s,k)=>({...s,n:i+k})));
 // Strips are rebuilt when the layout switches between four and two frames, so reveal them here too.
 useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.15});film.current.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[per]);
 return <section className="rv-section rv-process" id="process" aria-labelledby="rv-process-title">
  <div className="rv-gutter"><SectionHead index="00" label="再生工藝" en="Process" id="rv-process-title" title={<>從邊料開始，<br/>讓榮耀成形。</>} link={['了解再生大理石','#/read/pages/material-recycled-marble']}/></div>
  <div className="rv-gutter">
   {compact&&<ol className="rv-film-legend" aria-label="四個階段">{phases.map(p=><li key={p.en}><strong>{p.name}</strong><span>{p.en}</span></li>)}</ol>}
   <div className="rv-film" aria-label="再生大理石製程" role="group" ref={film}>{strips.map((strip,r)=><React.Fragment key={`${per}-${r}`}>
    {r>0&&<FilmTurn compact={compact}/>}
    {!compact&&r===0&&<PhaseMarks list={phases.slice(0,2)} side="top"/>}
    <ol className={`rv-film-strip${r?' is-joined-top':''}${r<strips.length-1?' is-joined-bottom':''}`} start={strip[0].n+1} data-reveal style={{'--n':per}}>{strip.map((s,k)=>{const p=phases[s.n>>1];return <li key={s.label} style={{'--k':k}}>
     <Frame src={s.src} alt={s.alt} width={s.width} height={s.height} className={s.top?'is-top':''}/>
     <span className="rv-film-no" aria-hidden="true">{pad(s.n+1)}</span>
     <p className="rv-film-cap"><em>{p.name}・{p.en}</em><strong>{s.label}</strong><span>{s.line}</span></p>
    </li>})}</ol>
    {!compact&&r===strips.length-1&&<PhaseMarks list={phases.slice(2)} side="bottom"/>}
   </React.Fragment>)}</div>
   <p className="rv-process-source">依 re.O 材料頁與<a href="#/read/blog/posts/實驗再生材質">工作室文章</a>整理</p>
  </div>
 </section>;
}
const materials=[
 ['再生大理石','material-recycled-marble','/assets/material-powder.jpg'],
 ['回收玻璃','glass','/assets/material-glass.jpg'],
 ['退役木橫擔','wooden-beam','/assets/material-wood.jpg'],
 ['咖啡渣','coffee-waste','/content/images/16b62643e8869dd106.webp'],
 ['水庫淤泥','reservoir-silt','/content/images/b22b4e7305e255f890.webp'],
 ['煤灰','fly-ash','/content/images/790b5fdc0f89df0d7f.webp'],
 ['木屑','wood-chips','/content/images/95bd8644e4a1dcf166.webp'],
 ['木頭拼板','wood-veneer-panel','/content/images/a602a0b334820cff7d.webp'],
 ['焚化再生粒料','incineration-aggergates','/content/images/e862a0c81a178eedc0.webp']
];
// Custom trophies are their own block, apart from the A–F catalogue. Copy follows the 訂製 CUSTOM page.
const customModes=[
 {n:'01',title:'專案訂製',line:'以品牌語彙，設計獨有的外觀。',src:'/content/images/ccf5762abffbaf5ef7.webp',alt:'Oni Bus Coffee 品牌咖啡托盤，專案訂製案例'},
 {n:'02',title:'專料訂製',line:'以品牌的可再利用廢料，製作專屬材質。',src:'/content/images/61b1b99657d3baca5c.webp',alt:'總統盃黑客松獎盃，以焚化再生粒料製作的專料訂製案例'},
 {n:'03',title:'訂製包裝',line:'外盒、內襯到品牌標識，一併訂製。',src:'/content/images/a39bc07b4f4aa850e6.webp',alt:'黑色訂製外盒與內襯，裝載客製獎座',className:'is-left'}
];
// D and E are the models the studio promotes; they lead the collection at a larger size.
const featured=['E','D'];
// One spec line per model from models.json: type, height (or diameter) and price. Each item keeps
// together when the line wraps.
const specOf=m=>{const d=m.dimensions_mm,size=Array.isArray(d)?`高 ${d[2]} mm`:`直徑 ${d.diameter} mm`;return [m.kind,size,`NT$${m.price.replace('～','–')}`]};
// The home page keeps the essentials (hero, process, the A–F collection, custom trophies, materials,
// partners, shop). Selected works live on the custom page, IP collaborations on the cases page, and
// the studio, craft and awards on the About page.
export default function Home({onPreview}){
 const root=useRef(null);
 useEffect(()=>setPageMeta(),[]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.04});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[]);
 return <div className="folio-home rv-home" ref={root}>
  <a className="folio-skip" href="#collection">跳至公版系列</a>
  <SiteHeader/>
  <main>
   <Hero onPreview={onPreview}/>
   <Process/>

   <section className="rv-section rv-gutter" id="collection" aria-labelledby="rv-collection-title">
    <SectionHead index="01" label="公版獎盃" en="Collection" id="rv-collection-title" title={<>為每份榮耀，<br/>找到合適的形狀。</>} link={['商品詳情與規格','#/explore/standard']}/>
    <div className="rv-products">{[...models].sort((a,b)=>featured.indexOf(b.id)-featured.indexOf(a.id)).map(m=><article className={`rv-product${featured.includes(m.id)?' is-feature':''}`} key={m.id} data-reveal>
     <button className="rv-product-photo" onClick={()=>onPreview(m.id)} aria-label={`開始 ${m.id} 款 ${m.name} 銘版排版`}><Frame src={`/assets/catalogue-${m.id}.webp`} alt={`${m.id} 款 ${m.name}實品`} width="1200" height="900"/><span className="rv-tab" aria-hidden="true">{m.id}</span></button>
     <div className="rv-spec"><div><h3><span className="sr-only">{m.id} 款 </span>{m.name}</h3><p>{specOf(m).map(t=><span key={t}>{t}</span>)}</p></div><button className="rv-start" onClick={()=>onPreview(m.id)} aria-label={`開始 ${m.id} 款排版`}><span className="rv-start-text">開始排版</span><Arrow/></button></div>
    </article>)}</div>
   </section>

   <section className="rv-section rv-gutter" id="custom" aria-labelledby="rv-custom-title">
    <SectionHead index="02" label="客製化獎盃" en="Custom" id="rv-custom-title" title={<>為品牌，<br/>訂製專屬的榮耀。</>} link={['訂製方式與流程','#/read/pages/custom']}/>
    <ol className="rv-modes">{customModes.map(m=><li key={m.n} data-reveal><a href="#/read/pages/custom"><Frame src={m.src} alt={m.alt} width="1440" height="1440" className={m.className}/><span className="rv-mode-label"><em>{m.n}</em><strong>{m.title}</strong><Arrow/></span><span className="rv-mode-line">{m.line}</span></a></li>)}</ol>
   </section>

   <section className="rv-section rv-materials" id="materials" aria-labelledby="rv-materials-title">
    <div className="rv-gutter">
     <SectionHead index="03" label="循環材料" en="Materials" id="rv-materials-title" title={<>材料的下一站。</>} link={['全部循環材料','#/explore/materials']}/>
     <ul className="rv-swatches">{materials.map(([name,slug,src],i)=><li key={slug} data-reveal><a href={`#/read/pages/${slug}`}><Frame src={src} alt={`${name}原材料`}/><span className="rv-swatch-name"><em>{String(i+1).padStart(2,'0')}</em><strong>{name}</strong><Arrow/></span></a></li>)}</ul>
    </div>
   </section>

   <LogoWall limit={16}/>

   <ShopWindow/>
  </main>
  <SiteFooter/>
 </div>;
}
