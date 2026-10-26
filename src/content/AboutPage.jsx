import React,{useEffect,useRef} from 'react';
import {Button,ArrowLink} from '../components/site/ui.jsx';
import './pages.css';
// About, awards and contact share one page: contact details first, then the studio told in photographs.
// Copy follows the migrated 關於 ABOUT, 設計獎項 and 聯絡 CONTACT pages.
const img=id=>`/content/images/${id}.webp`;
const address='新北市板橋區實踐路93巷43弄1號1樓';
const contact=[
 ['Email','電子郵件',<a href="mailto:service@re-o.co">service@re-o.co</a>],
 ['Phone','電話',<a href="tel:+886289665369">+886-2-8966-5369</a>],
 ['Hours','服務時間',<>週一至週五 10:30–18:00<small>來訪請事前來電預約</small></>],
 ['Address','地址',<>220 {address}<small>統一編號 83502057</small></>]
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
const press=[
 ['La vie','fb69bea1c5f1451b2d',1440,720,'推薦台灣再生設計品牌'],['三立 iNEWS','7b8d09cc95edd385ae',1440,720,'將再生大理石打造循環設計'],
 ['東森新聞','4d583523776e0af614',1440,720,'網路平台興起的設計師'],['TVBS','5f8549a5155d8ad5a8',870,435,'以再生大理石為材質的居家擺件']
];
export default function AboutPage({focus}){
 const root=useRef(null);
 useEffect(()=>{document.title='re.O｜關於 re.O';const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});root.current.querySelectorAll('[data-reveal]').forEach(e=>observer.observe(e));if(focus)document.getElementById(focus)?.scrollIntoView();return()=>observer.disconnect()},[focus]);
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

  <section className="pg-press folio-gutter" aria-labelledby="pg-press-title">
   <div className="pg-split" data-reveal><p className="pg-kicker"><span>04</span>Press</p><div><h2 id="pg-press-title">品牌報導</h2></div></div>
   <ul>{press.map(([name,id,w,h,line])=><li key={name} data-reveal><span className="pg-press-photo"><img src={img(id)} alt={`${name} 報導畫面：${line}`} width={w} height={h} loading="lazy"/></span><strong>{name}</strong><span>{line}</span></li>)}</ul>
  </section>

  <section className="pg-closing folio-gutter" data-reveal>
   <p>合作領域涵蓋電子金控、政府單位與商業品牌。</p>
   <div className="pg-actions"><Button href="#/brands" variant="ghost">合作品牌牆</Button><ArrowLink href="#/explore/about">品牌與工藝內容</ArrowLink></div>
  </section>
 </main>;
}
