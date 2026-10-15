import React,{useEffect,useRef,useState} from 'react';
import models from '../data/models.json';
import Icon from './Icon.jsx';
import './home.css';
function Arrow(){return <svg className="architect-arrow" viewBox="0 0 44 20" fill="none" aria-hidden="true"><path d="M1 10h40m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.2"/></svg>}
function Brand(){return <img src="/assets/reo-logo.png" alt="re.O" width="104" height="104"/>}
const materialLabels={A:'退役木橫擔・再生大理石',B:'北美黃檜・再生大理石',C:'北美黃檜・再生大理石',D:'再生大理石・ABS 銘版',E:'再生大理石・金屬鋁片',F:'再生大理石・層疊結構'};
const process=[['材料研發','從產業剩餘材料出發，探索再製配方與應用。'],['設計建模','理解材料特性，透過造型與細節，轉化為作品。'],['製造組裝','從模具、加工到組裝，讓設計逐步成形。']];
export default function Home({onPreview}) {
  const [menuOpen,setMenuOpen]=useState(false),[about,setAbout]=useState(false),[materialsOpen,setMaterialsOpen]=useState(false);
  const root=useRef(null),aboutTrigger=useRef(null),aboutClose=useRef(null);
  useEffect(()=>{
    const elements=root.current.querySelectorAll('[data-reveal]');
    if(!('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});
    elements.forEach(element=>observer.observe(element));return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!about)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';aboutClose.current?.focus();
    const key=e=>{
      if(e.key==='Escape')setAbout(false);
      if(e.key==='Tab'){
        const controls=root.current.querySelectorAll('.architect-dialog button,.architect-dialog a');
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
      }
    };document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',key);aboutTrigger.current?.focus()};
  },[about]);
  function closeMenu(){setMenuOpen(false)}
  return <div className="architect-home" ref={root}>
    <a className="architect-skip" href="#collection">跳至公版獎盃</a>
    <header className="architect-header"><a className="architect-brand" href="#/" aria-label="re.O 首頁"><Brand/></a><nav className={menuOpen?'architect-nav is-open':'architect-nav'} aria-label="主要導覽"><a href="#collection" onClick={closeMenu}>公版獎盃</a><a href="#materials" onClick={closeMenu}>循環材料</a><a href="#about" onClick={closeMenu}>關於 re.O</a><button className="architect-nav-preview" onClick={()=>onPreview('B')}>排版預覽<Arrow/></button></nav><button className="architect-menu" aria-label={menuOpen?'關閉選單':'開啟選單'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><Icon name={menuOpen?'close':'menu'} size={25}/></button></header>
    <main>
      <section className="architect-hero"><div className="architect-hero-copy"><h1>讓材料新生，<br/>讓榮耀永續。</h1><p>從再生材料出發，<br/>為每一份成就，留下獨特印記。</p><div className="architect-hero-actions"><a className="architect-link" href="#collection">探索公版獎盃<Arrow/></a><button className="architect-secondary" onClick={()=>onPreview('B')}>開始排版</button></div></div><figure className="architect-hero-photo"><img src="/assets/hero.jpg" alt="E 款 The way to PEAK，黑金與白色再生大理石搭配折彎金屬鋁片的實品獎盃" fetchPriority="high" width="5429" height="4072"/><figcaption>The way to PEAK — 再生大理石 × 金屬鋁片</figcaption></figure><p className="architect-signature">re.O 循環設計</p></section>
      <section className="architect-collection architect-gutter" id="collection"><div className="architect-section-head" data-reveal><h2>為每一種成就，<br/>找到合適的形狀。</h2><p>六款公版設計，結合再生材質與專屬銘版。<br/>選擇款式，開始你的排版。</p></div><div className="architect-products">{models.map(m=><button className="architect-product" key={m.id} onClick={()=>onPreview(m.id)} aria-label={`預覽 ${m.id} 款 ${m.name}`} data-reveal><div className="architect-product-photo"><img src={m.photo} alt={`${m.id} 款 ${m.name} ${m.kind}實品`} loading="lazy" width="1600" height="1200"/><span className="architect-product-action">開始排版<Arrow/></span></div><div className="architect-product-meta"><h3>{m.id}<span>/</span>{m.name}</h3><span className="architect-price">NT$ {m.price}</span><Arrow/></div><p>{materialLabels[m.id]}</p></button>)}</div><p className="architect-note">官網參考價格，實際選項、數量與時程依詢價確認。C、F 沿用官網獎牌分類。</p></section>
      <section className="architect-materials" id="materials"><div className="architect-material-photo" data-reveal><img src="/assets/material-powder.jpg" alt="再生大理石的原料，研磨後的白色石材粉末" loading="lazy" width="1200" height="900"/></div><div className="architect-material-copy" data-reveal><p className="architect-label">循環材料</p><h2>材料的下一段，<br/>由設計開始。</h2><p className="architect-body">大理石邊料研磨為粉末，再與樹脂結合，<br className="architect-desktop-break"/>重新成為可被使用、被珍惜的物件。</p><div className="architect-material-bottom"><button className="architect-link" aria-expanded={materialsOpen} aria-controls="material-details" onClick={()=>setMaterialsOpen(!materialsOpen)}>{materialsOpen?'收起材料應用':'探索材料應用'}<Arrow/></button><ul><li>再生大理石</li><li>回收玻璃</li><li>咖啡渣</li><li>退役木橫擔</li></ul></div></div>{materialsOpen?<div className="architect-material-details architect-gutter" id="material-details"><h3>讓不同的材料，找到新的用途。</h3><p>re.O 的材料應用也涵蓋煤灰、水庫淤泥、木屑、木頭拼板與焚化再生粒料。不同材料依專案評估；公版獎盃的組成，以各款商品介紹為準。</p><a className="architect-link" href="https://www.re-o.co/pages/material" target="_blank" rel="noopener noreferrer">閱讀官網材料介紹<Arrow/></a></div>:null}</section>
      <section className="architect-about architect-gutter" id="about"><div className="architect-about-copy" data-reveal><h2>從材料，到作品。</h2><p>我們相信，設計能延續材料的生命，<br/>也讓每一份心意更有意義。</p><button ref={aboutTrigger} className="architect-link" onClick={()=>setAbout(true)}>認識 re.O<Arrow/></button></div><dl className="architect-process" data-reveal>{process.map(([title,description])=><div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl></section>
      <section className="architect-closing architect-gutter" data-reveal><h2>把心意，留在銘版上。</h2><button className="architect-link" onClick={()=>onPreview('B')}>開始排版<Arrow/></button></section>
    </main>
    <footer className="architect-footer architect-gutter"><div className="architect-footer-brand"><a href="#/" aria-label="re.O 回到首頁"><Brand/></a><span>或心國際設計有限公司</span></div><div className="architect-contact"><a href="mailto:service@re-o.co">service@re-o.co</a><a href="tel:+886289665369">+886-2-8966-5369</a></div><p>© re.O 循環設計<span>網站設計樣例</span></p></footer>
    {about?<div className="architect-backdrop" onClick={()=>setAbout(false)}><section className="architect-dialog" role="dialog" aria-modal="true" aria-labelledby="architect-about-title" onClick={e=>e.stopPropagation()}><button ref={aboutClose} className="architect-dialog-close" aria-label="關閉品牌介紹" onClick={()=>setAbout(false)}><Icon name="close"/></button><Brand/><h2 id="architect-about-title">為材料創造新的可能。</h2><p>re.O 專注於循環材料開發與客製化設計，從品牌語彙、立體建模到製造組裝，提供完整服務。</p><p>我們透過材料的來源、製程與實際應用說明永續，讓企業的每份心意都留下具體故事。</p><address>週一至週五 10:30–18:00<br/>新北市板橋區實踐路93巷43弄1號1樓<br/>來訪請事先預約</address><a className="architect-link" href="https://www.re-o.co/pages/about" target="_blank" rel="noopener noreferrer">閱讀原官網品牌介紹<Arrow/></a></section></div>:null}
  </div>;
}
