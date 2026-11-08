import React,{useEffect,useRef,useState} from 'react';
import cases from '../data/brand-cases.json';
import {contentHref} from '../components/site/navigation.js';
import ShopWindow from '../components/site/ShopWindow.jsx';
import {studioTab} from '../components/site/ui.jsx';
// Landing pages share the About page language: title + key-facts card, a full-bleed photo,
// one dark or moving feature band, then the numbered index. Facts follow the product pages.
const byId=Object.fromEntries(cases.map(c=>[c.id,c]));

// The four ordering steps beside one photograph that follows the active step. The steps advance on
// their own while the band is in view (a hairline under the active step shows the time left) and
// stop for good once someone points at, taps or tabs to a step. Step 01 lists every model.
const flowModels=['A','B','C','D','E','F'];
const flow=[
 {title:'選擇款式',line:'A、B、C、D、E、F 六款公版造型，點選任一款開始排版。',alt:'A、B、C、D、E、F 六款公版獎盃'},
 {title:'線上排版',line:'在排版工作室編排文字與圖案，即時預覽，下載排版確認稿。',note:'訂購超過 10 支，可請 re.O 協助排版；10 支以內如需協助排版，酌收排版費 NT$500。',src:'/assets/studio-preview.webp',width:1600,height:1000,position:'50% 0',alt:'re.O 銘版排版工作室畫面'},
 {title:'提供資料',line:'下單前提供 LOGO 圖檔（ai 檔）與獎盃文字內容。',src:'/assets/flow-provide.webp',width:1600,height:1200,position:'50% 50%',alt:'示意圖：品牌 LOGO 向量檔與獎盃文字、得獎名單'},
 {title:'手工生產',line:'製作時程依訂單累積數量而定，3–10 個工作天完成。',src:'/assets/flow-casting.webp',width:1800,height:1202,position:'50% 50%',alt:'再生大理石漿料灌注入模'}
];
const two=n=>String(n).padStart(2,'0');
function StudioBand(){
 const [active,setActive]=useState(0),[auto,setAuto]=useState(true),[seen,setSeen]=useState(false),box=useRef(null);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setSeen(entry.isIntersecting),{threshold:.35});observer.observe(box.current);return()=>observer.disconnect()},[]);
 const pick=i=>{setAuto(false);setActive(i)};
 return <section className="pg-flow" ref={box} aria-labelledby="pg-band-title">
  <div className="pg-flow-grid folio-gutter">
   <div className="pg-flow-stage">
    {flow.map((s,i)=>i===0
     ?<div key={s.title} className={`pg-flow-shot pg-flow-mosaic${i===active?' is-on':''}`} role="img" aria-label={s.alt} aria-hidden={i!==active||undefined}>{flowModels.map(m=><span key={m}><img src={`/assets/catalogue-${m}.webp`} alt="" width="1200" height="900" loading="lazy"/><em>{m}</em></span>)}</div>
     :<img key={s.title} className={`pg-flow-shot${i===active?' is-on':''}`} src={s.src} alt={i===active?s.alt:''} aria-hidden={i!==active||undefined} width={s.width} height={s.height} loading="lazy" style={{objectPosition:s.position}}/>)}
    <p className="pg-flow-caption" aria-hidden="true"><b>{two(active+1)}</b>/ {two(flow.length)}<span>{flow[active].title}</span></p>
   </div>
   <div className="pg-flow-text">
    <div className="pg-flow-head"><p className="pg-kicker"><span>01</span>Studio</p><h2 id="pg-band-title">先排版，再訂製。</h2></div>
    <ol className="pg-flow-steps">{flow.map((s,i)=><li key={s.title} className={i===active?'is-on':undefined} onPointerEnter={e=>{if(e.pointerType==='mouse')pick(i)}}>
     <button type="button" className="pg-flow-row" aria-pressed={i===active} onClick={()=>pick(i)} onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))pick(i)}}>
      <span className="pg-flow-stop">{two(i+1)}</span><strong>{s.title}</strong>
      {i===active&&auto&&seen?<span className="pg-flow-timer" key={active} onAnimationEnd={()=>setActive((active+1)%flow.length)}/>:null}
     </button>
     <div className="pg-flow-body">
      <p>{s.line}</p>
      {i===0?<ul className="pg-flow-picks">{flowModels.map(m=><li key={m}><a href={`#/preview/${m}`} {...studioTab} aria-label={`開始 ${m} 款排版`}><img src={`/assets/product-thumb-${m}.webp`} alt="" width="360" height="270" loading="lazy"/><span>{m}</span></a></li>)}</ul>:null}
      {s.note?<p className="pg-flow-note">{s.note}</p>:null}
     </div>
    </li>)}</ol>
   </div>
  </div>
 </section>;
}

