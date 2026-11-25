import React,{useEffect} from 'react';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {keepRanges} from './arrange.js';
import {setPageMeta} from '../seo.js';
import {written,faqData} from './pageMeta.js';
import {groups,questions} from './faq.js';
import CountUp from '../components/site/CountUp.jsx';
import './pages.css';
// 常見問題. The questions and answers live in faq.js (plain data, also read by the structured data and llms.txt);
// this file is the page. Three numbers lead so the essentials read in seconds; every answer stays open (no accordion)
// in a question | answer ledger, group by group, each group with a photo in its sticky column.
// v57 (owner, 2026-11-11): 公版 3 working days, 3 proof rounds. v1.4.0: 1–3 days home delivery on the main island.
// v1.5.0 (owner, 2026-11-26): five groups, 22 questions; a jump list under the title; each question numbered (Q01…),
// the number being a link to that question, so one answer can be pointed at or sent. Why the number stays outside the
// question's own text: see faq.js.
const facts=[['3','個工作天','公版製作時間'],['3','次','設計校稿'],['1–3','天','宅配到貨（本島）']];
const img=id=>`/content/images/${id}.webp`;
const Pic=({src,alt})=><img className="pg-faq-thumb" src={src} alt={alt} loading="lazy" width="96" height="96"/>;
// Answers that carry small pictures; the words are the same as the entry's `a` in faq.js.
const rich={
 ways:<ul className="pg-faq-ways"><li><Pic src="/assets/catalogue-D.webp" alt="D 款公版獎盃"/><p><b>公版</b>從現有款式挑選，提供文字與數量即可。</p></li><li><Pic src={img('dd4469ee343029f433')} alt="台達 50 週年訂製獎盃"/><p><b>專案</b>依品牌需求，討論造型、尺寸與材質。</p></li><li><Pic src={img('8a959cd06cce7ed889')} alt="re.O 工作室分類保存的回收材料"/><p><b>專料</b>提供品牌的可再利用廢料，評估後製作專屬材質。</p></li></ul>,
 packaging:<div className="pg-faq-with"><Pic src={img('a39bc07b4f4aa850e6')} alt="黑色訂製外盒與內襯，裝載圓形獎座"/><p>可以，依照預算規劃不同訂製包裝。</p></div>
};
const numberOf=Object.fromEntries(questions.map(q=>[q.id,q.n]));
export default function FaqPage(){
 useEffect(()=>{setPageMeta({...written['#/read/pages/faq'],trail:[['首頁','#/'],['常見問題','#/read/pages/faq']],data:faqData(questions.map(q=>[q.q,q.a]))})},[]);
 return <main className="pg pg-faq">
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>服務指南</span><span>/</span><span>常見問題</span></nav></div>
  <header className="pg-top folio-gutter">
   <div className="pg-title"><p className="content-display" aria-hidden="true">FAQ</p><h1>常見問題</h1><p>訂製、交期與配送，先看這裡。</p></div>
   <dl className="pg-faq-facts">{facts.map(([n,unit,label])=><div key={label}><dt>{label}</dt><dd><strong><CountUp value={n}/></strong><span>{unit}</span></dd></div>)}</dl>
  </header>
  <nav className="pg-faq-jump folio-gutter" aria-label="問題分類"><ul>{groups.map((g,i)=><li key={g.id}><a href={`#faq-${g.id}`}><span>{String(i+1).padStart(2,'0')}</span>{g.title}<em>{g.items.length} 題</em></a></li>)}</ul></nav>
  <div className="pg-faq-body folio-gutter">{groups.map((g,i)=><section className="pg-faq-group" key={g.id} id={`faq-${g.id}`} aria-labelledby={`faq-${g.id}-title`}>
   <header><p className="pg-kicker"><span>{String(i+1).padStart(2,'0')}</span>{g.en}</p><h2 id={`faq-${g.id}-title`}>{g.title}</h2>
    <figure className="pg-faq-photo"><img src={g.photo[0]} alt={g.photo[1]} loading="lazy" style={{objectPosition:g.photo[3]}}/><figcaption>{g.photo[2]}</figcaption></figure></header>
   <dl>{g.items.map(item=><div key={item.id} id={`q-${item.id}`}><dt><a className="pg-faq-no" href={`#q-${item.id}`} aria-label={`第 ${Number(numberOf[item.id])} 題的連結`}>Q{numberOf[item.id]}</a>{item.q}</dt><dd>{item.rich?rich[item.rich]:keepRanges(item.a)}</dd></div>)}</dl>
  </section>)}</div>
  <section className="pg-faq-contact folio-gutter" aria-labelledby="faq-contact">
   <div><h2 id="faq-contact">還有其他問題？</h2><p>歡迎來信或來電，我們會盡快回覆。</p></div>
   <div className="pg-actions"><Button href="mailto:service@re-o.co">service@re-o.co</Button><Button variant="ghost" href="tel:+886289665369">+886-2-8966-5369</Button></div>
   <nav className="pg-faq-more" aria-label="更多服務說明"><ArrowLink href="#/read/about/delivery-policy">運送說明</ArrowLink></nav>
  </section>
 </main>;
}
