import {casePreview} from './casePreviews.js';
import {classicPhotos} from '../components/site/classicPhotos.js';
import {small,half} from '../components/site/responsive.js';
import React,{useEffect,useRef,useState} from 'react';
import cases from '../data/brand-cases.json';
import {contentHref} from '../components/site/navigation.js';
import {studioTab} from '../components/site/ui.jsx';
import {classicNames,offered} from '../components/site/classics.js';
import {materials} from '../components/site/materials.js';
// Landing pages share the About page language: title + key-facts card, a full-bleed photo,
// one dark or moving feature band, then the numbered index. Facts follow the product pages.
const byId=Object.fromEntries(cases.map(c=>[c.id,c]));

// The ordering steps beside one photograph that follows the active step. The steps advance on
// their own while the band is in view (a hairline under the active step shows the time left) and
// stop for good once someone points at, taps or tabs to a step. Step 01 lists every model.
// v51 (owner, 2026-11-09): 銘版排版工作室 and 提供資料 are one step, 銘板排版及提供資料, whose terms read as
// ruled rows (owner's wording); 手工生產 says only that lead time follows the quantity.
const flowModels=offered;
const flow=[
 {title:'選擇款式',line:'A、B、C、D、E 五款公版造型，點選任一款開始排版。',alt:'A、B、C、D、E 五款公版獎盃'},
 {title:'銘板排版及提供資料',terms:[
  ['10 座以上','可以請我們協助免費設計排版。'],
  // v71 (owner, 2026-11-17): one merged row; the layout-help fee is NT$300.
  ['低於 10 座',<>可以至「<a href="#/preview/D" {...studioTab}>銘版排版工作室</a>」自行擺放滿意版型（完成後可下載 .PDF 及 .EPS 檔案），上傳至 <a href="mailto:service@re-o.co">service@re-o.co</a>，收件後會依實際印刷條件協助免費調整。可以請我們協助設計排版，會酌收排版費 。</>]
 ],src:'/assets/studio-preview.webp',width:1600,height:1000,position:'50% 0',alt:'re.O 銘版排版工作室畫面'},
 {title:'手工生產',line:'製作工期依訂購數量而定。',src:'/assets/flow-casting.webp',width:1800,height:1202,position:'50% 50%',alt:'再生大理石漿料灌注入模'}
];
const two=n=>String(n).padStart(2,'0');
const img=id=>`/content/images/${id}.webp`;
// v53: the 公版 ordering band generalised (GuideBand), so 品牌訂製 and 禮贈品訂製 explain themselves the same way:
// a photo on the left follows the active item; on the right numbered rings, each item with its line, optional
// ruled terms, plain-text tags and a link. Items advance on their own while in view until someone picks one.
// compact (v54): only the active item opens, picked by click, tap or keyboard (not hover, which would move rows
// under the pointer). An optional item is unnumbered (＋) and the numbering skips it.
function GuideBand({id='pg-band-title',kicker,en,title,items,compact}){
 const numbers=[];items.reduce((n,s)=>{numbers.push(s.optional?'＋':two(n+1));return s.optional?n:n+1},0);
 const total=two(items.filter(s=>!s.optional).length);
 const [active,setActive]=useState(0),[auto,setAuto]=useState(true),[seen,setSeen]=useState(false),box=useRef(null);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setSeen(entry.isIntersecting),{threshold:.35});observer.observe(box.current);return()=>observer.disconnect()},[]);
 const pick=i=>{setAuto(false);setActive(i)};
 return <section className={`pg-flow${compact?' is-compact':''}`} ref={box} aria-labelledby={id}>
  <div className="pg-flow-grid folio-gutter">
   <div className="pg-flow-stage">
    {items.map((s,i)=>s.mosaic
     ?<div key={s.title} className={`pg-flow-shot pg-flow-mosaic${i===active?' is-on':''}`} role="img" aria-label={s.alt} aria-hidden={i!==active||undefined}>{flowModels.map(m=><span key={m}><img src={classicPhotos[m].wide} alt={`${m} 款 ${classicNames[m]} 公版獎盃`} width="1200" height="900" loading="lazy"/><em>{m}</em></span>)}</div>
     :<img key={s.title} className={`pg-flow-shot${i===active?' is-on':''}`} src={s.src} {...small({src:s.src,width:s.width||1440},half)} alt={i===active?s.alt:''} aria-hidden={i!==active||undefined} width={s.width||1440} height={s.height||1080} loading="lazy" style={{objectPosition:s.position||'50% 50%'}}/>)}
    <p className="pg-flow-caption" aria-hidden="true"><b>{numbers[active]}</b>/ {total}<span>{items[active].caption||items[active].title}</span></p>
   </div>
   <div className="pg-flow-text">
    <div className="pg-flow-head"><p className="pg-kicker"><span>{kicker}</span>{en}</p><h2 id={id}>{title}</h2></div>
    <ol className="pg-flow-steps">{items.map((s,i)=><li key={s.title} className={[i===active&&'is-on',s.optional&&'is-optional'].filter(Boolean).join(' ')||undefined} onPointerEnter={e=>{if(!compact&&e.pointerType==='mouse')pick(i)}}>
     <button type="button" className="pg-flow-row" aria-pressed={i===active} onClick={()=>pick(i)} onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))pick(i)}}>
      <span className="pg-flow-stop">{numbers[i]}</span><strong>{s.title}</strong>{s.optional?<em className="pg-flow-optional">選配</em>:null}{s.client?<small className="pg-flow-client">{s.client}</small>:null}
      {i===active&&auto&&seen?<span className="pg-flow-timer" key={active} onAnimationEnd={()=>setActive((active+1)%items.length)}/>:null}
     </button>
     <div className="pg-flow-body"><div>
      {s.line?<p>{s.line}</p>:null}
      {s.mosaic?<ul className="pg-flow-picks">{flowModels.map(m=><li key={m}><a href={`#/preview/${m}`} {...studioTab} aria-label={`開始 ${m} 款排版`}><img src={classicPhotos[m].square} alt={`${m} 款 ${classicNames[m]} 公版獎盃`} width="720" height="720" loading="lazy"/><span>{m}</span></a></li>)}</ul>:null}
      {s.terms?<dl className="pg-flow-terms">{s.terms.map(([k,v],j)=><div key={j} className={k?undefined:'is-more'}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>:null}
      {s.tags||s.link?<p className="pg-flow-foot">{s.tags?<span className="pg-flow-tags">{s.tags.join(' / ')}</span>:null}{s.link?<a href={s.link[1]}>{s.link[0]}<span aria-hidden="true"> →</span></a>:null}</p>:null}
     </div></div>
    </li>)}</ol>
   </div>
  </div>
 </section>;
}
const StudioBand=()=><GuideBand kicker="01" en="Studio" title="先排版，再訂製。" items={flow.map((s,i)=>i===0?{...s,mosaic:true}:s)}/>;

