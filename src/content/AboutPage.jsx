import React,{useEffect,useRef,useState} from 'react';
import {small,half,third} from '../components/site/responsive.js';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {setPageMeta} from '../seo.js';
import {record,kinds} from './record.js';
import './pages.css';
// About, awards and contact share one page: contact details first, then the studio told in photographs,
// then one record of awards, roles, press and talks.
// Copy follows the migrated 關於 ABOUT, 設計獎項 and 聯絡 CONTACT pages.
const img=id=>`/content/images/${id}.webp`;
const address='新北市板橋區實踐路93巷43弄1號1樓';
const contact=[
 ['Email','電子郵件',<a href="mailto:service@re-o.co">service@re-o.co</a>],
 ['Phone','電話',<a href="tel:+886289665369">+886-2-8966-5369</a>],
 ['Hours','服務時間',<><span className="pg-keep">週一至週五</span> <span className="pg-keep">10:30–18:00</span><small>來訪請事前來電預約</small></>],
 // The address breaks only between district and street, never inside 93巷43弄.
 ['Address','地址',<><span className="pg-keep">220 新北市板橋區</span><wbr/><span className="pg-keep">實踐路93巷43弄1號1樓</span><small>統一編號 83502057</small></>]
];
const studio=[
 ['f7cf2451cb151f0457','回收的大理石邊料'],['2beb1f5609257129cd','工作室攝影棚'],['e556ca2577415a6741','材料紋理'],
 ['c7d019885720d583be','石材與金屬零件'],['0b9cc353f2982e96ef','成排的灌注模具'],['a31dc3066bc0f3a14d','打磨時配戴的防護面罩'],['62d4e165d65fcd2e3f','調配再生材料']
];
// Each origami vase was shot twice: at rest, and with a hand lifting the glass sleeve.
const origami=[
 ['菱柱','白','2dd8bf0e1606388637','81d190192af76222fa'],['菱片','白','1ac9ce8989b87e3014','23a222c96e1ed1f7f2'],['水流','白','3aacbe711f692465bb','3b615dc85c62537f9d'],
 ['菱柱','黑','6032a4bc8ecdf7f4b3','67141306e37d6f6edd'],['水流','黑','8e6c19a2cd085ba447','3204b6c5463b9fc572'],['菱片','黑','f31db3aab026d52dfb','9697749ded3407ff6d']
];
// One chronological index beside one print. The chips narrow it to a kind; pointing at, focusing or
// tapping an entry brings its photograph into the print. A year shows once, on the first row it covers.
// Entries share photos, so each photo is loaded once; a stand-in photo is marked 示意照片. Data: record.js.
const srcOf=p=>p.src||img(p.img),prints=[...new Map(record.map(p=>[srcOf(p),p])).values()];
function RecordCaption({item}){
 return <figcaption><em>{item.outlet||item.title}</em>{item.year&&<span>{item.year}</span>}{item.generic?<small>示意照片</small>:null}</figcaption>;
}
function Record(){
 const [kind,setKind]=useState(''),[active,setActive]=useState(0),item=record[active];
 const ownerPhoto=item.src?.includes('/assets/about-events/');
 const printShape=ownerPhoto?(item.w<item.h?' is-portrait':item.w/item.h>1.7?' is-wide':''):'';
 const shown=record.map((p,i)=>[p,i]).filter(([p])=>!kind||p.kind===kind);
 const choose=k=>{setKind(k);setActive(record.findIndex(p=>!k||p.kind===k))};
 return <section className="pg-press" id="about-awards" aria-labelledby="pg-press-title" tabIndex={-1}>
  <div className="pg-press-grid folio-gutter">
   <div className="pg-press-side" data-reveal>
    <p className="pg-kicker"><span>04</span>Awards · Exhibitions · Talks · Press</p><h2 id="pg-press-title">設計講座與產業報導</h2>
    <figure className={`pg-press-print${printShape}`}>{prints.map(p=>{const on=srcOf(p)===srcOf(item),position=on?item.pos:p.pos;return <img key={srcOf(p)} className={on?'is-on':undefined} src={srcOf(p)} alt={on?item.alt:(p.alt||'')} aria-hidden={!on||undefined} width={p.w} height={p.h} loading="lazy" style={position?{objectPosition:position}:undefined}/>})}<RecordCaption item={item}/></figure>
   </div>
   <div className="pg-press-index" data-reveal>
    <div className="pg-press-filters" role="group" aria-label="依類別篩選"><button type="button" aria-pressed={!kind} onClick={()=>choose('')}>全部<span>{record.length}</span></button>{kinds.map(k=><button key={k} type="button" aria-pressed={kind===k} onClick={()=>choose(k)}>{k}<span>{record.filter(p=>p.kind===k).length}</span></button>)}</div>
    <ol>{shown.map(([p,i],n)=>{const same=n>0&&(shown[n-1][0].year||'—')===(p.year||'—');return <li key={p.outlet+p.title} className={i===active?'is-on':undefined} onPointerEnter={()=>{if(matchMedia('(min-width: 1101px) and (hover: hover)').matches)setActive(i)}}>
     {React.createElement(p.href?'a':'button',{className:'pg-press-row',...(p.href?{href:p.href,target:'_blank',rel:'noreferrer'}:{type:'button'}),onFocus:()=>setActive(i),onClick:p.href?undefined:()=>setActive(i)},<><span className={`pg-press-year${same?' is-same':''}`}>{p.year||'—'}</span><span className="pg-press-main"><em><b>{p.kind}</b>{p.outlet?<span>{p.outlet}</span>:null}</em><strong>{p.title}</strong>{p.line?<small>{p.line}</small>:null}</span><span className="pg-press-go" aria-hidden="true">{p.href?'↗':''}</span></>)}
     {i===active&&<figure className="pg-press-inline"><img src={srcOf(p)} alt={p.alt} width={p.w} height={p.h} loading="lazy"/><RecordCaption item={p}/></figure>}
    </li>})}</ol>
   </div>
  </div>
 </section>;
}
function focusRecord(sectionId,behavior='instant'){
 const section=document.getElementById(sectionId);
 if(!section)return;
 section.focus({preventScroll:true});
 section.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
}
export default function AboutPage({focus}){
 const root=useRef(null);
 useEffect(()=>{setPageMeta({title:'關於 re.O',description:'re.O 由李東陽創辦，以再生材質開發為起點，整合品牌語彙、立體建模、排版、灌模與工作室組裝。聯絡方式、創辦人、設計獎項與工作室介紹。',trail:[['首頁','#/'],['關於 re.O','#/read/pages/about']],canonical:'#/read/pages/about'});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));return()=>observer.disconnect()},[]);
 useEffect(()=>{
  if(!focus)return;
  let frame;
  const position=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>focusRecord(focus))};
  position();
  window.addEventListener('route-revisit',position);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('route-revisit',position)};
 },[focus]);
 return <main className="pg pg-about" ref={root}>
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>關於 re.O</span></nav></div>
  <header className="pg-top folio-gutter" id="about-contact">
   <div className="pg-title"><p className="content-display" aria-hidden="true">Studio</p><h1>關於 re.O</h1><p>以再生材質開發為起點，整合品牌語彙、立體建模、排版、灌模與工作室組裝。</p></div>
   <div className="pg-contact">
    <dl>{contact.map(([en,label,value])=><div key={en}><dt><span>{en}</span>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="pg-actions"><Button href="mailto:service@re-o.co">寄信洽詢</Button><Button variant="ghost" href="tel:+886289665369">來電預約</Button><Button variant="ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">地圖導航</Button></div>
   </div>
  </header>

  <figure className="pg-hero"><img src={img('8adb10dc0ad1b38e8f')} {...small({src:img('8adb10dc0ad1b38e8f'),width:1440})} alt="職人手中灑落的再生材料粉末" width="1440" height="960" fetchPriority="high"/></figure>

  {/* v64 (owner, 2026-11-17): the founder. Only facts with a source on file: the company's responsible person and
      designer (TISDC talk deck 2026, 東森新聞 2019), the two Golden Pin awards and the talks listed in the record below.
      The portrait is the owner's own. A fuller biography waits for the owner's text. */}
  <section className="pg-founder folio-gutter" id="about-founder" aria-labelledby="pg-founder-title">
   <figure data-reveal><img src="/assets/founder-dong-profile.webp" alt="re.O 創辦人李東陽的側面肖像" width="900" height="900" loading="lazy"/></figure>
   <div data-reveal>
    <p className="pg-kicker"><span>01</span>Founder</p>
    <h2 id="pg-founder-title">李東陽<span lang="en">Dong</span></h2>
    <p className="pg-founder-role">或心國際設計有限公司 負責人・設計師</p>
    <p>李東陽以回收石材為起點，帶領 re.O 研發再生材質，把企業與產業的廢料重新設計成獎盃、禮贈品與生活物件；也以匠子 CHANZ STUDIO 發表自有設計系列。</p>
    <dl>
     <div><dt>設計獲獎</dt><dd>金點設計獎：摺紙花器花瓶組（2019）、積木文具收納組（2018）</dd></div>
     <div><dt>講座分享</dt><dd>TISDC 校園循環經濟講座「從實踐到未來：永續設計」（2025–2026）</dd></div>
     <div><dt>媒體報導</dt><dd>東森新聞〈復刻天然石紋 環保藝術「再生」商機〉（2019）</dd></div>
    </dl>
    <p className="pg-founder-more"><a href="#about-awards" onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();focusRecord('about-awards','smooth')}}>完整的獲獎、展覽與講座紀錄<span aria-hidden="true"> ↓</span></a></p>
   </div>
  </section>

  <section className="pg-studio" aria-labelledby="pg-studio-title">
   <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>02</span>Material · Design · Making</p><div><h2 id="pg-studio-title">材料、設計、製造。</h2><p>re.O 獨家研發再生材質，將廢料重新再利用。從品牌語彙設計、立體建模到文字排版，透過灌模製造與工作室組裝，把關每一步過程。</p></div></div>
   <div className="pg-reel" aria-label="工作室照片"><ul>{[...studio,...studio].map(([id,alt],i)=><li key={i} className={i%studio.length%2?'is-low':undefined} aria-hidden={i>=studio.length||undefined}><img src={img(id)} {...small({src:img(id),width:1440},third)} alt={i<studio.length?alt:''} width="1440" height="1440" loading="lazy"/></li>)}</ul></div>
  </section>

  <section className="pg-origami" aria-labelledby="pg-origami-title">
   <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>03</span>Origami Series</p><div><h2 id="pg-origami-title">摺紙花器</h2><p>2019 金點設計獎</p></div></div>
   <ul className="pg-lift folio-gutter">{origami.map(([shape,tone,rest,lift],i)=><li key={rest} style={{'--i':i}} data-reveal><a href="#/read/products/摺紙花器-origami-series" aria-label={`摺紙花器 ${shape}・${tone}`}><span className="pg-lift-frame"><img src={img(rest)} alt={`再生大理石摺紙花器，${shape}・${tone}`} width="1440" height="1080" loading="lazy"/><img src={img(lift)} alt="" width="1440" height="1080" loading="lazy"/></span><span className="pg-lift-name"><em>{String(i+1).padStart(2,'0')}</em>{shape}・{tone}</span></a></li>)}</ul>
  </section>

  <Record/>

  <section className="pg-closing folio-gutter" data-reveal>
   <p>合作領域涵蓋電子金控、政府單位與商業品牌。</p>
   <div className="pg-actions"><Button href="#/brands" variant="ghost">合作品牌牆</Button><ArrowLink href="#/read/pages/chanz-studio">匠子 CHANZ STUDIO</ArrowLink></div>
  </section>
 </main>;
}
