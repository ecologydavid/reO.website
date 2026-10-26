import React,{useEffect,useRef} from 'react';
import {pages,cardImage} from './catalogue.js';
import {SiteArrow} from '../components/site/SiteHeader.jsx';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import './pages.css';
// The 客製化獎盃 landing page. The A–F standard catalogue has its own page, so 公版訂製 is not a mode here. Copy follows the 訂製 CUSTOM page.
const img=id=>`/content/images/${id}.webp`;
const modes=[
 {n:'01',title:'專案訂製',line:'給予需要的品項、尺寸、數量與 re.O 再生材質，進行設計稿討論，讓設計外觀更好地展現品牌形象。',tags:['獨有設計外觀','多元再生材質','品牌語彙'],src:img('ccf5762abffbaf5ef7'),alt:'Oni Bus Coffee 品牌咖啡托盤，專案訂製案例',link:['企業獎盃案例','#/explore/cases?filter=企業獎盃']},
 {n:'02',title:'專料訂製',line:'給予可再利用的廢棄料，由 re.O 評估可行性，經材質測試與設計，製作專屬材質產品。',tags:['專屬材質','品牌永續形象','品牌故事升級'],src:img('61b1b99657d3baca5c'),alt:'總統盃黑客松獎盃，以焚化再生粒料製作的專料訂製案例',link:['循環材料','#/explore/materials']}
];
const boxes=[['a39bc07b4f4aa850e6','黑色訂製外盒與內襯，裝載圓形獎座'],['21b0f1fba438286be3','日月光訂製外盒與內襯'],['7f32aef9f9813f5033','黑色訂製外盒與內襯，裝載直立獎盃']];
const featured=['ase-outstanding-supplier-trophy','national-sustainability-award','uber-eats-trophy','pwc-taiwan-trophy','tmall-super-one-trophy','delta-energy-award-plaque'];
export default function CustomPage(){
 const root=useRef(null);
 const works=featured.map(slug=>pages.find(p=>p.path==='#/read/pages/'+slug)).filter(p=>p?.hero).map(p=>({...p,card:cardImage(p)}));
 useEffect(()=>{document.title='re.O｜客製化獎盃';const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[]);
 return <main className="pg pg-custom" ref={root}>
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>客製化獎盃</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title"><p className="content-display" aria-hidden="true">Custom</p><h1>客製化獎盃</h1><p>從品牌專屬設計到專屬材質，兩種方式訂製你的榮耀。</p></div>
   <div className="pg-actions pg-top-actions"><Button href="mailto:service@re-o.co">聯絡訂製</Button><Button variant="ghost" href="tel:+886289665369">+886-2-8966-5369</Button></div>
  </header>

  <ol className="pg-modes folio-gutter" aria-label="訂製方式">{modes.map(m=><li key={m.n} data-reveal>
   <figure><img src={m.src} alt={m.alt} width="1440" height="1440" loading={m.n==='01'?undefined:'lazy'} fetchPriority={m.n==='01'?'high':undefined}/></figure>
   <div><p className="pg-kicker"><span>{m.n}</span>Mode</p><h2>{m.title}</h2><p>{m.line}</p><ul className="content-keywords">{m.tags.map(t=><li key={t}>{t}</li>)}</ul><ArrowLink href={m.link[1]}>{m.link[0]}</ArrowLink></div>
  </li>)}</ol>

  <section className="pg-boxes folio-gutter" aria-labelledby="pg-boxes-title">
   <div className="pg-split" data-reveal><p className="pg-kicker"><span>03</span>Packaging</p><div><h2 id="pg-boxes-title">包裝款式</h2><p>外裝、內襯與商標，皆可依品牌訂製。</p></div></div>
   <ul className="pg-box-photos">{boxes.map(([id,alt])=><li key={id} data-reveal><img src={img(id)} alt={alt} width="1440" height="1440" loading="lazy"/></li>)}</ul>
   <div className="pg-box-lists" data-reveal>
    <div><h3>全客製化</h3><ul><li>訂製外盒｜尺寸、外觀、材質</li><li>訂製內襯｜高密泡棉、紙結構支撐</li><li>品牌辨識｜UV 印刷、燙印工藝</li></ul></div>
    <div><h3>部分客製化</h3><ul><li>公版外盒</li><li>品牌辨識｜UV 印刷、品牌貼紙</li></ul></div>
   </div>
  </section>

  <div className="folio-gutter"><section className="content-works pg-custom-works" aria-labelledby="pg-works-title">
   <header className="content-works-head"><p className="content-display" aria-hidden="true">Works</p><h2 id="pg-works-title">企業獎盃案例</h2></header>
   <ol className="content-works-grid is-banners">{works.map((p,i)=><li key={p.id} data-reveal><a href={p.path}>
    <span className="content-works-photo"><img src={p.card.src} alt={p.card.alt||p.title} width={p.card.width} height={p.card.height} loading="lazy"/></span>
    <span className="content-works-meta"><em>{String(i+1).padStart(2,'0')}</em>{p.metadata?.year&&<span>{String(p.metadata.year).replace(/-/g,'–')}</span>}</span>
    <span className="content-works-title"><strong>{p.title.split('｜')[0]}</strong><SiteArrow/></span>
    {p.title.includes('｜')&&<span className="content-works-line">{p.title.split('｜').slice(1).join('｜')}</span>}
   </a></li>)}</ol>
   <div className="pg-center"><Button href="#/explore/cases?filter=企業獎盃">全部企業獎盃案例</Button></div>
  </section></div>

  <section className="pg-model" aria-labelledby="pg-model-title">
   <img src={img('78a844104cdc098c56')} alt="設計師手繪與量測模型草圖" width="1200" height="630" loading="lazy"/>
   <div className="folio-gutter" data-reveal><p className="pg-kicker"><span>04</span>3D Modeling</p><h2 id="pg-model-title">3D 建模服務</h2><p>涵蓋產品外觀、公仔角色、裝置零件等各類模型需求。</p><div className="pg-actions"><Button href="#/read/pages/3d-modeling" variant="light">建模服務與案例</Button><Button href="#/read/pages/faq" variant="glass">訂製常見問題</Button></div></div>
  </section>
 </main>;
}