// v54 (owner, 2026-11-09): on 品牌訂製 and 禮贈品訂製 the 一條龍 process IS the image-led band: one item per step,
// each with its own photo and text. Step names are the owner's; the text is condensed from the site's own pages
// (訂製 CUSTOM, 建模 MODELING, 關於, journal: 實驗再生材質, 工廠步驟把關, 可回收包裝材, 生產鏈合作循環運送) and the home
// process ring, with no new claims. 企業專料 is optional: it sits between 開模 and 材質灌製, unnumbered.
// owner (2026-11-17): packaging is presented once, at 品檢包裝, as one 客製化設計 term ending with the budget line;
// step 01 only mentions packaging as part of the needs discussion.
const packTerms=[['客製化設計','可訂製外盒的尺寸、外觀與材質，搭配高密泡棉或紙結構內襯；也可選用公版外盒，加上 UV 印刷、燙印或品牌貼紙等品牌辨識。依照預算規劃不同訂製包裝。']];
const modelTerms=[['拆件','矽膠模具量產之拆件與結構規劃'],['模流','模流方向與脫模限制的設計建議'],['細節','模型細節優化與製作可行性分析']];
const step={
 model:{line:'協助完成高品質的數位模型、建模量產的可行性。',terms:modelTerms,link:['建模服務與案例','#/read/pages/3d-modeling']},
 mold:{line:'設計開模、固化外觀。配方成功與否，最後的關鍵在模具設計，讓後續成品的損耗率降至 3%。',link:['閱讀〈實驗再生材質〉','#/read/blog/posts/實驗再生材質']},
 cast:{line:'經材質實驗與比例優化，與樹脂調和；真空除泡，去除氣泡孔洞，再以矽膠模具灌注成形。',link:['循環材料','#/explore/materials']},
 ship:{line:'包裝出貨皆由 re.O 把關；與廠商往來時，重複利用已使用的紙箱與氣泡紙，讓廢棄物重新再利用。',link:['閱讀〈生產鏈合作循環運送〉','#/read/blog/posts/生產鏈合作循環運送']}
};
const brandSteps=[
 {title:'概念設計・包裝規劃',line:'從了解品牌需求開始：獎項的意義、使用場合、品項、尺寸與數量，再結合 re.O 再生材質，發展品牌專屬的概念設計，透過設計稿討論，讓造型與材質更好地展現品牌形象。包裝規劃也在這一步一併討論需求。',src:img('78a844104cdc098c56'),width:1200,height:630,position:'42% 50%',alt:'設計師手繪與量測模型草圖'},
 {title:'3D 建模',...step.model,src:'/assets/flow-brand-model.webp',width:1191,height:842,position:'50% 50%',alt:'台電電表手機座提案的三視圖與包裝盒建模'},
 {title:'開模',...step.mold,src:'/assets/flow-brand-mold.webp',width:1800,height:1202,alt:'re.O 工作室桌上的矽膠模具與灌製工具'},
 {title:'企業專料',optional:true,line:'企業有顆粒、粉末化可再利用的廢棄物料，由 re.O 評估可行性，經材質測試與設計，製作專屬材質產品，在材質灌製時加入。',tags:['專屬材質','品牌永續形象','品牌故事升級'],src:img('8a959cd06cce7ed889'),width:1440,height:1080,alt:'re.O 工作室分類保存的回收材料',caption:'企業專料（選配）'},
 {title:'材質灌製',...step.cast,src:'/assets/flow-casting.webp',width:1800,height:1202,alt:'再生大理石漿料灌注入模'},
 {title:'組裝',line:'於 re.O 工作室組裝，結合各式異材，完成作品。',src:img('eaa0be28bf809c8400'),width:1317,height:988,alt:'B 款獎盃再生大理石構件與木質盃身的表面細節'},
 {title:'品檢包裝',line:'逐件挑選，排除氣孔、白點、刮痕，再裝入為品牌規劃的包裝。',terms:packTerms,src:img('a39bc07b4f4aa850e6'),width:1440,height:1440,alt:'黑色訂製外盒與內襯，裝載圓形獎座'},
 {title:'出貨',...step.ship,src:img('9c539bc9ebc1b804f7'),width:1440,height:960,alt:'以膠帶封箱出貨'}
];
const giftSteps=[
 {title:'需求確認・造型設計・包裝規劃',line:'從了解品牌需求開始：禮品的用途、送禮對象、品項、尺寸與數量，再結合 re.O 再生材質，發展品牌專屬的造型設計，透過設計稿討論，讓作品更好地展現品牌形象。包裝規劃也在這一步一併討論需求。',src:'/assets/flow-gift-sketch.webp',width:1800,height:1202,position:'50% 50%',alt:'設計師在工作桌上繪製設計草圖'},
 {title:'3D 建模',...step.model,src:'/assets/flow-gift-model.webp',width:1920,height:1440,position:'50% 50%',alt:'T.B. Design 動物雕塑咖啡填壓器的犀牛 3D 建模圖'},
 {title:'開模',...step.mold,src:'/assets/flow-gift-mold.webp',width:1800,height:1202,alt:'在 re.O 工作室窗邊處理矽膠模具'},
 {title:'材質灌製',...step.cast,src:'/assets/flow-gift-cast.webp',width:1800,height:1202,alt:'灌入再生材料的矽膠模具'},
 {title:'組裝',line:'經過篩選的零件，送回 re.O 工作室進行最後加工與組裝。',src:'/assets/flow-gift-assemble.webp',width:1800,height:1350,alt:'組裝中的米奇再生大理石桌鐘與機芯'},
 {title:'品檢包裝',line:'逐件挑選，排除氣孔、白點、刮痕。標準品使用全紙漿、無塑膠的可回收包裝，拆解後可一併交給紙類回收。',terms:packTerms,src:'/assets/flow-gift-pack.webp',width:1800,height:1201,alt:'空總名片架裝入白色訂製禮盒'},
 {title:'出貨',...step.ship,src:img('9c539bc9ebc1b804f7'),width:1440,height:960,alt:'以膠帶封箱出貨'}
];
const BrandBand=()=><GuideBand compact kicker="01" en="Process" title="從概念設計，到獎座出貨。" items={brandSteps}/>;
const GiftBand=()=><GuideBand compact kicker="01" en="Process" title="從需求確認，到禮品交付。" items={giftSteps}/>;

