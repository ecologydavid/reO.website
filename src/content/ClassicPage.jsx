import React from 'react';
import {small,half} from '../components/site/responsive.js';
import {Button,ActionIcon,studioTab} from '../components/site/ui.jsx';
import {classicNames} from '../components/site/classics.js';
import {prices} from './landings.jsx';
import {keepRanges} from './arrange.js';
import './classic-page.css';
// v1.7.0 (owner, 2026-11-27): the five classic model pages (A to E) are designed pages, no longer the migrated
// article. The home hero cards and the home Classic photos open these pages; the plaque studio is entered from
// here, through one clear button.
//
// Where the words live: each model's page JSON (public/content/pages).
//   summary                    the short concept (簡述): opening line, list summary, description
//   sections 設計概念 paragraphs  the full concept (詳述). A paragraph equal to the summary is not repeated;
//                              「名稱」：說明 lines become a named list; a line in “…” is set as a quotation
//   sections 商品參數 paragraphs  one row each, written 「項目：內容」 (labels of at most five characters, so the
//                              value keeps its width on phones); `items` are notes under the table
//   images[].kind 'drawing'    the dimension drawing shown beside the table
// The ordering steps and the notes are the same for every model and live here.
//
// One way of writing (keep it when the text changes): a half-width space between Chinese and Latin letters or
// figures (ABS 雙色板, 高 28 cm); sizes as 長 × 寬 × 高 with the unit once at the end; full-width 、／＋（） in Chinese
// text; steps numbered 01 02 03 and notes 1 2 3 4 by the page itself. No circled or boxed figures (❶ Ⓐ …):
// they are hard to read and to type (owner). A figure never parts from its unit at a line end (`keep`).
const mail='service@re-o.co',phone='+886-2-8966-5369';
const steps=[
 {title:'提供資料',text:<>此商品為客製化服務，請來信 <a href={`mailto:${mail}`}>{mail}</a> 或來電 <a href={`tel:${phone}`}>{phone}</a>，提供以下資料：</>,items:['LOGO 圖檔（AI 檔）','獎盃上的文字內容']},
 {title:'確認報價與付款',text:'確認款式、數量與交期後報價，付款後我們將為您繪製設計圖。設計提供 3 次校稿，超額另需費用。'},
 {title:'手工生產',text:'製作時程依據當時訂單累積數量而定，3～10 個工作天完成。'}
];
const notes=['不含拍攝用所有道具。','皆為手工開製模製作而成，會有模線與手工研磨的高低落差，手工非機器，如無法接受，請勿訂購。','非食材器皿，請勿盛裝無包裝之食品。','運送途中如遇嚴重瑕疵或損壞，請保留完整包裝於七日內更換同款商品。'];
// "長 5.5 × 寬 5.5 × 高 28 cm": each measure stays whole, a line may only turn at a ×.
const keep=text=>text.split(/( × )/).map((part,i)=>part===' × '?' × ':<span className="cp-keep" key={i}>{part}</span>);
const ratioOf=im=>im.width/im.height;
const finish=/^「([^」]{1,10})」：(.+)$/,quoted=/^[“"](.+)[”"]$/;

