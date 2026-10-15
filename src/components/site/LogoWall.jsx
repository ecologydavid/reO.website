import React,{useState} from 'react';
import logos from '../../data/logo-wall.json';
import {SiteArrow} from './SiteHeader.jsx';
import BrandMark from './BrandMark.jsx';
const priority=['ase','delta','pwc','pinkoi','fubon','hola','disney','tmall','taipower','iii'];
const ordered=[...logos].sort((a,b)=>{const x=priority.indexOf(a.id),y=priority.indexOf(b.id);return (x<0?99:x)-(y<0?99:y)});
export default function LogoWall({standalone=false}){
 const [note,setNote]=useState(null);
 return <section className={`site-brand-wall folio-gutter ${standalone?'standalone':''}`} id="brands"><div className="folio-section-heading"><h2>與不同品牌，<br/>共同完成值得<span style={{whiteSpace:'nowrap'}}>留下的作品。</span></h2><p>企業委製、品牌合作與授權設計案例。</p></div><div className="site-logo-grid">{ordered.map(l=><div className="site-logo-cell" key={l.id}>{l.href?<a href={l.href} aria-label={`閱讀 ${l.name} 合作案例`}><BrandMark image={l.image} name={l.name}/><span>{l.name}</span></a>:<button onClick={()=>setNote(note===l.id?null:l.id)} aria-expanded={note===l.id} aria-label={`查看 ${l.name} 合作資訊`}><BrandMark image={l.image} name={l.name}/><span>{l.name}</span></button>}{note===l.id&&<p className="site-logo-note">{l.display_note||l.project||'具名製作與合作案例品牌'}</p>}</div>)}</div><div className="site-brand-bottom"><p>依各專案的委製與合作關係展示；HOLA 授權設計、代理委製等資訊詳見案例說明。</p><a className="folio-link" href="#/explore/cases">探索全部合作案例<SiteArrow/></a></div></section>
}

