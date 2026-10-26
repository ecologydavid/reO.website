import React,{useCallback,useEffect,useRef,useState} from 'react';
import {navigation,shopLink,supportLinks} from './navigation.js';
import {ArrowIcon,BrandLogo,Button,Chip,MenuIcon} from './ui.jsx';
import './site.css';
// Content pages and the brand wall import the shared arrow from here.
export function SiteArrow(){return <Chip/>}
const activeGroup=hash=>navigation.find(n=>n.match.some(prefix=>hash.startsWith(prefix)))?.id;
function SiteMenu({onClose,onDismiss}){
 const panel=useRef(null);
 useEffect(()=>{
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  panel.current.querySelector('.site-menu-close').focus();
  const key=e=>{
   if(e.key==='Escape')onDismiss();
   if(e.key!=='Tab')return;
   const items=[...panel.current.querySelectorAll('a,button')],first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key)};
 },[onDismiss]);
 return <div className="site-menu" id="site-menu" role="dialog" aria-modal="true" aria-label="網站選單" ref={panel}>
  <div className="site-menu-bar folio-gutter"><a className="folio-brand" href="#/" onClick={onClose} aria-label="re.O 首頁"><BrandLogo/></a><Button variant="ghost" className="site-menu-close" onClick={onDismiss} icon={<MenuIcon open/>}>關閉</Button></div>
  <div className="site-menu-grid folio-gutter">{navigation.map((group,i)=><section className="site-menu-group" key={group.id}>
   <a className="site-menu-photo" href={group.href} onClick={onClose} tabIndex={-1} aria-hidden="true"><img src={group.image} alt="" width="480" height="360"/></a>
   <p className="site-menu-index"><span>{String(i+1).padStart(2,'0')}</span>{group.en}</p>
   <h2><a href={group.href} onClick={onClose}>{group.label}</a></h2>
   <ul>{group.links.map(([name,href])=><li key={href}><a href={href} onClick={onClose}><span>{name}</span><ArrowIcon/></a></li>)}</ul>
  </section>)}</div>
  <div className="site-menu-foot folio-gutter">
   <nav aria-label="服務指南">{supportLinks.map(([name,href])=><a key={href} href={href} onClick={onClose}>{name}</a>)}<a className="site-shop-link" href={shopLink[1]} target="_blank" rel="noopener noreferrer">{shopLink[0]}<span aria-hidden="true"> ↗</span><span className="sr-only">（另開新視窗）</span></a></nav>
   <p><a href="mailto:service@re-o.co">service@re-o.co</a><a href="tel:+886289665369">+886-2-8966-5369</a></p>
   <Button href="#/preview/B" onClick={onClose}>開始銘版排版</Button>
  </div>
 </div>;
}
export default function SiteHeader(){
 const [open,setOpen]=useState(false),[hash,setHash]=useState(()=>window.location.hash);
 const trigger=useRef(null),close=useCallback(()=>setOpen(false),[]);
 // Escape and the close button hand focus back to the menu button; following a link does not.
 const dismiss=useCallback(()=>{setOpen(false);trigger.current?.focus({preventScroll:true})},[]);
 useEffect(()=>{const route=()=>{setHash(window.location.hash);setOpen(false)};window.addEventListener('hashchange',route);return()=>window.removeEventListener('hashchange',route)},[]);
 const current=activeGroup(hash);
 // The header stays on screen: it condenses once the page scrolls, slips away while reading
 // downwards and returns on the first scroll up.
 const [condensed,setCondensed]=useState(false),[hidden,setHidden]=useState(false);
 useEffect(()=>{
  let last=window.scrollY,frame=0;
  const update=()=>{const y=window.scrollY;setCondensed(y>24);setHidden(h=>y<320?false:y>last+6?true:y<last-6?false:h);last=y};
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',onScroll,{passive:true});return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame)};
 },[]);
 // One pill slides under the links: it rests on the current section and follows hover and focus.
 const nav=useRef(null),[pill,setPill]=useState(null);
 // `instant` skips the slide when the pill first appears, so it never sweeps in from the left edge.
 const place=useCallback(el=>setPill(old=>el?{x:el.offsetLeft,w:el.offsetWidth,instant:!old||old.off}:old&&{...old,off:true}),[]);
 const rest=useCallback(()=>place(nav.current?.querySelector('[aria-current=page]')),[place]);
 useEffect(()=>{rest();const observer=new ResizeObserver(rest);observer.observe(nav.current);return()=>observer.disconnect()},[rest,current]);
 return <header className={`folio-header site-header-v5 folio-gutter${condensed?' is-condensed':''}${hidden&&!open?' is-hidden':''}`}>
  <a className="folio-brand" href="#/" aria-label="re.O 首頁"><BrandLogo/></a>
  <nav className="site-links" aria-label="主要導覽" ref={nav} onMouseLeave={rest} onBlur={e=>{if(!nav.current.contains(e.relatedTarget))rest()}}>
   <span className={`site-links-pill${pill?.instant?' is-instant':''}`} aria-hidden="true" style={pill?{width:pill.w,transform:`translateX(${pill.x}px)`,opacity:pill.off?0:1}:{opacity:0}}/>
   {navigation.map(n=><a key={n.id} href={n.href} aria-current={current===n.id?'page':undefined} onMouseEnter={e=>place(e.currentTarget)} onFocus={e=>place(e.currentTarget)}><span>{n.short}</span></a>)}
  </nav>
  <div className="site-actions">
   <Button href="#/preview/B" className="site-studio">排版工作室</Button>
   <Button variant="ghost" className="site-menu-button" ref={trigger} aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(true)} icon={<MenuIcon/>}>選單</Button>
  </div>
  {open&&<SiteMenu onClose={close} onDismiss={dismiss}/>}
 </header>;
}
