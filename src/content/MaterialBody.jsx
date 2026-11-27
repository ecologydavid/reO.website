import React from 'react';
import {materials} from '../components/site/materials.js';
import {Held} from '../components/site/Statement.jsx';
import {notes} from './materialNotes.js';
import './material-body.css';
// The reading part of a material page (v1.13.0, owner 2026-11-28): after the opening the page used to go straight
// to photographs and felt empty. It now reads as a small reference entry on the material, in the white-and-hairline
// language of the classic model pages:
//   材料檔案      what it is, where it comes from, how re.O makes it and what it becomes (label and value rows)
//   從廢料到材料  the three steps in the studio's own words (they used to exist only as text inside a picture)
//   背景知識      questions and answers from public sources, each with its source and year
// All the words live in materialNotes.js; a material without an entry simply shows none of this.
const pad=n=>String(n).padStart(2,'0');
function Head({en,id,children}){return <header className="mb-head"><p lang="en" aria-hidden="true">{en}</p><h2 id={id}>{children}</h2></header>}
export const hasNotes=slug=>Boolean(notes[slug]);
export default function MaterialBody({slug}){
 const n=notes[slug],m=materials.find(x=>x[2]===slug);
 if(!n||!m)return null;
 const name=m[0],sources=[...new Map((n.facts||[]).flatMap(f=>f.sources||[]).map(s=>[s.url,s])).values()],ref=s=>sources.findIndex(x=>x.url===s.url)+1;
 return <div className="mb">
  <section className="mb-rail" aria-labelledby="mb-file">
   <Head en="Material file" id="mb-file">re.O 的{name}</Head>
   <div className="mb-file">
    <p className="mb-about"><Held text={n.about} max={26} hold="mb-hold"/></p>
    <dl className="mb-table">{n.file.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   </div>
  </section>

  <section className="mb-rail" aria-labelledby="mb-steps">
   <Head en="From waste to material" id="mb-steps">從廢料到材料</Head>
   <div>
    <ol className="mb-steps">{n.steps.map((s,i)=><li key={s.title}>
     <img src={`/assets/materials/${slug}-${i+1}.webp`} alt={`${name}：${s.title}，${s.sub}`} width="300" height="300" loading="lazy"/>
     <span className="mb-num" aria-hidden="true">{pad(i+1)}</span>
     <h3>{s.title}<em>{s.sub}</em></h3>
     <p>{s.text}</p>
    </li>)}</ol>
    <p className="mb-by">以上三個步驟為 re.O 工作室的說明。</p>
   </div>
  </section>

  {!!n.facts?.length&&<section className="mb-rail" aria-labelledby="mb-facts">
   <Head en="Background" id="mb-facts">背景知識</Head>
   <div>
    <dl className="mb-facts">{n.facts.map((f,i)=><div key={f.q}>
     <dt><span aria-hidden="true">Q{i+1}</span>{f.q}</dt>
     <dd>{f.a.map((p,k)=><p key={k}>{p}{k===f.a.length-1&&(f.sources||[]).map(s=><sup key={s.url}><a href={`#mb-source-${ref(s)}`} aria-label={`資料來源 ${ref(s)}`}>{ref(s)}</a></sup>)}</p>)}</dd>
    </div>)}</dl>
    {!!sources.length&&<div className="mb-sources"><h3>資料來源</h3><ol>{sources.map((s,i)=><li key={s.url} id={`mb-source-${i+1}`}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>{s.year&&<span>{s.year}</span>}</li>)}</ol><p>背景知識整理自上列公開資料，數字以各來源標示的年度為準；與 re.O 的製程說明分開標示。</p></div>}
   </div>
  </section>}
 </div>;
}
