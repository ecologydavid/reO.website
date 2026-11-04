import React,{useEffect,useRef} from 'react';
import {pages,cardImage,splitCase} from './catalogue.js';
import {SiteArrow} from '../components/site/SiteHeader.jsx';
import {CasePhoto} from './ContentLibrary.jsx';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {setPageMeta} from '../seo.js';
import './pages.css';
// The 客製化獎盃 landing page. The A–F standard catalogue has its own page, so 公版訂製 is not a mode here. Copy follows the 訂製 CUSTOM page.
const img=id=>`/content/images/${id}.webp`;
// Two ways to commission, then packaging and 3D modelling: four services shown together, numbered to 04.
const steps=[
 {en:'Mode',title:'專案訂製',line:'給予需要的品項、尺寸、數量與 re.O 再生材質，進行設計稿討論，讓設計外觀更好地展現品牌形象。',tags:['獨有設計外觀','多元再生材質','品牌語彙'],src:img('ccf5762abffbaf5ef7'),alt:'Oni Bus Coffee 品牌咖啡托盤，專案訂製案例',link:['企業獎盃案例','#/explore/cases?filter=企業獎盃']},
 {en:'Mode',title:'專料訂製',line:'給予可再利用的廢棄料，由 re.O 評估可行性，經材質測試與設計，製作專屬材質產品。',tags:['專屬材質','品牌永續形象','品牌故事升級'],src:img('61b1b99657d3baca5c'),alt:'總統盃黑客松獎盃，以焚化再生粒料製作的專料訂製案例',link:['循環材料','#/explore/materials']},
 {en:'Packaging',title:'包裝款式',line:'外裝、內襯與商標，皆可依品牌訂製。',tags:['全客製化','部分客製化'],src:img('a39bc07b4f4aa850e6'),alt:'黑色訂製外盒與內襯，裝載圓形獎座',link:['包裝選項','#pg-pack']},
 {en:'3D Modeling',title:'3D 建模服務',line:'涵蓋產品外觀、公仔角色、裝置零件等各類模型需求。',src:img('78a844104cdc098c56'),width:1200,height:630,position:'42% 50%',alt:'設計師手繪與量測模型草圖',link:['建模服務與案例','#/read/pages/3d-modeling']}
];
// Packaging options from the 訂製 CUSTOM page: item, then what can be specified.
const packaging=[
 ['全客製化','Full',[['訂製外盒','尺寸、外觀、材質'],['訂製內襯','高密泡棉、紙結構支撐'],['品牌辨識','UV 印刷、燙印工藝']]],
 ['部分客製化','Partial',[['外盒','公版外盒'],['品牌辨識','UV 印刷、品牌貼紙']]]
];
const boxes=[['a39bc07b4f4aa850e6','黑色訂製外盒與內襯，裝載圓形獎座'],['21b0f1fba438286be3','日月光訂製外盒與內襯'],['7f32aef9f9813f5033','黑色訂製外盒與內襯，裝載直立獎盃']];
const featured=['ase-outstanding-supplier-trophy','national-sustainability-award','uber-eats-trophy','pwc-taiwan-trophy','tmall-super-one-trophy','delta-energy-award-plaque'];
export default function CustomPage(){
 const root=useRef(null);
 const works=featured.map(slug=>pages.find(p=>p.path==='#/read/pages/'+slug)).filter(p=>p?.hero).map(p=>({...p,card:cardImage(p),...splitCase(p.title)}));
 useEffect(()=>{setPageMeta({title:'客製化獎盃',description:'從品牌專屬設計到專屬材質：專案訂製與專料訂製兩種方式，以再生材料訂製企業獎盃與包裝。'});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[]);
 return <main className="pg pg-custom" ref={root}>
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>客製化獎盃</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title"><p className="content-display" aria-hidden="true">Custom</p><h1>客製化獎盃</h1><p>從品牌專屬設計到專屬材質，兩種方式訂製你的榮耀。</p></div>
   <div className="pg-contact">
    <dl><div><dt><span>Email</span>電子郵件</dt><dd><a href="mailto:service@re-o.co">service@re-o.co</a></dd></div><div><dt><span>Phone</span>電話</dt><dd><a href="tel:+886289665369">+886-2-8966-5369</a></dd></div></dl>
    <div className="pg-actions"><Button href="mailto:service@re-o.co">寄信洽詢</Button><Button variant="ghost" href="tel:+886289665369">來電洽詢</Button></div>
   </div>
  </header>

  <div className="folio-gutter"><ol className="pg-services" aria-label="訂製服務">{steps.map((s,i)=><li key={s.title} data-reveal style={{transitionDelay:`${i*.08}s`}}>
   <p className="pg-service-num"><b>{String(i+1).padStart(2,'0')}</b>/ {String(steps.length).padStart(2,'0')}<i>{s.en}</i></p>
   <figure><img src={s.src} alt={s.alt} width={s.width||1440} height={s.height||1440} fetchPriority={i<2?'high':undefined} style={s.position?{objectPosition:s.position}:undefined}/></figure>
   <h2>{s.title}</h2><p className="pg-service-line">{s.line}</p>
   <p className="pg-service-tags">{s.tags?.map(t=><span key={t}>{t}</span>)}</p>
   <div className="pg-service-more">{s.link[1].startsWith('#pg-')?<ArrowLink className="pg-service-jump" onClick={()=>document.getElementById(s.link[1].slice(1))?.scrollIntoView({behavior:'smooth'})}>{s.link[0]}</ArrowLink>:<ArrowLink href={s.link[1]}>{s.link[0]}</ArrowLink>}</div>
  </li>)}</ol>

  <section className="pg-pack" id="pg-pack" aria-labelledby="pg-pack-title" data-reveal>
   <div>
    <p className="pg-kicker"><span>03</span>Packaging</p><h2 id="pg-pack-title">包裝選項</h2><p className="pg-pack-intro">外裝、內襯與商標，皆可依品牌訂製。</p>
    <div className="pg-pack-options">{packaging.map(([name,en,rows])=><div key={name}><h3>{name}<small>{en}</small></h3><dl>{rows.map(([item,detail])=><div key={item+detail}><dt>{item}</dt><dd>{detail}</dd></div>)}</dl></div>)}</div>
   </div>
   <ul className="pg-pack-photos">{boxes.slice(1).map(([id,alt])=><li key={id}><img src={img(id)} alt={alt} width="1440" height="1440" loading="lazy"/></li>)}</ul>
  </section></div>

  <div className="folio-gutter"><section className="content-works pg-custom-works" aria-labelledby="pg-works-title">
   <header className="content-works-head"><p className="content-display" aria-hidden="true">Works</p><h2 id="pg-works-title">企業獎盃案例</h2></header>
   <ol className="content-works-grid is-works">{works.map((p,i)=><li key={p.id} data-reveal><a href={p.path}>
    <CasePhoto page={p} image={p.card} client={p.client}/>
    <span className="content-works-meta"><em>{String(i+1).padStart(2,'0')}</em>{p.metadata?.year&&<span>{String(p.metadata.year).replace(/-/g,'–')}</span>}</span>
    <span className="content-works-title"><strong>{p.work}</strong><SiteArrow/></span>
   </a></li>)}</ol>
   <div className="pg-center pg-actions"><Button href="#/explore/cases?filter=企業獎盃">全部企業獎盃案例</Button><Button href="#/read/pages/faq" variant="ghost">訂製常見問題</Button></div>
  </section></div>
 </main>;
}