function CollaborationBand(){
 const works=[['disney-hola','Disney × HOLA'],['marvel-hola','Marvel × HOLA'],['golden-horse','台北金馬影展 × Pinkoi']];
 return <section className="pg-band is-gallery" aria-labelledby="pg-band-title">
  <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>01</span>Collaborations</p><div><h2 id="pg-band-title">讓經典角色，走進日常。</h2></div></div>
  <ul className="pg-band-works folio-gutter">{works.map(([id,brand],i)=>{const c=byId[id];return <li key={id} style={{'--i':i}} data-reveal><a href={contentHref(c.source_url)}><span className="pg-band-frame"><img src={c.photo} alt={c.safe_caption} width="2400" height="2400" loading="lazy"/></span><span className="pg-band-name"><em>{brand}</em>{c.project.split('／')[0]}</span></a></li>})}</ul>
 </section>;
}

function MaterialReel(){
 const swatches=[['再生大理石','/assets/material-powder.jpg'],['回收玻璃','/assets/material-glass.jpg'],['退役木橫擔','/assets/material-wood.jpg'],['咖啡渣','/content/images/16b62643e8869dd106.webp'],['水庫淤泥','/content/images/b22b4e7305e255f890.webp'],['煤灰','/content/images/790b5fdc0f89df0d7f.webp'],['木屑','/content/images/95bd8644e4a1dcf166.webp'],['木頭拼板','/content/images/a602a0b334820cff7d.webp'],['焚化再生粒料','/content/images/e862a0c81a178eedc0.webp']];
 return <section className="pg-studio" aria-labelledby="pg-band-title">
  <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>01</span>Textures</p><div><h2 id="pg-band-title">材料的下一站。</h2><p>從回收原材的特性出發，探索設計與製造的可能。</p></div></div>
  <div className="pg-reel" aria-label="循環材料質地"><ul>{[...swatches,...swatches].map(([name,src],i)=><li key={i} className={i%swatches.length%2?'is-low':undefined} aria-hidden={i>=swatches.length||undefined}><img src={src} alt={i<swatches.length?`${name}原材料質地`:''} loading="lazy"/><span className="pg-reel-name"><em>{String(i%swatches.length+1).padStart(2,'0')}</em>{name}</span></li>)}</ul></div>
 </section>;
}

export const landings={
 standard:{en:'Classic',title:'公版獎盃',
  card:[['Models','款式','A、B、C、D、E、F'],['Studio','線上排版','即時預覽・下載確認稿'],['Lead time','製作時程','3–10 個工作天'],['Price','價格','NT$680 – 3,000']],
  actions:[['開始排版','#/preview/A'],['訂製常見問題','#/read/pages/faq','ghost']],
  // No full-bleed photo here: the ordering steps and the six models come straight after the facts.
  band:StudioBand,indexEn:'Models',indexTitle:'六款公版',grid:'is-models',
  closing:['需要專屬造型，或品牌自己的材料？',['客製化獎盃','#/read/pages/custom'],['生活設計商品','#/explore/products']]},
 cases:{en:'Works',title:'企業與IP案例',card:'groups',unit:'件作品',
  actions:[['聯絡合作','mailto:service@re-o.co'],['合作品牌牆','#/brands','ghost']],
  hero:{src:'/assets/case-ase.webp',alt:'日月光 ASE 最佳供應獎盃',width:2400,height:2400,position:'50% 42%'},
  band:CollaborationBand,indexEn:'Works',indexTitle:'全部合作案例',grid:'is-works',
  closing:['合作領域涵蓋電子金控、政府單位與商業品牌。',['合作品牌牆','#/brands'],['客製化獎盃','#/read/pages/custom']]},
 materials:{en:'Materials',title:'循環材料',card:'groups',
  actions:[['專料訂製','#/read/pages/custom'],['寄信洽詢','mailto:service@re-o.co','ghost']],
  hero:{src:'/content/images/8a959cd06cce7ed889.webp',alt:'re.O 工作室分類保存的回收材料',width:1440,height:1080,position:'50% 50%'},unit:'種材料',
  band:MaterialReel,indexEn:'Materials',indexTitle:'全部循環材料',grid:'is-materials',
  closing:['提供可再利用的廢棄料，由 re.O 評估製作專屬材質。',['專料訂製','#/read/pages/custom'],['工藝與工作室文章','#/explore/journal']]},
 products:{en:'Objects',title:'生活設計商品',band:ShopWindow},
 journal:{en:'Journal',title:'設計與工藝'},
 about:{en:'Studio',title:'品牌與工藝內容'}
};
