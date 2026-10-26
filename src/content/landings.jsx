import React from 'react';
import cases from '../data/brand-cases.json';
import {contentHref} from '../components/site/navigation.js';
import {Button} from '../components/site/ui.jsx';
import ShopWindow from '../components/site/ShopWindow.jsx';
// Landing pages share the About page language: title + key-facts card, a full-bleed photo,
// one dark or moving feature band, then the numbered index. Facts follow the product pages.
const byId=Object.fromEntries(cases.map(c=>[c.id,c]));

function StudioBand(){
 const steps=[['選擇款式','A–F 六款公版造型。'],['線上排版','編排文字與圖案，即時預覽。'],['提供資料','下單前提供 LOGO 圖檔與獎盃文字。'],['手工生產','3–10 個工作天完成。']];
 return <section className="pg-band" aria-labelledby="pg-band-title">
  <div className="pg-band-copy folio-gutter" data-reveal>
   <p className="pg-kicker"><span>01</span>Studio</p>
   <h2 id="pg-band-title">先排版，<br/>再訂製。</h2>
   <ol className="pg-steps">{steps.map(([title,line],i)=><li key={title}><em>{String(i+1).padStart(2,'0')}</em><strong>{title}</strong><span>{line}</span></li>)}</ol>
   <Button href="#/preview/A" variant="light">開始排版</Button>
  </div>
  <img className="pg-band-photo" src="/assets/preview-E.jpg" alt="E 款 The way to PEAK 公版獎盃局部" width="2000" height="2000" loading="lazy"/>
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
  <div className="pg-reel" aria-label="循環材料質地"><ul>{[...swatches,...swatches].map(([name,src],i)=><li key={i} className={i%swatches.length%2?'is-low':undefined} aria-hidden={i>=swatches.length||undefined}><img src={src} alt={i<swatches.length?`${name}原材料質地`:''} loading="lazy"/><span className="pg-reel-name">{name}</span></li>)}</ul></div>
 </section>;
}

export const landings={
 standard:{en:'Collection',title:'公版獎盃',
  card:[['Models','款式','A–F 六款'],['Studio','線上排版','即時預覽・下載確認稿'],['Lead time','製作時程','3–10 個工作天'],['Price','價格','NT$680 – 3,000']],
  actions:[['開始排版','#/preview/A'],['訂製常見問題','#/read/pages/faq','ghost']],
  hero:{src:'/assets/preview-F.jpg',alt:'F 款層疊獎牌，三色再生大理石',width:3860,height:2895,position:'50% 55%'},
  band:StudioBand,indexEn:'Models',indexTitle:'六款公版',grid:'is-models',
  closing:['需要專屬造型，或品牌自己的材料？',['客製化獎盃','#/read/pages/custom'],['生活設計商品','#/explore/products']]},
 cases:{en:'Works',title:'企業與IP案例',card:'groups',unit:'件作品',
  actions:[['聯絡合作','mailto:service@re-o.co'],['合作品牌牆','#/brands','ghost']],
  hero:{src:'/assets/case-ase.webp',alt:'日月光 ASE 最佳供應獎盃',width:2400,height:2400,position:'50% 42%'},
  band:CollaborationBand,indexEn:'Works',indexTitle:'全部合作案例',grid:'is-banners',
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
