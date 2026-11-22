import React from 'react';
import {shopLink} from '../components/site/navigation.js';
import {flowParagraphs} from './arrange.js';

const logos={
 '順豐物流':['sf-express',123,46],
 '郵局':['chunghwa-post',50,49],
 '7-11':['7-eleven',38,39],
 '全家':['familymart',148,26],
};
const markedTerms=/(順豐物流|郵局|7\u2060?-\u2060?11|全家|宅配|超商)/g;

function DeliveryIcon({store}){
 return <svg viewBox="0 0 32 26" width="32" height="26" aria-hidden="true" fill="currentColor">
  {store?<>
   <path d="M2 2h28v10H2zM4 13h2v11H4zm22 0h2v11h-2zM4 23h24v2H4zm5-8h14v9h-2v-7h-4v7h-2v-7h-4v7H9z"/>
   <text x="16" y="10" fill="white" textAnchor="middle" fontSize="8" fontWeight="700">24</text>
  </>:<>
   <path d="M12 4h18v14H12zM6 9h5v9H2v-3zm-4 9h28v3H2z"/><path d="M6.8 11H9v4H4.2z" fill="white"/>
   <circle cx="8" cy="21" r="3.4" stroke="white"/><circle cx="24" cy="21" r="3.4" stroke="white"/>
  </>}
 </svg>;
}

function markTerms(text){
 const seen=new Set();
 return text.split(markedTerms).map((part,index)=>{
  if(index%2===0)return part;
  const term=part.replace(/\u2060/g,'');
  if(seen.has(term))return part;
  seen.add(term);
  const logo=logos[term];
  return <span className="shipping-term" key={index}>{logo?<img src={`/assets/shipping-${logo[0]}.png`} width={logo[1]} height={logo[2]} alt=""/>:<DeliveryIcon store={term==='超商'}/>}<span>{term}</span></span>;
 });
}

export default function ShippingPolicy({section}){
 const paragraphs=flowParagraphs(section.paragraphs);
 return <section className="content-prose-section shipping-policy" id="section-0">
  <h2>{section.heading}</h2>
  {paragraphs.map((paragraph,index)=><p key={index}>{markTerms(paragraph)}</p>)}
  <p className="shipping-platform"><a href={shopLink[1]} target="_blank" rel="noreferrer"><img src="/assets/pinkoi-logo.png" width="213" height="64" alt="Pinkoi"/> 設計館</a>：平台訂單的配送選項以結帳頁面顯示為準。</p>
 </section>;
}
