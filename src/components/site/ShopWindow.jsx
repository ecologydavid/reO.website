import React from 'react';
import {shopLink} from './navigation.js';
import {ArrowIcon,Button} from './ui.jsx';
import './shop.css';
// Retail window for the studio's Pinkoi store (匠子 CHANZ STUDIO 官方設計館). Copy follows the 匠子 page;
// every link leaves the site in a new tab, and the button says so.
const img=id=>`/content/images/${id}.webp`;
const items=[
 ['翻轉鏡','Re-angle','43a75fafdb0f30f1de','天然大理石翻轉鏡，墨綠色'],
 ['摺紙花器','Origami','2dd8bf0e1606388637','再生大理石摺紙花器，白'],
 ['置物盤','Tray','3247bed9ddf66768ec','再生大理石置物盤，白、黑、粉'],
 ['杯墊','Coaster','d106f66e3cb2409f00','再生大理石杯墊'],
 ['戒台','Ring Stand','ec8cd8674818110eb7','再生大理石戒台'],
 ['名片架','Card Stand','d11ea9a0e0321b004c','再生大理石名片架']
];
const away={target:'_blank',rel:'noopener noreferrer'};
export default function ShopWindow(){
 const href=shopLink[1];
 return <section className="shop-window folio-gutter" id="shop" aria-labelledby="shop-title">
  <div className="shop-panel" data-reveal>
   <a className="shop-feature" href={href} {...away} tabIndex={-1} aria-hidden="true"><img src={img('5239c1559eb6e8363c')} alt="" width="1440" height="1080" loading="lazy"/></a>
   <div className="shop-body">
    <p className="shop-kicker"><span>Shop</span>匠子 CHANZ STUDIO・Pinkoi 官方設計館</p>
    <h2 id="shop-title">讓石材廢料，<br/>走入日常。</h2>
    <p className="shop-lead">回收大理石研磨成粉末，透過設計以不同面貌重新走入生活。</p>
    <ul className="shop-items">{items.map(([name,en,id,alt])=><li key={id}><a href={href} {...away} aria-label={`${name} ${en}：前往 Pinkoi 選購（另開新視窗）`}>
     <span className="shop-thumb"><img src={img(id)} alt={alt} width="1440" height="1080" loading="lazy"/></span>
     <strong>{name}</strong><em>{en}</em>
    </a></li>)}</ul>
    <div className="shop-actions"><Button href={href} {...away} className="shop-go" icon={<ArrowIcon/>} aria-label="前往 Pinkoi 選購（另開新視窗）">前往 Pinkoi 選購</Button><p>於 Pinkoi 結帳與配送</p></div>
   </div>
  </div>
 </section>;
}
