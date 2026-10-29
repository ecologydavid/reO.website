import React,{useEffect} from 'react';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {keepRanges} from './arrange.js';
import {setPageMeta} from '../seo.js';
import './pages.css';
// 訂製與服務常見問題. Facts follow the migrated FAQ page (derived-faq-v4) and the shipping policy; the
// wording is shortened for customers. Three numbers lead so the essentials read in seconds; every
// answer stays open (no accordion) in a question | answer ledger.
const facts=[['3–10','個工作天','公版製作時間'],['2–3','次','設計校稿'],['1–3','天','宅配到貨（本島）']];
const groups=[
 {n:'01',en:'Ordering',title:'訂製方式',items:[
  ['公版、專案、專料訂製有什麼不同？',<ul><li><b>公版</b>從現有款式挑選，提供文字與數量即可。</li><li><b>專案</b>依品牌需求，討論造型、尺寸與材質。</li><li><b>專料</b>提供品牌的可再利用廢料，評估後製作專屬材質。</li></ul>],
  ['公版獎盃需要準備什麼？','請提供 LOGO 的 AI 檔與獎盃文字。下單前，歡迎先與我們確認內容。'],
  ['可以先看設計稿再付款嗎？','公版訂製於付款後開始繪製設計圖，含 2～3 次校稿；超過次數將另計費用。'],
  ['可以用品牌的廢料做專屬材料嗎？','可以。請先提供可再利用的廢料，我們評估可行性後，進行材質測試與設計。'],
  ['包裝可以客製嗎？','可以。分為全客製、部分客製與簡易訂製，可訂製外盒、內襯與品牌標識（如 UV 印刷、燙印）。']
 ]},
 {n:'02',en:'Delivery',title:'製作與配送',items:[
  ['製作需要多久？','公版約 3～10 個工作天，依訂單數量而定；現貨約 2～3 個工作天寄出。實際交期請與我們確認。'],
  ['有哪些配送方式？','台灣本島順豐宅配約 1～3 天；外島以郵局寄送；7-11、全家超商取貨約 3～4 天。節慶或訂單較多時可能延遲。']
 ]},
 {n:'03',en:'Material',title:'材質',items:[
  ['每件再生石材的紋理都一樣嗎？','不一樣。石紋在灌注時自然流動，每件都獨一無二；手工製作也可能留有細微的模線或研磨痕跡。']
 ]}
];
export default function FaqPage(){
 useEffect(()=>{setPageMeta({title:'常見問題',description:'公版、專案與專料訂製的差別、製作交期、校稿、配送方式與再生石材紋理等常見問題。'})},[]);
 return <main className="pg pg-faq">
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><a href="#/read/pages/custom">客製化獎盃</a><span>/</span><span>常見問題</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title"><p className="content-display" aria-hidden="true">FAQ</p><h1>常見問題</h1><p>訂製、交期與配送，先看這裡。</p></div>
   <dl className="pg-faq-facts">{facts.map(([n,unit,label])=><div key={label}><dt>{label}</dt><dd><strong>{n}</strong><span>{unit}</span></dd></div>)}</dl>
  </header>
  <div className="pg-faq-body folio-gutter">{groups.map(g=><section className="pg-faq-group" key={g.n} aria-labelledby={`faq-${g.n}`}>
   <header><p className="pg-kicker"><span>{g.n}</span>{g.en}</p><h2 id={`faq-${g.n}`}>{g.title}</h2></header>
   <dl>{g.items.map(([q,a])=><div key={q}><dt>{q}</dt><dd>{keepRanges(a)}</dd></div>)}</dl>
  </section>)}</div>
  <section className="pg-faq-contact folio-gutter" aria-labelledby="faq-contact">
   <div><h2 id="faq-contact">還有其他問題？</h2><p>歡迎來信或來電，我們會盡快回覆。</p></div>
   <div className="pg-actions"><Button href="mailto:service@re-o.co">service@re-o.co</Button><Button variant="ghost" href="tel:+886289665369">+886-2-8966-5369</Button></div>
   <nav className="pg-faq-more" aria-label="更多服務說明"><ArrowLink href="#/read/about/delivery-policy">運送說明</ArrowLink><ArrowLink href="#/read/about/policy">退換貨說明</ArrowLink></nav>
  </section>
 </main>;
}