function CollaborationBand(){
 // v65 (owner, 2026-11-18): five works in one row. [route, partner, work, photo, alt]
 const d=byId['disney-hola'],g=byId['golden-horse'];
 const works=[
  [contentHref(d.source_url),'Disney × HOLA',d.project.split('／')[0],d.photo,d.safe_caption],
  ['#/read/pages/animal-shaped-coffee-tamper-–-tb-design','T.B. Design','動物雕塑咖啡填壓器','/content/images/3f4e62ca36347bf8e6.webp','獅子、長頸鹿與犀牛三款動物雕塑咖啡填壓器'],
  [contentHref(byId['marvel-hola'].source_url),'Marvel × HOLA',byId['marvel-hola'].project.split('／')[0],'/assets/case-ironman-clock.webp','鋼鐵人方舟反應爐圖樣的水庫淤泥桌鐘'],
  ['#/read/pages/wooper','順騎自然 ComeBikeDay','泥好蛙','/content/images/556941054ff6b8fac1.webp','ComeBikeDay 泥好蛙，灰與金兩色'],
  [contentHref(g.source_url),'台北金馬影展 × Pinkoi',g.project.split('／')[0],g.photo,g.safe_caption]
 ];
 return <section className="pg-band is-gallery" aria-labelledby="pg-band-title">
  <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>01</span>Collaborations</p><div><h2 id="pg-band-title">讓材料與角色，走進日常。</h2></div></div>
  <ul className="pg-band-works is-five folio-gutter">{works.map(([href,brand,name,photo,alt],i)=><li key={href} style={{'--i':i}} data-reveal><a href={href}><span className="pg-band-frame"><img {...casePreview(photo,'(max-width: 760px) 72vw, (max-width: 1100px) 33vw, 20vw')} alt={alt} width="1440" height="1440" loading={i===0?'eager':'lazy'}/></span><span className="pg-band-name"><em>{brand}</em>{name}</span></a></li>)}</ul>
 </section>;
}

