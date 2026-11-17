import React,{useCallback,useEffect,useRef,useState} from 'react';
import {navigation,shopLink,supportLinks,isExternal} from './navigation.js';
import {ArrowIcon,BrandLogo,Button,Chip,MenuIcon,studioTab} from './ui.jsx';
import {useRoute,toPath} from '../../router.js';
import './site.css';
import './header-v6.css';
// Content pages and the brand wall import the shared arrow from here.
export function SiteArrow(){return <Chip/>}
// The header carries the animated circle mark alone (by request the "for real" signature is gone).
function HomeMark({onClick}){return <a className="site-brand" href="#/" onClick={onClick} aria-label="re.O 首頁"><span className="folio-brand"><BrandLogo/></span></a>}
// Product pages share #/read/products/: the classic trophies (trophy…, F款…) belong to 公版獎盃, the rest to 禮贈品訂製.
const decode=hash=>{try{return decodeURIComponent(hash)}catch{return hash}};
const activeGroup=hash=>{const h=decode(hash);if(h.startsWith('#/read/products/')&&!['trophy','the-way-to-peak','f款'].some(k=>h.slice(16).toLowerCase().startsWith(k)))return 'gifts';return navigation.find(n=>n.match.some(prefix=>hash.startsWith(prefix)))?.id};
// Home (and #/brands, which opens home at the wall) marks the 首頁 link as current.
const isHome=hash=>['','#','#/'].includes(hash)||hash.startsWith('#/brands');
// v63 (owner, 2026-11-16): the overlay menu repeated the header links on desktop, so there were two maps of the site.
// Desktop now has one: the header links, each opening a short panel of its own sub-pages (SubPanel). This sheet is the
// same map for phones and tablets (≤1100px), where the links do not fit: every group with its sub-pages, then 服務指南.
function SiteMenu({onClose,onDismiss,current,home}){
 const panel=useRef(null);
 useEffect(()=>{
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  panel.current.querySelector('.site-sheet-close').focus();
  const key=e=>{
   if(e.key==='Escape')onDismiss();
   if(e.key!=='Tab')return;
   const items=[...panel.current.querySelectorAll('a,button')],first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key)};
 },[onDismiss]);
 return <div className="site-sheet" id="site-menu" role="dialog" aria-modal="true" aria-label="網站選單" ref={panel}>
  <div className="site-sheet-bar folio-gutter"><HomeMark onClick={onClose}/><Button variant="ghost" className="site-sheet-close" onClick={onDismiss} icon={<MenuIcon open/>}>關閉</Button></div>
  <nav className="site-sheet-list folio-gutter" aria-label="主要導覽">
   <a className="site-sheet-home" href="#/" onClick={onClose} aria-current={home?'page':undefined}>首頁</a>
   {navigation.map(group=><section key={group.id}>
    <h2><a href={group.href} onClick={onClose} aria-current={current===group.id?'page':undefined}>{group.short}<ArrowIcon/></a></h2>
    <ul>{group.links.map(([name,href])=><li key={href}><SubLink name={name} href={href} onClick={onClose}/></li>)}</ul>
   </section>)}
   <section><h2 className="is-label">服務指南</h2><ul>{supportLinks.map(([name,href])=><li key={href}><a href={href} onClick={onClose}>{name}</a></li>)}</ul></section>
  </nav>
  <div className="site-sheet-foot folio-gutter"><a href="mailto:service@re-o.co">service@re-o.co</a><a href="tel:+886289665369">+886-2-8966-5369</a></div>
 </div>;
}
function SubLink({name,href,onClick}){return isExternal(href)
 ?<a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>{name}<span aria-hidden="true"> ↗</span><span className="sr-only">（另開新視窗）</span></a>
 :<a href={href} {...(href.startsWith('#/preview/')?studioTab:{})} onClick={onClick}>{name}</a>}
