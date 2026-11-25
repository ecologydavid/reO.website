import React,{useEffect} from 'react';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {keepRanges} from './arrange.js';
import {setPageMeta} from '../seo.js';
import {written,faqData} from './pageMeta.js';
import CountUp from '../components/site/CountUp.jsx';
import './pages.css';
// 訂製與服務常見問題. Facts follow the migrated FAQ page (derived-faq-v4) and the shipping policy; the
// wording is shortened for customers. Three numbers lead so the essentials read in seconds; every
// answer stays open (no accordion) in a question | answer ledger.
// v57 (owner, 2026-11-11): 公版 3 working days (10 or more pieces quoted separately, as on the 公版 page), 3 proof
// rounds, 1–3 days home delivery on the main island (owner, 2026-11-26: the shipping policy's 1 to 3 days is right; this page said 1–2). Each group leads with a photo in its sticky column; the three
// ways to order and the packaging answer carry a small picture each.
const facts=[['3','個工作天','公版製作時間'],['3','次','設計校稿'],['1–3','天','宅配到貨（本島）']];
const img=id=>`/content/images/${id}.webp`;
const Pic=({src,alt})=><img className="pg-faq-thumb" src={src} alt={alt} loading="lazy" width="96" height="96"/>;
const groups=[
 {n:'01',en:'Ordering',title:'訂製方式',photo:[img('78a844104cdc098c56'),'設計師手繪與量測模型草圖','從公版款式，到品牌專屬設計','50% 50%'],items:[
  ['公版、專案、專料訂製有什麼不同？',<ul className="pg-faq-ways"><li><Pic src="/assets/catalogue-D.webp" alt="D 款公版獎盃"/><p><b>公版</b>從現有款式挑選，提供文字與數量即可。</p></li><li><Pic src={img('dd4469ee343029f433')} alt="台達 50 週年訂製獎盃"/><p><b>專案</b>依品牌需求，討論造型、尺寸與材質。</p></li><li><Pic src={img('8a959cd06cce7ed889')} alt="re.O 工作室分類保存的回收材料"/><p><b>專料</b>提供品牌的可再利用廢料，評估後製作專屬材質。</p></li></ul>],
  // v1.4.1 (owner, 2026-11-26): how to order, small orders, a tighter budget.
  ['怎麼下單？','來信 service@re-o.co 或來電 +886-2-8966-5369，告訴我們款式或需求、數量與希望的交期，確認後報價。'],
  ['可以只訂少量嗎？','可以，少量訂單也接。'],
  ['預算有限怎麼選？','可以選公版獎盃：五款 NT$2,000 至 3,000，加上專屬銘版。需要專屬造型或材質時，再選品牌獎盃訂製。'],
  ['公版獎盃需要準備什麼？','請提供 LOGO 的 AI 檔與獎盃文字。下單前，歡迎先與我們確認內容。'],
  ['可以先看設計稿再付款嗎？','公版訂製於付款後開始繪製設計圖，含 3 次校稿；超過次數將另計費用。'],
  ['可以用品牌的廢料做專屬材料嗎？','可以。請先提供顆粒、粉末化可再利用的廢棄物料，我們評估可行性後，進行材質測試與設計。'],
  ['包裝可以客製嗎？',<div className="pg-faq-with"><Pic src={img('a39bc07b4f4aa850e6')} alt="黑色訂製外盒與內襯，裝載圓形獎座"/><p>可以，依照預算規劃不同訂製包裝。</p></div>]
 ]},
 {n:'02',en:'Delivery',title:'製作與配送',photo:[img('9c539bc9ebc1b804f7'),'以膠帶封箱出貨','包裝出貨，皆由 re.O 把關','50% 50%'],items:[
  ['製作需要多久？','公版約 3 個工作天，10 座以上工期另計；現貨約 2～3 個工作天寄出。實際交期請與我們確認。'],
  ['有哪些配送方式？','台灣本島順豐宅配約 1～3 天；外島以郵局寄送；7-11、全家超商取貨約 3～4 天。節慶或訂單較多時可能延遲。']
 ]},
 {n:'03',en:'Material',title:'材質',photo:[img('0ec85ee98fb1103204'),'D 款公版獎盃，白、黑、綠三色再生大理石並列','每一件的石紋，都不一樣','41% 58%'],items:[
  ['每件再生石材的紋理都一樣嗎？','不一樣。石紋在灌注時自然流動，每件都獨一無二；手工製作也可能留有細微的模線或研磨痕跡。'],
  ['想用品牌自己的材質有什麼限制？','需要是乾燥後的顆粒或粉末化狀物料。']
 ]}
];
// The answers as plain text for structured data (FAQPage): the same words the page shows, pictures left out.
const plain=n=>n==null||typeof n==='boolean'?'':typeof n==='string'||typeof n==='number'?String(n):Array.isArray(n)?n.map(plain).join(''):n.type===Pic?'':n.type==='b'?plain(n.props.children)+'：':plain(n.props?.children);
export default function FaqPage(){
 useEffect(()=>{setPageMeta({...written['#/read/pages/faq'],trail:[['首頁','#/'],['常見問題','#/read/pages/faq']],data:faqData(groups.flatMap(g=>g.items.map(([q,a])=>[q,plain(a)])))})},[]);
 return <main className="pg pg-faq">
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>服務指南</span><span>/</span><span>常見問題</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title"><p className="content-display" aria-hidden="true">FAQ</p><h1>常見問題</h1><p>訂製、交期與配送，先看這裡。</p></div>
   <dl className="pg-faq-facts">{facts.map(([n,unit,label])=><div key={label}><dt>{label}</dt><dd><strong><CountUp value={n}/></strong><span>{unit}</span></dd></div>)}</dl>
  </header>
  <div className="pg-faq-body folio-gutter">{groups.map(g=><section className="pg-faq-group" key={g.n} aria-labelledby={`faq-${g.n}`}>
   <header><p className="pg-kicker"><span>{g.n}</span>{g.en}</p><h2 id={`faq-${g.n}`}>{g.title}</h2>
    {g.photo?<figure className="pg-faq-photo"><img src={g.photo[0]} alt={g.photo[1]} loading="lazy" style={{objectPosition:g.photo[3]}}/><figcaption>{g.photo[2]}</figcaption></figure>:null}</header>
   <dl>{g.items.map(([q,a])=><div key={q}><dt>{q}</dt><dd>{keepRanges(a)}</dd></div>)}</dl>
  </section>)}</div>
  <section className="pg-faq-contact folio-gutter" aria-labelledby="faq-contact">
   <div><h2 id="faq-contact">還有其他問題？</h2><p>歡迎來信或來電，我們會盡快回覆。</p></div>
   <div className="pg-actions"><Button href="mailto:service@re-o.co">service@re-o.co</Button><Button variant="ghost" href="tel:+886289665369">+886-2-8966-5369</Button></div>
   <nav className="pg-faq-more" aria-label="更多服務說明"><ArrowLink href="#/read/about/delivery-policy">運送說明</ArrowLink></nav>
  </section>
 </main>;
}
