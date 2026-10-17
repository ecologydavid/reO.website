import React,{useEffect,useRef,useState} from 'react';
import logos from '../../data/logo-wall.json';
import {SiteArrow} from './SiteHeader.jsx';
import BrandMark from './BrandMark.jsx';
import './brand-wall.css';
const priority=['ase','delta','pwc','pinkoi','fubon','hola','disney','tmall','taipower','iii'];
const ordered=[...logos].sort((a,b)=>{const x=priority.indexOf(a.id),y=priority.indexOf(b.id);return (x<0?99:x)-(y<0?99:y)});
// Tangent strips close the rounded perimeter between the two glass faces.
const corners=[['right','bottom',0],['left','bottom',90],['left','top',180],['right','top',270]].flatMap(([x,y,start])=>Array.from({length:6},(_,i)=>{
 const angle=start+(i+.5)*15,radians=angle*Math.PI/180;
 const cx=Math.cos(radians).toFixed(6),cy=Math.sin(radians).toFixed(6);
 return {left:`calc(${x==='right'?'100% - var(--slab-radius)':'var(--slab-radius)'} + var(--slab-radius) * ${cx})`,top:`calc(${y==='bottom'?'100% - var(--slab-radius)':'var(--slab-radius)'} + var(--slab-radius) * ${cy})`,transform:`translate(-50%,-50%) rotateZ(${angle}deg) rotateY(90deg)`,'--edge-light':`${Math.round(65-20*Math.cos(radians-1))}%`};
}));

function BrandSlab({logo}){
 const [opening,setOpening]=useState(false),timer=useRef(null);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const Tag=logo.href?'a':'button';
 const project=logo.project?.split('｜')[0]||logo.name;
 const projectTail=project.match(/^(.*?)([\u3400-\u9fff]{2,8})$/u);
 function activate(event){
  if(!logo.href){setOpening(value=>!value);return}
  // Touch plays one short flip before following the same local article link.
  // Modifier clicks and reduced-motion navigation retain native anchor behavior.
  if(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
  if(!matchMedia('(hover: none)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  event.preventDefault();if(opening)return;
  setOpening(true);timer.current=setTimeout(()=>{window.location.hash=logo.href.slice(1)},800);
 }
 return <article className={`site-logo-cell slab-glass${['muke','dcc'].includes(logo.id)?' slab-smoke':''}`}>
  <Tag className={`slab-link${opening?' is-opening':''}`} href={logo.href||undefined}
   aria-label={logo.href?`閱讀 ${logo.name} 合作案例`:`查看 ${logo.name} 合作資訊`}
   aria-expanded={!logo.href?opening:undefined} title={logo.project||logo.name}
   onClick={activate}>
   <span className="slab-surface" aria-hidden="true"><span className="slab-rotor">
    <span className="slab-face slab-front"><span className="slab-logo"><BrandMark image={logo.image} name={logo.name}/></span></span>
    <span className="slab-face slab-back"><span className="slab-back-logo"><BrandMark image={logo.image} name={logo.name}/></span><span className="slab-project">{projectTail?<>{projectTail[1]}<span className="project-tail">{projectTail[2]}</span></>:project}</span></span>
    <span className="slab-edge slab-edge-left"/><span className="slab-edge slab-edge-right"/><span className="slab-edge slab-edge-top"/><span className="slab-edge slab-edge-bottom"/>
    {corners.map((style,i)=><span className="slab-edge slab-corner" key={i} style={style}/>)}
   </span></span>
  </Tag>
 </article>
}

export default function LogoWall({standalone=false}){
 return <section className={`site-brand-wall material-wall folio-gutter ${standalone?'standalone':''}`} id="brands">
  <div className="folio-section-heading"><h2>與不同品牌，<br/>共同完成值得<span style={{whiteSpace:'nowrap'}}>留下的作品。</span></h2><p>企業委製、品牌合作與授權設計案例。</p></div>
  <div className="site-logo-grid">{ordered.map(logo=><BrandSlab logo={logo} key={logo.id}/>)}</div>
  <div className="site-brand-bottom"><p>依各專案的委製與合作關係展示；HOLA 授權設計、代理委製等資訊詳見案例說明。</p><a className="folio-link" href="#/explore/cases">探索全部合作案例<SiteArrow/></a></div>
 </section>
}

