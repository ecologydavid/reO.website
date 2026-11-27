import React from 'react';
import {materials} from '../components/site/materials.js';
import {small,half,third} from '../components/site/responsive.js';
import {Held} from '../components/site/Statement.jsx';
import {notes} from './materialNotes.js';
import {photos} from './materialPhotos.js';
import './material-body.css';
// The reading part of a material page. v1.13.0 made it a reference entry (file, the studio's three steps, background
// with sources); the owner then found it read as text with the photographs set apart below. v1.14.0 (2026-11-28)
// sets words and photographs together, as a magazine would:
//   re.O 的＿＿    a large photograph beside the statement and the material file
//   從廢料到材料  the three steps under their round photographs (the studio's own words and pictures)
//   背景知識      one or two photographs in the heading's column, the questions and answers beside them
//   現場紀錄      further photographs in rows, with the owner's captions (only when there are at least two)
// Words live in materialNotes.js, photographs in materialPhotos.js. Every photograph opens large on a click.
const pad=n=>String(n).padStart(2,'0'),ratioOf=im=>im.width/im.height;
function Head({en,id,children}){return <header className="mb-head"><p lang="en" aria-hidden="true">{en}</p><h2 id={id}>{children}</h2></header>}
function Photo({image,onOpen,sizes=half,eager}){
 return <figure className="mb-photo"><button type="button" className="content-photo" style={{aspectRatio:String(ratioOf(image))}} onClick={()=>onOpen?.(image)} aria-label={`放大圖片：${image.alt}`}><img src={image.src} {...small(image,sizes)} alt={image.alt} width={image.width} height={image.height} loading={eager?undefined:'lazy'}/></button>{image.caption&&<figcaption>{image.caption}</figcaption>}</figure>;
}
// Rows of up to four photographs, each row justified: a photograph's share of the row is its own shape.
// Rows are balanced by shape, not by count: each row holds about the same sum of width-to-height ratios, so all
// rows come out at nearly the same height and fill the width.
const rowsOf=list=>{const total=list.reduce((a,im)=>a+ratioOf(im),0),count=Math.max(1,Math.round(total/3.4)),target=total/count,rows=[[]];let sum=0;
 list.forEach((im,i)=>{const r=ratioOf(im),left=list.length-i;if(rows.length<count&&rows.at(-1).length&&(sum+r/2>target||left<=count-rows.length)){rows.push([]);sum=0}rows.at(-1).push(im);sum+=r});return rows};
export const hasNotes=slug=>Boolean(notes[slug]);
export default function MaterialBody({slug,onOpen}){
 const n=notes[slug],m=materials.find(x=>x[2]===slug),p=photos[slug]||{};
 if(!n||!m)return null;
 const name=m[0],sources=[...new Map((n.facts||[]).flatMap(f=>f.sources||[]).map(s=>[s.url,s])).values()],ref=s=>sources.findIndex(x=>x.url===s.url)+1;
 const more=(p.more||[]).length>=2?p.more:[];
 return <div className="mb">
  <section className={`mb-lead${p.lead?'':' is-text'}`} aria-labelledby="mb-file" data-reveal>
   {p.lead&&<Photo image={p.lead} onOpen={onOpen}/>}
   <div className="mb-lead-text">
    <Head en="Material file" id="mb-file">re.O 的{name}</Head>
    <p className="mb-about"><Held text={n.about} max={20} hold="mb-hold"/></p>
    <dl className="mb-table">{n.file.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   </div>
  </section>

  <section className="mb-process" aria-labelledby="mb-steps" data-reveal>
   <div className="mb-process-top"><Head en="From waste to material" id="mb-steps">從廢料到材料</Head><p className="mb-by">以下三個步驟為 re.O 工作室的說明。</p></div>
   <ol className="mb-steps">{n.steps.map((s,i)=><li key={s.title}>
    <img src={`/assets/materials/${slug}-${i+1}.webp`} alt={`${name}：${s.title}，${s.sub}`} width="300" height="300" loading="lazy"/>
    <div><span className="mb-num" aria-hidden="true">{pad(i+1)}</span><h3>{s.title}<em>{s.sub}</em></h3><p>{s.text}</p></div>
   </li>)}</ol>
  </section>

  {!!n.facts?.length&&<section className="mb-know" aria-labelledby="mb-facts" data-reveal>
   <div className="mb-know-side"><Head en="Background" id="mb-facts">背景知識</Head>{(p.side||[]).map(im=><Photo image={im} onOpen={onOpen} sizes={third} key={im.src}/>)}</div>
   <div>
    <dl className="mb-facts">{n.facts.map((f,i)=><div key={f.q}>
     <dt><span aria-hidden="true">Q{i+1}</span>{f.q}</dt>
     <dd>{f.a.map((text,k)=><p key={k}>{text}{k===f.a.length-1&&(f.sources||[]).map(s=><sup key={s.url}><a href={`#mb-source-${ref(s)}`} aria-label={`資料來源 ${ref(s)}`}>{ref(s)}</a></sup>)}</p>)}</dd>
    </div>)}</dl>
    {!!sources.length&&<div className="mb-sources"><h3>資料來源</h3><ol>{sources.map((s,i)=><li key={s.url} id={`mb-source-${i+1}`}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>{s.year&&<span>{s.year}</span>}</li>)}</ol><p>背景知識整理自上列公開資料，數字以各來源標示的年度為準；與 re.O 的製程說明分開標示。</p></div>}
   </div>
  </section>}

  {!!more.length&&<section className="mb-more" aria-labelledby="mb-more" data-reveal>
   <Head en="On site" id="mb-more">現場紀錄</Head>
   <div className="mb-rows">{rowsOf(more).map((row,r)=><div className={`mb-row${row.reduce((a,im)=>a+ratioOf(im),0)<2.4?' is-short':''}`} key={r} style={{'--sum':row.reduce((a,im)=>a+ratioOf(im),0)}}>{row.map(im=><div key={im.src} style={{flex:`${ratioOf(im)} 1 0`}}><Photo image={im} onOpen={onOpen} sizes={third}/></div>)}</div>)}</div>
  </section>}
 </div>;
}
