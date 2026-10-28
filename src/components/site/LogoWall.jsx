import React,{useCallback,useEffect,useRef,useState} from 'react';
import logos from '../../data/logo-wall.json';
import {SiteArrow} from './SiteHeader.jsx';
import BrandMark from './BrandMark.jsx';
import './brand-wall.css';
const priority=['ase','delta','pwc','pinkoi','fubon','hola','disney','tmall','taipower','iii'];
const ordered=[...logos].sort((a,b)=>{const x=priority.indexOf(a.id),y=priority.indexOf(b.id);return (x<0?99:x)-(y<0?99:y)});
// Marks drawn in white for dark grounds: 木客 keeps its white mark on an ink tile; DCC's black and
// white inks print as one dark silhouette.
const tone={muke:'is-dark',dcc:'is-silhouette'};

// Partner marks in their own colours on white tiles over a warm ground. Pointing at a mark brings it
// forward (the others step back) and a small print of the work follows the cursor: the photo, the
// project and the partner. Keyboard focus shows the same print beside the tile; touch goes straight
// to the case.
export default function LogoWall({standalone=false}){
 const card=useRef(null),motion=useRef({x:0,y:0,tx:0,ty:0,r:0,frame:0,on:false,still:false,loaded:false});
 const [active,setActive]=useState(null),[shown,setShown]=useState(null);
 useEffect(()=>{const m=motion.current;m.still=matchMedia('(prefers-reduced-motion: reduce)').matches;return()=>cancelAnimationFrame(m.frame)},[]);
 // The print eases towards the pointer and leans a little with its speed.
 const loop=useCallback(()=>{
  const m=motion.current,el=card.current;if(!el){m.frame=0;return}
  const k=m.still?1:.2,dx=(m.tx-m.x)*k,dy=(m.ty-m.y)*k;m.x+=dx;m.y+=dy;
  m.r+=(Math.max(-5,Math.min(5,dx*.4))-m.r)*.2;if(m.still)m.r=0;
  el.style.transform=`translate3d(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px,0) rotate(${m.r.toFixed(2)}deg)`;
  m.frame=m.on||Math.abs(dx)+Math.abs(dy)+Math.abs(m.r)>.2?requestAnimationFrame(loop):0;
 },[]);
 // Beside the point (right of it, or left near the screen edge), kept inside the window.
 const aim=useCallback((x,y,jump)=>{
  const m=motion.current,el=card.current;if(!el)return;
  const w=el.offsetWidth,h=el.offsetHeight,gap=28;
  m.tx=x+gap+w>innerWidth-16?x-gap-w:x+gap;m.ty=Math.max(16,Math.min(innerHeight-h-16,y-h*.4));
  if(jump){m.x=m.tx;m.y=m.ty;m.r=0}
  if(!m.frame)m.frame=requestAnimationFrame(loop);
 },[loop]);
 const show=useCallback((logo,x,y)=>{
  const m=motion.current,first=!m.on;m.on=true;setActive(logo.id);setShown(logo);
  // Prints are small (520px WebP); fetch them all once the wall is first pointed at.
  if(!m.loaded){m.loaded=true;logos.forEach(l=>{if(l.preview)new Image().src=l.preview.src})}
  requestAnimationFrame(()=>aim(x,y,first));
 },[aim]);
 const hide=useCallback(()=>{motion.current.on=false;setActive(null)},[]);
 const mouse=e=>e.pointerType==='mouse';
 return <section className={`site-brand-wall brand-ledger folio-gutter ${standalone?'standalone':''}`} id="brands">
  <div className="folio-section-heading"><h2>與不同品牌，<br/>共同完成值得<span style={{whiteSpace:'nowrap'}}>留下的作品。</span></h2><p>企業委製、品牌合作與授權設計案例。</p></div>
  <div className="site-logo-grid" onPointerMove={e=>{if(mouse(e)&&motion.current.on)aim(e.clientX,e.clientY)}} onPointerLeave={e=>{if(mouse(e))hide()}}>
   {ordered.map(logo=><article className={`site-logo-cell brand-card ${tone[logo.id]||''}${active===logo.id?' is-active':''}`} key={logo.id}>
    <a className="brand-card-link" href={logo.href} aria-label={`閱讀 ${logo.name} 合作案例：${logo.project?.split('｜')[0]||logo.name}`}
     onPointerEnter={e=>{if(mouse(e))show(logo,e.clientX,e.clientY)}}
     onFocus={e=>{if(!e.currentTarget.matches(':focus-visible'))return;const b=e.currentTarget.getBoundingClientRect();show(logo,b.right-12,b.top+b.height/2)}}
     onBlur={hide}>
     <BrandMark image={logo.image} name={logo.name}/>
    </a>
   </article>)}
  </div>
  <figure className={`brand-preview${active?' is-on':''}`} ref={card} aria-hidden="true">
   {shown&&<>{shown.preview&&<img src={shown.preview.src} alt="" width={shown.preview.width} height={shown.preview.height}/>}<figcaption><em>{shown.name}</em><strong>{shown.project?.split('｜')[0]||shown.name}</strong></figcaption></>}
  </figure>
  <div className="site-brand-bottom"><p>依各專案的委製與合作關係展示；HOLA 授權設計、代理委製等資訊詳見案例說明。</p><a className="folio-link" href="#/explore/cases">探索全部合作案例<SiteArrow/></a></div>
 </section>
}
