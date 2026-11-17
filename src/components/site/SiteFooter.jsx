import React from 'react';
import {navigation,supportLinks,shopLink,isExternal} from './navigation.js';
import {BrandLogo,studioTab} from './ui.jsx';
import './footer-v6.css';
const toTop=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
// v63 (owner, 2026-11-16: the footer was too long and too big). One compact block, about half the old height:
// the mark and the company facts on the left (facts first, as the reference studios do), then four short link
// columns that follow the header's order (訂製 = the three services, 作品與材料, 關於, 服務指南), and one slim closing
// line. The large "讓下一件作品" lead and its button are gone; 銘版排版工作室 is a link in the first column.
const byId=Object.fromEntries(navigation.map(n=>[n.id,n]));
const group=(...ids)=>[...ids.map(id=>[byId[id].label,byId[id].href]),...ids.flatMap(id=>byId[id].links.filter(l=>l!==shopLink))];
const columns=[
 ['訂製服務',group('products','custom','gifts')],
 ['作品與材料',group('cases','materials')],
 ['關於',[...group('about'),shopLink]],
 ['服務指南',supportLinks]
];
const Link=({name,href})=>isExternal(href)
 ?<a href={href} target="_blank" rel="noopener noreferrer">{name}<span aria-hidden="true"> ↗</span><span className="sr-only">（另開新視窗）</span></a>
 :<a href={href} {...(href.startsWith('#/preview/')?studioTab:{})}>{name}</a>;
export default function SiteFooter(){return <footer className="site-footer-v6">
 <div className="sf-main folio-gutter">
  <section className="sf-company" aria-label="公司資訊">
   <a className="sf-logo" href="#/" aria-label="re.O 首頁"><BrandLogo alt="" size={300}/></a>
   <div>
    <p className="sf-name">或心國際設計有限公司<span>統編 83502057</span></p>
    <address>新北市板橋區實踐路93巷43弄1號1樓</address>
    <p>週一至週五 10:30–18:00・來訪請事先預約</p>
    <p className="sf-contact"><a href="mailto:service@re-o.co">service@re-o.co</a><a href="tel:+886289665369">+886-2-8966-5369</a></p>
   </div>
  </section>
  {columns.map(([title,links])=><nav key={title} aria-label={title}><h2>{title}</h2><ul>{links.map(([name,href])=><li key={href}><Link name={name} href={href}/></li>)}</ul></nav>)}
 </div>
 <div className="sf-end folio-gutter">
  <p><span lang="en">re.O</span>材質再生 循環設計</p>
  <p className="sf-legal">© {new Date().getFullYear()} 或心國際設計有限公司</p>
  <button type="button" onClick={toTop}>回到頂部<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
 </div>
</footer>}