export function arrangeClassic(page){
 const find=heading=>page.sections.find(s=>s.heading===heading),spec=find('商品參數');
 const concept=(find('設計概念')?.paragraphs||[]).filter(p=>p!==page.summary);
 const rows=(spec?.paragraphs||[]).map(p=>{const at=p.indexOf('：');return [p.slice(0,at),p.slice(at+1)]});
 const others=page.images.filter(im=>im.src!==page.hero?.src),drawing=others.find(im=>im.kind==='drawing');
 const beside=others.find(im=>im!==drawing&&ratioOf(im)<=1.8);
 return {concept,rows,notes:spec?.items||[],drawing,beside,photos:others.filter(im=>im!==drawing&&im!==beside)};
}
function Photo({image,onOpen,eager}){
 return <button className="content-photo" style={{aspectRatio:String(ratioOf(image))}} onClick={()=>onOpen(image)} aria-label={`放大圖片：${image.alt}`}><img src={image.src} {...small(image,half)} alt={image.alt} width={image.width} height={image.height} loading={eager?undefined:'lazy'} fetchPriority={eager?'high':undefined}/></button>;
}
function Head({en,children}){return <header className="cp-head"><h2>{children}</h2><p lang="en" aria-hidden="true">{en}</p></header>}
// The full concept: plain paragraphs, the named finishes as a list, a quotation.
function Concept({paragraphs}){
 const out=[];
 paragraphs.forEach((p,i)=>{
  const named=p.match(finish),quote=p.match(quoted),last=out[out.length-1];
  if(named){if(last?.list)last.list.push(named);else out.push({list:[named],key:i})}
  else out.push({text:quote?quote[1]:p,quote:Boolean(quote),key:i});
 });
 return out.map(b=>b.list?<dl className="cp-finishes" key={b.key}>{b.list.map(([,name,text])=><div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>:b.quote?<blockquote lang="en" key={b.key}>{b.text}</blockquote>:<p key={b.key}>{b.text}</p>);
}
function StudioButton({id}){return <Button href={`#/preview/${id}`} {...studioTab} variant="dark" className="cp-studio" icon={<ActionIcon name="studio"/>}>以 {id} 款進入銘版排版工作室<span className="sr-only">（另開新視窗）</span></Button>}

export default function ClassicPage({page,id,data,onOpen}){
 const name=classicNames[id],[,series]=page.title.split('｜'),options=prices.find(p=>p[0]===id)?.[1]||[];
 const height=data.rows.find(r=>r[0]==='尺寸')?.[1].match(/高\s*([\d.]+)\s*(\w+)/);
 return <article className="cp">
  <header className="cp-top">
   <div className="cp-title">
    <p className="cp-kicker"><span lang="en">Classic</span>公版獎盃</p>
    <h1><span className="cp-name" lang="en"><b>{id}</b>{name.slice(1)}</span><em>{id} 款公版{id==='C'?'獎牌':'獎盃'}{series&&<>｜{series}</>}</em></h1>
   </div>
   {page.hero&&<figure className="cp-hero"><Photo image={page.hero} onOpen={onOpen} eager/></figure>}
   <div className="cp-lead">
    <p className="cp-brief">{page.summary}</p>
    <dl className="cp-rows">
     <div><dt>價格</dt><dd>{options.map(([label,n],i)=><span className="cp-keep" key={i}>{label&&`${label} `}NT$ {n.toLocaleString('en-US')}{i<options.length-1&&'／'}</span>)}</dd></div>
     {height&&<div><dt>高度</dt><dd>{height[1]} {height[2]}</dd></div>}
     <div><dt>製作</dt><dd>3 個工作天起<small>10 座以上工期另計</small></dd></div>
     {page.metadata?.designer&&<div><dt>合作設計師</dt><dd>{page.metadata.designer}</dd></div>}
    </dl>
    <div className="cp-actions"><StudioButton id={id}/><Button href={`mailto:${mail}`} variant="ghost" icon={<ActionIcon name="mail"/>}>寄信洽詢</Button></div>
    <p className="cp-hint">在銘版排版工作室編排文字與 LOGO，完成後可下載 PDF 與 EPS 檔。</p>
   </div>
  </header>

  {!!data.concept.length&&<section className="cp-pair is-concept" aria-labelledby="cp-concept" data-reveal>
   {data.beside&&<figure><Photo image={data.beside} onOpen={onOpen}/></figure>}
   <div className="cp-body"><Head en="Concept"><span id="cp-concept">設計概念</span></Head><div className="cp-text"><Concept paragraphs={data.concept}/></div></div>
  </section>}

  {!!data.rows.length&&<section className="cp-pair is-specs" aria-labelledby="cp-specs" data-reveal>
   <div className="cp-body"><Head en="Specification"><span id="cp-specs">商品參數</span></Head>
    <dl className="cp-rows">{data.rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{label==='材質'?<ul>{value.split('、').map(v=><li key={v}>{v}</li>)}</ul>:/ × /.test(value)?keep(value):value}</dd></div>)}</dl>
    {data.notes.map(n=><p className="cp-note" key={n}>{n}{id==='A'&&<> <a href="#/read/pages/wooden-beam">認識木橫擔</a></>}</p>)}
   </div>
   {data.drawing&&<figure className="cp-drawing"><Photo image={data.drawing} onOpen={onOpen}/><figcaption>左：外觀尺寸。右：紅色區域為可客製範圍。</figcaption></figure>}
  </section>}
 </article>;
}

// The part every model shares, shown after the photos: how to order, what to know, and the way into the studio.
export function ClassicOrder({id}){
 return <div className="cp">
  <section className="cp-block" aria-labelledby="cp-order" data-reveal>
   <Head en="How to order"><span id="cp-order">訂製步驟</span></Head>
   <ol className="cp-steps">{steps.map((s,i)=><li key={s.title}><span className="cp-num" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h3>{s.title}</h3><p>{keepRanges(s.text)}</p>{s.items&&<ul>{s.items.map(item=><li key={item}>{item}</li>)}</ul>}</li>)}</ol>
  </section>
  <section className="cp-block" aria-labelledby="cp-notes" data-reveal>
   <Head en="Notes"><span id="cp-notes">注意事項</span></Head>
   <ol className="cp-notes">{notes.map(n=><li key={n}>{n}</li>)}</ol>
   <p className="cp-made" lang="en">Made in Taiwan</p>
  </section>
  <aside className="cp-cta" aria-label="銘版排版工作室" data-reveal>
   <p>選擇這款公版獎盃，<wbr/>編排你的專屬文字與圖案。</p>
   <div className="cp-actions"><StudioButton id={id}/><Button href={`mailto:${mail}`} variant="ghost" icon={<ActionIcon name="mail"/>}>寄信洽詢</Button><Button href={`tel:${phone}`} variant="ghost" icon={<ActionIcon name="phone"/>}>來電洽詢</Button></div>
  </aside>
 </div>;
}
