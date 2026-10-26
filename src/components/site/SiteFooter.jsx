import React from 'react';
import {navigation,shopLink,supportLinks} from './navigation.js';
import {BrandLogo,Button} from './ui.jsx';
export default function SiteFooter(){return <footer className="site-footer-v5">
 <div className="site-footer-top folio-gutter">
  <div className="site-footer-lead"><p>讓下一件作品，<br/>從這裡開始。</p><Button href="#/preview/B" variant="light">開始銘版排版</Button></div>
  {navigation.map(n=><nav key={n.id} aria-label={n.label}><h2><a href={n.href}>{n.label}</a></h2>{n.links.map(([name,href])=><a key={href} href={href}>{name}</a>)}</nav>)}
 </div>
 {/* The animated mark signs the company block instead of floating alone in its own row. */}
 <div className="site-footer-info folio-gutter">
  <a className="site-footer-logo" href="#/" aria-label="re.O 首頁"><BrandLogo alt="" size={300}/></a>
  <div><p>或心國際設計有限公司</p><address>新北市板橋區實踐路93巷43弄1號1樓</address><p>週一至週五 10:30–18:00・來訪請事先預約</p></div>
  <div><a href="mailto:service@re-o.co">service@re-o.co</a><a href="tel:+886289665369">+886-2-8966-5369</a></div>
  <nav aria-label="服務指南">{supportLinks.map(([name,href])=><a key={href} href={href}>{name}</a>)}<a href="#/read/pages/contact">聯絡預約</a><a className="site-shop-link" href={shopLink[1]} target="_blank" rel="noopener noreferrer">{shopLink[0]}<span aria-hidden="true"> ↗</span><span className="sr-only">（另開新視窗）</span></a></nav>
 </div>
 <p className="site-footer-legal folio-gutter"><span>© re.O 循環設計</span><span>網站設計樣例</span></p>
</footer>}
