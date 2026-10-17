import React,{useEffect,useRef,useState} from 'react';
import logos from '../../data/logo-wall.json';
import {SiteArrow} from './SiteHeader.jsx';
import BrandMark from './BrandMark.jsx';
import './brand-wall.css';
const slabTexture='/assets/brand-slab-ivory.png';
const priority=['ase','delta','pwc','pinkoi','fubon','hola','disney','tmall','taipower','iii'];
const ordered=[...logos].sort((a,b)=>{const x=priority.indexOf(a.id),y=priority.indexOf(b.id);return (x<0?99:x)-(y<0?99:y)});
const finishes=['glass','mineral','stone','stone','glass','stone','glass','stone','glass','stone','glass','stone','glass','stone','glass','mineral','stone','stone'];

function BrandSlab({logo,index}){
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
  setOpening(true);timer.current=setTimeout(()=>{window.location.hash=logo.href.slice(1)},680);
 }
 return <article className={`site-logo-cell slab-${finishes[index%finishes.length]}`}>
  <Tag className={`slab-link${opening?' is-opening':''}`} href={logo.href||undefined}
   aria-label={logo.href?`閱讀 ${logo.name} 合作案例`:`查看 ${logo.name} 合作資訊`}
   aria-expanded={!logo.href?opening:undefined} title={logo.project||logo.name}
   onClick={activate} style={{'--grain-x':`${index*47%100}%`,'--grain-y':`${index*31%100}%`}}>
   <span className="slab-surface" aria-hidden="true"><span className="slab-rotor">
    <span className="slab-face slab-front"><span className="slab-logo"><BrandMark image={logo.image} name={logo.name}/></span></span>
    <span className="slab-face slab-back"><span className="slab-back-logo"><BrandMark image={logo.image} name={logo.name}/></span><span className="slab-project">{projectTail?<>{projectTail[1]}<span className="project-tail">{projectTail[2]}</span></>:project}</span><span className="slab-read">閱讀合作案例<SiteArrow/></span></span>
    <span className="slab-edge slab-edge-left"/><span className="slab-edge slab-edge-right"/><span className="slab-edge slab-edge-top"/><span className="slab-edge slab-edge-bottom"/>
   </span></span>
   <span className="site-brand-caption"><span className="brand-caption-name">{logo.name.split(/([A-Za-z0-9][A-Za-z0-9.&-]*)/g).map((part,i)=>/^[A-Za-z0-9]/.test(part)?<span key={i}>{part}</span>:part)}</span><SiteArrow/></span>
  </Tag>
 </article>
}

export default function LogoWall({standalone=false}){
 return <section className={`site-brand-wall material-wall folio-gutter ${standalone?'standalone':''}`} id="brands" style={{'--slab-texture':`url("${slabTexture}")`}}>
  <div className="folio-section-heading"><h2>與不同品牌，<br/>共同完成值得<span style={{whiteSpace:'nowrap'}}>留下的作品。</span></h2><p>企業委製、品牌合作與授權設計案例。</p></div>
  <div className="site-logo-grid">{ordered.map((logo,index)=><BrandSlab logo={logo} index={index} key={logo.id}/>)}</div>
  <div className="site-brand-bottom"><p>依各專案的委製與合作關係展示；HOLA 授權設計、代理委製等資訊詳見案例說明。</p><a className="folio-link" href="#/explore/cases">探索全部合作案例<SiteArrow/></a></div>
 </section>
}