// v71 (owner, 2026-11-17): the reel labels follow the home materials tiles: a large numeral, a hairline, then the
// Chinese name over the English name, on the photo. Each photo opens its material page. Data: site/materials.js.
function MaterialReel(){
 const n=materials.length;
 return <section className="pg-studio" aria-labelledby="pg-band-title">
  <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>01</span>Textures</p><div><h2 id="pg-band-title">材料的下一站。</h2><p>從回收原材的特性出發，探索設計與製造的可能。</p></div></div>
  <div className="pg-reel is-materials" aria-label="循環材料質地"><ul>{[...materials,...materials].map(([name,en,slug,src],i)=>{const copy=i>=n;return <li key={i} className={i%n%2?'is-low':undefined} aria-hidden={copy||undefined}><a href={`#/read/pages/${slug}`} tabIndex={copy?-1:undefined}><img src={src} {...small({src,width:1440},'(max-width: 760px) 60vw, 34vw')} alt={copy?'':`${name}原材料質地`} loading="lazy"/><span className="mt-name"><em>{two(i%n+1)}</em><span className="mt-words"><strong>{name}</strong><small lang="en">{en}</small></span></span></a></li>})}</ul></div>
 </section>;
}

// Price per classic model (NT$, owner 2026-11-09). A's price depends on its wood.
const prices=[['A',[['北美黃檜',2500],['木橫擔',2800]]],['B',[['',2800]]],['C',[['',2000]]],['D',[['',2300]]],['E',[['',3000]]]];
// v53: plain list, no box. Name (bold first letter) + 款 above the price; A's two woods share one line.
function PriceList(){
 return <ul className="pg-prices">{prices.map(([id,options])=><li key={id}>
  <span className="pg-prices-name"><span lang="en"><b>{id}</b>{classicNames[id].slice(1)}</span>款</span>
  {options.length>1&&<small>{options.map(([wood])=>wood).join(' / ')}</small>}
  <strong><i>NT$</i>{options.map(([,price])=>price.toLocaleString('en-US')).join(' / ')}</strong>
 </li>)}</ul>;
}

