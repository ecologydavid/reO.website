import React,{useEffect,useRef,useState} from 'react';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import {setPageMeta} from '../seo.js';
import './pages.css';
// About, awards and contact share one page: contact details first, then the studio told in photographs.
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
const awards=[['2018','金點設計獎','積木文具收納組'],['2019','金點設計獎','摺紙花器花瓶組'],['2019','千里馬創業競賽','文創設計銀獎'],['2024','台北市亮點企業','潛力企業獎']];
const industry=[['2024／2025','台北市工業發展協會','理事當選'],['2026','台灣設計研究院','IDDI 設計驅動產業創新']];
// Press and talks, newest first. Titles and dates were checked against each linked page (2026-11-05).
// Covers are re.O's own photographs of the work each piece is about, or the broadcast stills the studio
// already published; nothing is copied from the outlets' sites.
const press=[
 {group:'媒體報導',year:'2023',outlet:'alive 商業周刊',title:'四大工藝家為 Restaurant A 創作有故事的食器',line:'與設計師許向罕以永續大理石，為香檳吧設計餐盤。',href:'https://alive.businessweekly.com.tw/single/Index/ARTL006002367',img:'e39512226aa1eb8e1c',w:1440,h:720,pos:'0 50%',alt:'Restaurant A 香檳區地貌餐盤，以再生大理石製作'},
 {group:'媒體報導',year:'2021',outlet:'SHOPLINE',title:'給大理石廢料重生的機會，也創造自己人生的機會',line:'創辦人專訪：從大理石廢料走出自己的品牌。',href:'https://stories.shopline.tw/chanzstudio-interview/',img:'20c3cb403bd92efa80',w:1440,h:1080,alt:'大理石邊角料研磨成粉的材質研發'},
 {group:'媒體報導',year:'2020',outlet:'自由時報',title:'消費控・友愛地球｜匠子 CHANZ STUDIO 建材再生',line:'大理石、煤灰、紙漿、紅磚的再生應用。',href:'https://ent.ltn.com.tw/news/paper/1413645/',img:'790b5fdc0f89df0d7f',w:1440,h:1080,alt:'煤灰原材料'},
 {group:'媒體報導',year:'2020',outlet:'La vie',title:'岩石蠟燭、大理石萬用筒！5 款台灣設計的再生居家配件',line:'推薦台灣再生設計品牌。',src:'/assets/press-lavie-coasters.webp',w:1080,h:1080,alt:'再生大理石杯墊與燭台，黑、白、粉三色'},
 {group:'媒體報導',year:'2019',outlet:'東森新聞',title:'復刻天然石紋 環保藝術「再生」商機',line:'網路平台興起的設計師。',href:'https://news.ebc.net.tw/News/living/173159',img:'4d583523776e0af614',w:1440,h:720,alt:'東森新聞報導畫面，設計師李東陽於工作室'},
 {group:'媒體報導',year:'2019',outlet:'The Femin',title:'沉穩石紋堆砌出的一方天地',line:'台灣品牌 Chanz studio 以再生大理石塑造創意家飾。',href:'https://thefemin.com/2019/01/chanz-studio-brand/',src:'/assets/press-femin-desk.webp',w:770,h:461,alt:'匠子 CHANZ studio 再生大理石文具收納'},
 {group:'媒體報導',outlet:'三立 iNEWS',title:'邊角料獲新生 再生大理石打造循環經濟',line:'將再生大理石打造循環設計。',img:'7b8d09cc95edd385ae',w:1440,h:720,alt:'三立 iNEWS 報導畫面'},
 {group:'媒體報導',outlet:'TVBS',title:'以再生大理石為材質的居家擺件',img:'5f8549a5155d8ad5a8',w:870,h:435,alt:'TVBS 報導畫面，設計師於工作室製作'},
 {group:'講座與平台',year:'2020 起',outlet:'社會創新平台',title:'或心國際設計有限公司',line:'以設計整合廢棄物回收與品牌商品，如咖啡渣店內餐盤。',href:'https://si.taiwan.gov.tw/Home/Org?Fid=646',src:'/assets/press-si-material-cubes.webp',w:1067,h:1600,alt:'各種再生材質試片方塊，附金屬名牌'},
 {group:'講座與平台',year:'2018',outlet:'GQ × Pinkoi',title:'BUSINESS FORUM 設計場：看台灣設計如何走向國際市場',line:'與 Pinkoi、Alto 分享設計品牌的海外經營。',href:'https://www.accupass.com/event/1811131015405616959940',img:'8adb10dc0ad1b38e8f',w:1440,h:960,alt:'職人手中灑落的再生材料粉末'}
];
const pressGroups=[...new Set(press.map(p=>p.group))];
// An index of outlets and titles beside one print. Pointing at, focusing or tapping an entry brings its
// photograph into the print, in full colour.
function Press(){
 const [active,setActive]=useState(0),item=press[active];
 return <section className="pg-press" aria-labelledby="pg-press-title">
  <div className="pg-press-grid folio-gutter">
   <div className="pg-press-side" data-reveal>
    <p className="pg-kicker"><span>04</span>Press · Talks</p><h2 id="pg-press-title">報導與講座</h2>
    <figure className="pg-press-print">{press.map((p,i)=><img key={p.title} className={i===active?'is-on':undefined} src={p.src||img(p.img)} alt={i===active?p.alt:''} aria-hidden={i!==active||undefined} width={p.w} height={p.h} loading="lazy" style={p.pos?{objectPosition:p.pos}:undefined}/>)}<figcaption><em>{item.outlet}</em>{item.year||''}</figcaption></figure>
   </div>
   <div className="pg-press-index">{pressGroups.map(g=><div key={g} data-reveal><h3>{g}<span>{press.filter(p=>p.group===g).length}</span></h3><ol>{press.map((p,i)=>p.group!==g?null:<li key={p.title} className={i===active?'is-on':undefined} onPointerEnter={()=>setActive(i)}>
    {React.createElement(p.href?'a':'button',{className:'pg-press-row',...(p.href?{href:p.href,target:'_blank',rel:'noreferrer'}:{type:'button'}),onFocus:()=>setActive(i),onClick:p.href?undefined:()=>setActive(i)},<><span className="pg-press-year">{p.year||'—'}</span><span className="pg-press-main"><em>{p.outlet}</em><strong>{p.title}</strong>{p.line?<small>{p.line}</small>:null}</span><span className="pg-press-go" aria-hidden="true">{p.href?'↗':''}</span></>)}
   </li>)}</ol></div>)}</div>
  </div>
 </section>;
}
export default function AboutPage({focus}){
 const root=useRef(null);
 useEffect(()=>{setPageMeta({title:'關於 re.O',description:'re.O 以再生材質開發為起點，整合品牌語彙、立體建模、排版、灌模與工作室組裝。聯絡方式、設計獎項與工作室介紹。'});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));if(focus)document.getElementById(focus)?.scrollIntoView();return()=>observer.disconnect()},[focus]);
 return <main className="pg pg-about" ref={root}>
  <div className="folio-gutter"><nav className="content-breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>/</span><span>關於 re.O</span></nav></div>
  <header className="pg-top folio-gutter" id="about-contact">
   <div className="pg-title"><p className="content-display" aria-hidden="true">Studio</p><h1>關於 re.O</h1><p>以再生材質開發為起點，整合品牌語彙、立體建模、排版、灌模與工作室組裝。</p></div>
   <div className="pg-contact">
    <dl>{contact.map(([en,label,value])=><div key={en}><dt><span>{en}</span>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="pg-actions"><Button href="mailto:service@re-o.co">寄信洽詢</Button><Button variant="ghost" href="tel:+886289665369">來電預約</Button><Button variant="ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">地圖導航</Button></div>
   </div>
  </header>

  <figure className="pg-hero"><img src={img('8adb10dc0ad1b38e8f')} alt="職人手中灑落的再生材料粉末" width="1440" height="960" fetchPriority="high"/></figure>

  <section className="pg-studio" aria-labelledby="pg-studio-title">
   <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>01</span>Material · Design · Making</p><div><h2 id="pg-studio-title">材料、設計、製造。</h2><p>re.O 獨家研發再生材質，將廢料重新再利用。從品牌語彙設計、立體建模到文字排版，透過灌模製造與工作室組裝，把關每一步過程。</p></div></div>
   <div className="pg-reel" aria-label="工作室照片"><ul>{[...studio,...studio].map(([id,alt],i)=><li key={i} className={i%studio.length%2?'is-low':undefined} aria-hidden={i>=studio.length||undefined}><img src={img(id)} alt={i<studio.length?alt:''} width="1440" height="1440" loading="lazy"/></li>)}</ul></div>
  </section>

  <section className="pg-origami" aria-labelledby="pg-origami-title">
   <div className="pg-split folio-gutter" data-reveal><p className="pg-kicker"><span>02</span>Origami Series</p><div><h2 id="pg-origami-title">摺紙花器</h2><p>2019 金點設計獎</p></div></div>
   <ul className="pg-lift folio-gutter">{origami.map(([shape,tone,rest,lift],i)=><li key={rest} style={{'--i':i}} data-reveal><a href="#/read/products/摺紙花器-origami-series" aria-label={`摺紙花器 ${shape}・${tone}`}><span className="pg-lift-frame"><img src={img(rest)} alt={`再生大理石摺紙花器，${shape}・${tone}`} width="1440" height="1080" loading="lazy"/><img src={img(lift)} alt="" width="1440" height="1080" loading="lazy"/></span><span className="pg-lift-name"><em>{String(i+1).padStart(2,'0')}</em>{shape}・{tone}</span></a></li>)}</ul>
  </section>

  <section className="pg-awards folio-gutter" id="about-awards" aria-labelledby="pg-awards-title">
   <figure data-reveal><img src={img('6b4b9c911d975c8a87')} alt="金點獎得獎商品，摺紙花器與積木文具組" width="1080" height="1440" loading="lazy"/></figure>
   <div data-reveal>
    <p className="pg-kicker"><span>03</span>Awards</p><h2 id="pg-awards-title">設計獎項與產業參與</h2>
    <h3>設計獲獎</h3><ol className="pg-years">{awards.map(([y,name,work])=><li key={name+work}><span>{y}</span><strong>{name}</strong><em>{work}</em></li>)}</ol>
    <h3>產業參與</h3><ol className="pg-years">{industry.map(([y,name,work])=><li key={name}><span>{y}</span><strong>{name}</strong><em>{work}</em></li>)}</ol>
   </div>
  </section>

  <Press/>

  <section className="pg-closing folio-gutter" data-reveal>
   <p>合作領域涵蓋電子金控、政府單位與商業品牌。</p>
   <div className="pg-actions"><Button href="#/brands" variant="ghost">合作品牌牆</Button><ArrowLink href="#/explore/about">品牌與工藝內容</ArrowLink></div>
  </section>
 </main>;
}
