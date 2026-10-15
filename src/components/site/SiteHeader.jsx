import React,{useEffect,useRef,useState} from 'react';
import {navigation} from './navigation.js';
import Icon from '../Icon.jsx';
import './site.css';
export function SiteArrow(){return <svg viewBox="0 0 40 20" fill="none" aria-hidden="true"><path d="M1 10h36m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.2"/></svg>}
export default function SiteHeader(){
 const [open,setOpen]=useState(null),[mobile,setMobile]=useState(false);const header=useRef(null),last=useRef(null);
 const close=()=>{setOpen(null);setMobile(false)};
 useEffect(()=>{const route=()=>close(),outside=e=>{if(!header.current?.contains(e.target))setOpen(null)},key=e=>{if(e.key==='Escape'){close();last.current?.focus()}};window.addEventListener('hashchange',route);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{window.removeEventListener('hashchange',route);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)}},[]);
 const group=navigation.find(n=>n.id===open);
 return <header className="folio-header site-header-v4 folio-gutter" ref={header}><a className="folio-brand" href="#/" aria-label="re.O 首頁"><img src="/assets/reo-logo.png" alt="re.O" width="100" height="100"/></a><nav className={mobile?'site-navigation is-open':'site-navigation'} aria-label="主要導覽">{navigation.map(n=><div className="site-nav-group" key={n.id}><button className={open===n.id?'is-active':''} aria-expanded={open===n.id} aria-controls={`nav-${n.id}`} onClick={e=>{last.current=e.currentTarget;setOpen(open===n.id?null:n.id)}}>{n.label}<Icon name="chevronDown" size={12}/></button>{open===n.id&&<div className="site-mobile-submenu" id={`nav-${n.id}`}>{n.links.map(([name,href])=><a href={href} key={href} onClick={close}>{name}<SiteArrow/></a>)}</div>}</div>)}<a className="site-studio-link" href="#/preview/B" onClick={close}>排版工作室<SiteArrow/></a></nav><button className="folio-menu" aria-label={mobile?'關閉選單':'開啟選單'} aria-expanded={mobile} onClick={()=>{setMobile(!mobile);setOpen(null)}}><Icon name={mobile?'close':'menu'}/></button>{group&&<div className="site-mega folio-gutter" id={`nav-${group.id}-desktop`}><div><h2>{group.label}</h2><p>{group.intro}</p></div><div className="site-mega-links">{group.links.map(([name,href])=><a href={href} key={href} onClick={close}>{name}<SiteArrow/></a>)}</div></div>}</header>
}