export const landings={
 standard:{en:'Classic',title:'公版獎盃',
  // v51 (owner, 2026-11-09): lead time and the price of each model, as the owner gave them.
  // v64: the price list sits in the right column (under 銘版排版工作室), one model per row; 款式 and 製作時程 on the left.
  card:[['Models','款式','A、B、C、D、E','is-left'],['Studio','銘版排版工作室','即時預覽・下載確認稿'],['Lead time','製作時程',<>3 個工作天<small>10 座以上工期另計</small></>,'is-left'],['Price','價格',<PriceList/>,'is-price']],
  actions:[['開始排版','#/preview/A'],['寄信洽詢','mailto:service@re-o.co','ghost'],['來電洽詢','tel:+886289665369','ghost'],['訂製常見問題','#/read/pages/faq','ghost']],
  // No full-bleed photo here: the ordering steps and the six models come straight after the facts.
  band:StudioBand,indexEn:'Models',indexTitle:'五款公版',grid:'is-models',
  closing:['需要專屬造型，或品牌自己的材料？',['品牌獎盃訂製','#/read/pages/custom'],['禮贈品訂製','#/explore/products']]},
 // v60 (owner, 2026-11-16): the cases summary shows the owner's headline figures instead of the per-group counts
 // (the index below still filters by group).
 cases:{en:'Works',title:'企業與IP案例',card:'groups',unit:'件作品',
  stats:[['合作企業','100+','家'],['企業獎盃','90+','件作品'],['品牌獎盃訂製','80+','件作品']],
  actions:[['聯絡合作','mailto:service@re-o.co'],['合作品牌牆','#/brands','ghost']],
  hero:{src:'/assets/case-ase.webp',alt:'日月光 ASE 最佳供應獎盃',width:2400,height:2400,position:'50% 42%'},
  band:CollaborationBand,indexEn:'Works',indexTitle:'全部合作案例',grid:'is-works',
  closing:['合作領域涵蓋電子金控、政府單位與商業品牌。',['合作品牌牆','#/brands'],['品牌獎盃訂製','#/read/pages/custom']]},
 materials:{en:'Materials',title:'循環材料',card:'groups',
  actions:[['專料訂製','#/read/pages/custom'],['寄信洽詢','mailto:service@re-o.co','ghost']],
  hero:{src:'/content/images/8a959cd06cce7ed889.webp',alt:'re.O 工作室分類保存的回收材料',width:1440,height:1080,position:'50% 50%'},unit:'種材料',
  band:MaterialReel,indexEn:'Materials',indexTitle:'全部循環材料',grid:'is-materials',
  closing:['企業有顆粒、粉末化可再利用的廢棄物料，由 re.O 評估製作專屬材質。',['專料訂製','#/read/pages/custom'],['工藝與工作室文章','#/explore/journal']]},
 // v53 (owner, 2026-11-09): 品牌訂製 (the former 客製化獎盃, #/read/pages/custom) and 禮贈品訂製 (#/explore/products)
 // follow the 公版 page: facts card, the 一條龍 process, an image-led explanation, then the cases.
 custom:{en:'Brand',title:'品牌獎盃訂製',
  card:[['Modes','訂製方式','專案訂製・專料訂製'],['Packaging','包裝','客製化訂製'],['Email','電子郵件',<a href="mailto:service@re-o.co">service@re-o.co</a>],['Phone','電話',<a href="tel:+886289665369">+886-2-8966-5369</a>]],
  actions:[['寄信洽詢','mailto:service@re-o.co'],['來電洽詢','tel:+886289665369','ghost'],['訂製常見問題','#/read/pages/faq','ghost']],
  band:BrandBand,indexEn:'Works',indexTitle:'企業獎盃案例',grid:'is-works',meta:'year',
  closing:['想先看看公版款式，或為品牌準備禮贈品？',['公版獎盃','#/explore/standard'],['禮贈品訂製','#/explore/products']]},
 products:{en:'Gifts',title:'禮贈品訂製',
  card:[['Range','品項','品牌禮贈・品牌器物・IP聯名設計'],['Packaging','包裝','客製化訂製'],['Email','電子郵件',<a href="mailto:service@re-o.co">service@re-o.co</a>],['Phone','電話',<a href="tel:+886289665369">+886-2-8966-5369</a>]],
  actions:[['寄信洽詢','mailto:service@re-o.co'],['來電洽詢','tel:+886289665369','ghost'],['訂製常見問題','#/read/pages/faq','ghost']],
  band:GiftBand,indexEn:'Works',indexTitle:'禮贈品案例',grid:'is-works',
  closing:['需要專屬造型，或品牌自己的材料？',['品牌獎盃訂製','#/read/pages/custom'],['循環材料','#/explore/materials']]},
 journal:{en:'Journal',title:'設計與工藝'},
 about:{en:'Studio',title:'品牌與工藝內容'}
};
