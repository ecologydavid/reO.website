import React from 'react';
import models from '../../data/models.json';
import {contentHref} from './navigation.js';
import {SiteArrow} from './SiteHeader.jsx';
import './material-hero.css';

const featured=['B','D','E'].map(id=>models.find(model=>model.id===id));
const finishes=[
 {name:'黑金',className:'black-gold',photo:'/assets/material-refs/6a61a5cd97838c92deb41790.webp'},
 {name:'白銀',className:'white-silver',photo:'/assets/material-refs/6a61a5cd015d0a08d2144b5e.webp'}
];

export default function MaterialHero({onPreview}){
 return <section className="material-hero folio-gutter" aria-labelledby="material-hero-title">
  <div className="material-hero-intro">
   <h1 id="material-hero-title">回收石材，<br/>灌注新的榮耀。</h1>
   <div className="material-hero-copy">
    <p>大理石邊料研磨成粉，與樹脂調配、澆注、打磨。<br/>讓循環材料，成為值得珍藏的公版獎盃。</p>
    <div className="material-hero-actions"><a className="folio-link" href="#collection">探索公版獎盃<SiteArrow/></a><a className="folio-link" href="#material-process">認識再生工藝<SiteArrow/></a></div>
   </div>
  </div>
  <div className="material-featured" aria-label="主打公版獎盃 B、D、E">
   {featured.map(model=><article className={`material-featured-product featured-${model.id}`} key={model.id}>
    <a className="material-featured-photo" href={contentHref(model.source_url)} aria-label={`查看 ${model.id} 款商品詳情`}>
     <img src={`/assets/catalogue-${model.id}.webp`} alt={`${model.id} 款 ${model.name}公版獎盃實品`} width="1200" height="900" fetchPriority={model.id==='B'?'high':undefined}/>
    </a>
    <div className="material-featured-caption"><span className="material-featured-letter">{model.id}</span><h2>{model.name}</h2><button className="folio-link" onClick={()=>onPreview(model.id)} aria-label={`開始 ${model.id} 款排版`}>開始排版<SiteArrow/></button></div>
   </article>)}
  </div>
  <div className="material-process" id="material-process">
   <div className="material-process-heading"><h2>從邊料開始，<br/>讓榮耀成形。</h2><a className="folio-link" href="#/read/pages/material-recycled-marble">了解再生大理石<SiteArrow/></a></div>
   <figure className="material-process-step"><img src="/content/images/4c8f7e6331677eaa2e.webp" alt="回收的大理石加工邊角料" width="810" height="1440"/><figcaption><span>01</span><h3>回收研磨</h3></figcaption></figure>
   <figure className="material-process-step"><img src="/content/images/002e36c018ceece1c4.webp" alt="re.O 工作室的材料調配容器與澆注成型模具" width="1440" height="1080"/><figcaption><span>02</span><h3>調配澆注</h3></figcaption></figure>
   <figure className="material-process-step material-process-finishes"><div className="material-finish-pair">{finishes.map(finish=><div key={finish.name}><span className={`material-finish ${finish.className}`} role="img" aria-label={`${finish.name}再生大理石實品紋理特寫`} style={{backgroundImage:`url("${finish.photo}")`}}/><span className="material-finish-name">{finish.name}</span></div>)}</div><figcaption><span>03</span><h3>打磨成器</h3></figcaption></figure>
  </div>
 </section>;
}