// The panel under a header link (v64): the group's pages, each with a one-line note; 關於 re.O also carries 服務指南.
// The current page is marked. align keeps the last panels inside the header's right edge.
function SubPanel({group,x,right,here,onPick}){
 const row=([name,href,note,model])=>{const ext=isExternal(href),on=!ext&&decodeURIComponent(toPath(href))===here;
  return <li key={href}><a href={href} {...(ext?{target:'_blank',rel:'noopener noreferrer'}:href.startsWith('#/preview/')?studioTab:{})} aria-current={on?'page':undefined} onClick={onPick}>
   {model?<span className={`site-sub-model${model.featured?' is-featured':''}`}><b aria-hidden="true">{model.letter}</b><strong><span className="sr-only">{model.letter} 款 </span>{name}</strong><small>{note}</small></span>
   :<span><strong>{name}{ext&&<span className="sr-only">（另開新視窗）</span>}</strong>{note&&<small>{note}</small>}</span>}
   <svg className="rv-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d={ext?'M5 11l6-6M6 5h5v5':'M3 8h10M9 4l4 4-4 4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </a></li>};
 return <div className={`site-sub${right?' is-right':''}`} style={right?{right:0}:{left:x}} role="group" aria-label={`${group.label}子頁面`}><div>
  <ul>{group.menu.filter(m=>!m[3]).map(row)}</ul>
  {group.menu.some(m=>m[3])&&<><p>A 至 E 款</p><ul className="is-models">{group.menu.filter(m=>m[3]).map(row)}</ul></>}
  {group.id==='about'&&<><p>服務指南</p><ul className="is-plain">{supportLinks.map(([name,href])=>row([name,href]))}</ul></>}
 </div></div>;
}
export default function SiteHeader(){
 const [open,setOpen]=useState(false),hash=useRoute();
 const trigger=useRef(null),close=useCallback(()=>setOpen(false),[]);
 // Escape and the close button hand focus back to the menu button; following a link does not.
 const dismiss=useCallback(()=>{setOpen(false);trigger.current?.focus({preventScroll:true})},[]);
 useEffect(()=>{setOpen(false)},[hash]);
 const current=activeGroup(hash);
 // The header stays on screen: it condenses once the page scrolls, slips away while reading
 // downwards and returns on the first scroll up.
 const [condensed,setCondensed]=useState(false),[hidden,setHidden]=useState(false);
 useEffect(()=>{
  let last=window.scrollY,frame=0;
  // v53: condensing has a gap (in above 40px, out below 8px) so a slow scroll near the top cannot flip it back and forth.
  const update=()=>{const y=window.scrollY;setCondensed(c=>y>40?true:y<8?false:c);setHidden(h=>y<320?false:y>last+6?true:y<last-6?false:h);last=y};
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',onScroll,{passive:true});return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame)};
 },[]);
 // One pill slides under the links: it rests on the current section and follows hover and focus.
 const nav=useRef(null),[pill,setPill]=useState(null);
 // `instant` skips the slide when the pill first appears, so it never sweeps in from the left edge.
 const place=useCallback(el=>setPill(old=>el?{x:el.offsetLeft,w:el.offsetWidth,instant:!old||old.off}:old&&{...old,off:true}),[]);
 const rest=useCallback(()=>place(nav.current?.querySelector('[aria-current=page]')),[place]);
 // Which link's panel is open (desktop). Opens on hover or keyboard focus, closes on leaving the links, Escape or a pick.
 const [sub,setSub]=useState(null),[on,setOn]=useState(null),leaving=useRef(0);
 // The pill's link (`on`) is the only one drawn in white; every other label stays ink, so no label can end up white on
 // the light capsule (it did when the pointer moved from a link down into its panel).
 const enter=(n,el)=>{clearTimeout(leaving.current);place(el);setOn(n.id);setSub(n.menu?{id:n.id,x:el.offsetLeft,right:el.offsetLeft+el.offsetWidth/2>nav.current.offsetWidth*.62}:null)};
 // Leaving waits a moment, so a diagonal move from a link to its panel does not close it.
 const leave=()=>{clearTimeout(leaving.current);leaving.current=setTimeout(()=>{rest();setOn(null);setSub(null)},140)};
 const shut=()=>{clearTimeout(leaving.current);rest();setOn(null);setSub(null)};
 useEffect(()=>()=>clearTimeout(leaving.current),[]);
 useEffect(()=>{setSub(null)},[hash]);
 useEffect(()=>{rest();const observer=new ResizeObserver(rest);observer.observe(nav.current);return()=>observer.disconnect()},[rest,current,hash]);
 return <header className={`folio-header site-header-v5 folio-gutter${condensed?' is-condensed':''}${hidden&&!open?' is-hidden':''}`}>
  <HomeMark/>
  <nav className="site-links" aria-label="主要導覽" ref={nav} onMouseLeave={leave} onMouseEnter={()=>clearTimeout(leaving.current)} onBlur={e=>{if(!nav.current.contains(e.relatedTarget))shut()}} onKeyDown={e=>{if(e.key==='Escape')shut()}}>
   <span className={`site-links-pill${pill?.instant?' is-instant':''}`} aria-hidden="true" style={pill?{width:pill.w,transform:`translateX(${pill.x}px)`,opacity:pill.off?0:1}:{opacity:0}}/>
   {/* v50 (owner, 2026-11-08): 首頁 leads the capsule. */}
   {[{id:'home',short:'首頁',href:'#/'},...navigation].map(n=><React.Fragment key={n.id}><a href={n.href} className={[n.menu&&'has-sub',(on?on===n.id:(n.id==='home'?isHome(hash):current===n.id))&&'is-pill'].filter(Boolean).join(' ')||undefined} aria-current={(n.id==='home'?isHome(hash):current===n.id)?'page':undefined} aria-expanded={n.menu?sub?.id===n.id:undefined} onMouseEnter={e=>enter(n,e.currentTarget)} onFocus={e=>enter(n,e.currentTarget)}><span>{n.short}</span></a>{sub?.id===n.id&&<SubPanel group={n} x={sub.x} right={sub.right} here={decodeURIComponent(toPath(hash))} onPick={shut}/>}</React.Fragment>)}
  </nav>
  <div className="site-actions">
   {/* Retail has its own button: the studio's Pinkoi store, in a new tab (arrow tilted to say so). */}
   <Button href={shopLink[1]} target="_blank" rel="noopener noreferrer" variant="ghost" className="site-shop" icon={<ArrowIcon/>} aria-label="Pinkoi 選購（另開新視窗）"><img className="site-shop-logo" src="/assets/pinkoi-logo.png" alt="Pinkoi" width="213" height="64"/><span className="site-shop-label">選購</span></Button>
   <Button variant="ghost" className="site-menu-button" ref={trigger} aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(true)} icon={<MenuIcon/>}>選單</Button>
  </div>
  {open&&<SiteMenu onClose={close} onDismiss={dismiss} current={current} home={isHome(hash)}/>}
 </header>;
}
