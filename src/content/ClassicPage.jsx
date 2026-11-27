import React,{useCallback,useEffect,useRef,useState} from 'react';
import {small,half,third} from '../components/site/responsive.js';
import {Button,ActionIcon,ArrowIcon,studioTab} from '../components/site/ui.jsx';
import {classicNames} from '../components/site/classics.js';
import {prices} from './landings.jsx';
import {keepRanges} from './arrange.js';
import './classic-page.css';
// The five classic model pages (A to E): designed pages, not the migrated article. The home hero cards and the home
// Classic photos open them; the plaque studio is entered from here through one clear button (v1.7.0, owner 2026-11-27).
// v1.9.0 (owner, third round the same day): too many colour blocks, hard on the eye, and it looked machine-made.
// The page is now set like a printed catalogue: white throughout, hairlines, generous space, one black button.
// No tinted cards, no large figures on blocks, no chips, no mark on the photos (a photo that only opens large needs
// none). What v1.8.0 settled stays: nothing is said twice (price and lead time with the name, the measures only in
// 商品規格), the specification has its pictures beside the words, the photos are one strip to move through.
//
// Where the words live: each model's page JSON (public/content/pages).
//   summary                    the short concept (簡述): opening line, list summary, description
//   sections 設計概念 paragraphs  the full concept (詳述), in short paragraphs. A paragraph equal to the summary is
//                              not repeated; a short first paragraph is set large; 「名稱」：說明 lines become a
//                              named list; a line in “…” is set as a quotation
//   sections 商品規格 paragraphs  one row each, written 「項目：內容」 (材質, 尺寸, 包裝, 包裝尺寸, 淨重); `items` are
//                              notes on the materials
//   images[].kind              'drawing' the dimension drawing beside the table, 'material' and 'package' the small
//                              photos in those rows; images[].caption a few words under a photo
// The ordering steps and the notes are the same for every model and live here.
//
// One way of writing (keep it when the text changes): a half-width space between Chinese and Latin letters or
// figures (ABS 雙色板, 高 28 cm); sizes as 長 × 寬 × 高 with the unit once at the end; full-width 、／＋（） in Chinese
// text; steps numbered 01 02 03 and notes 1 2 3 4 by the page itself. No circled or boxed figures (❶ Ⓐ …):
// they are hard to read and to type (owner). A figure never parts from its unit at a line end (`keep`).
const mail='service@re-o.co',phone='+886-2-8966-5369';
const steps=[
 {title:'提供資料',text:'此商品為客製化服務，請來信或來電，提供以下資料：',items:['LOGO 圖檔（AI 檔）','獎盃上的文字內容'],contact:true},
 {title:'確認報價與付款',text:'確認款式、數量與交期後報價，付款後我們將為您繪製設計圖。設計提供 3 次校稿，超額另需費用。'},
 {title:'手工生產',text:'製作時程依據當時訂單累積數量而定，3～10 個工作天完成。'}
];
// The four notes in the owner's words; the short heading only names what each is about.
const notes=[['拍攝道具','不含拍攝用所有道具。'],['手工製作','皆為手工開製模製作而成，會有模線與手工研磨的高低落差，手工非機器，如無法接受，請勿訂購。'],['非食材器皿','非食材器皿，請勿盛裝無包裝之食品。'],['運送與更換','運送途中如遇嚴重瑕疵或損壞，請保留完整包裝於七日內更換同款商品。']];
// The small photo that sits in a row of the specification table: the row's label → the photo's kind.
const rowPhoto={材質:'material',包裝:'package'};
// "長 5.5 × 寬 5.5 × 高 28 cm": each measure stays whole, a line may only turn at a ×.
const keep=text=>text.split(/( × )/).map((part,i)=>part===' × '?' × ':<span className="cp-keep" key={i}>{part}</span>);
const ratioOf=im=>im.width/im.height,pad=n=>String(n).padStart(2,'0');
const finish=/^「([^」]{1,10})」：(.+)$/,quoted=/^[“"](.+)[”"]$/;

export function arrangeClassic(page){
 const find=heading=>page.sections.find(s=>s.heading===heading),spec=find('商品規格');
 const concept=(find('設計概念')?.paragraphs||[]).filter(p=>p!==page.summary);
 const rows=(spec?.paragraphs||[]).map(p=>{const at=p.indexOf('：');return [p.slice(0,at),p.slice(at+1)]});
 const others=page.images.filter(im=>im.src!==page.hero?.src),of=kind=>others.find(im=>im.kind===kind);
 const table=rows.map(([label,value])=>({label,value,photo:rowPhoto[label]?of(rowPhoto[label]):undefined}));
 const beside=others.find(im=>!im.kind&&ratioOf(im)<=1.8);
 // The strip holds every photo of the piece: first the ones not shown elsewhere on the page, the opening photo last.
 const placed=[of('material'),of('package'),beside].filter(Boolean),free=others.filter(im=>im.kind!=='drawing'&&!placed.includes(im));
 return {concept,table,drawing:of('drawing'),notes:spec?.items||[],beside,gallery:[...free,...placed,...(page.hero?[page.hero]:[])]};
}
// Every photo opens large on a click; the cursor says so. No mark is laid over the picture (owner, v1.9.0).
// `ratio` frames a small photo to a fixed shape (the table's thumbnails); otherwise the frame is the photo's own.
function Photo({image,onOpen,eager,sizes=half,ratio}){
 return <button className="content-photo cp-photo" style={{aspectRatio:String(ratio||ratioOf(image))}} onClick={()=>onOpen(image)} aria-label={`放大圖片：${image.alt}`}><img src={image.src} {...small(image,sizes)} alt={image.alt} width={image.width} height={image.height} loading={eager?undefined:'lazy'} fetchPriority={eager?'high':undefined}/></button>;
}
// Block heading: a quiet English word over the Chinese heading.
function Head({en,id,children}){return <header className="cp-head"><p lang="en" aria-hidden="true">{en}</p><h2 id={id}>{children}</h2></header>}
// Short display lines (the opening line, the concept's first sentence) turn only where the sentence pauses: each
// clause holds together, so a line ends at punctuation. Paragraphs of running text are set justified instead (v1.9.0):
// straight edges on both sides read more easily than a ragged run of short lines. On phones the clauses flow freely.
const clauses=text=>text.match(/[^，。；：！？]+[，。；：！？」』）]*/g)||[text];
// A sentence with a clause too long for the column is left to flow: holding it together would strand its last words.
function Lines({text}){const parts=clauses(text);return parts.some(c=>c.length>24)?text:parts.map((c,i)=><span className="cp-clause" key={i}>{c}</span>)}
// The full concept: a short first paragraph set large, paragraphs, the named finishes as a list, a quotation.
function Concept({paragraphs}){
 const out=[];
 paragraphs.forEach((p,i)=>{
  const named=p.match(finish),quote=p.match(quoted),last=out[out.length-1];
  if(named){if(last?.list)last.list.push(named);else out.push({list:[named],key:i})}
  else out.push({text:quote?quote[1]:p,quote:Boolean(quote),lead:i===0&&p.length<=50,key:i});
 });
 return out.map(b=>b.list?<dl className="cp-finishes" key={b.key}>{b.list.map(([,name,text])=><div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>:b.quote?<blockquote lang="en" key={b.key}>{b.text}</blockquote>:<p className={b.lead?'cp-concept-lead':undefined} key={b.key}>{b.lead?<Lines text={b.text}/>:b.text}</p>);
}
function StudioButton({id,variant='dark'}){return <Button href={`#/preview/${id}`} {...studioTab} variant={variant} className="cp-studio" icon={<ActionIcon name="studio"/>}>以 {id} 款進入銘版排版工作室<span className="sr-only">（另開新視窗）</span></Button>}

// The photos as one strip to move through: arrows, a mouse drag, a swipe or the keyboard. Each slide keeps its own
// shape at one height and carries its number and a few words; any slide opens large.
function ClassicGallery({photos,onOpen}){
 const track=useRef(null),drag=useRef(null),[at,setAt]=useState(0),n=photos.length;
 const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 // One step = the next place the strip can actually rest: near its end several slides share the last position, so
 // stepping by slide number would leave the back arrow stuck there.
 const go=useCallback(dir=>{const el=track.current;if(!el)return;const first=el.children[0].offsetLeft,max=el.scrollWidth-el.clientWidth,x=el.scrollLeft,stops=[...el.children].map(c=>Math.min(c.offsetLeft-first,max));const to=dir>0?stops.find(s=>s>x+2):stops.reverse().find(s=>s<x-2);if(to!==undefined)el.scrollTo({left:to,behavior:still()?'auto':'smooth'})},[]);
 const read=useCallback(()=>{const el=track.current;if(!el)return;const first=el.children[0].offsetLeft,x=el.scrollLeft;if(x>=el.scrollWidth-el.clientWidth-2){setAt(n-1);return}let best=0,gap=Infinity;[...el.children].forEach((c,i)=>{const d=Math.abs(c.offsetLeft-first-x);if(d<gap){gap=d;best=i}});setAt(best)},[n]);
 useEffect(()=>{const el=track.current;let frame=0;const on=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(read)};el.addEventListener('scroll',on,{passive:true});return()=>{el.removeEventListener('scroll',on);cancelAnimationFrame(frame)}},[read]);
 // Mouse drag (touch scrolls by itself). A drag is not a click.
 const down=e=>{if(e.pointerType!=='mouse'||e.button)return;drag.current={x:e.clientX,left:track.current.scrollLeft,moved:false}};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x;if(Math.abs(dx)>6&&!d.moved){d.moved=true;track.current.classList.add('is-dragging')}if(d.moved)track.current.scrollLeft=d.left-dx};
 const up=()=>{const d=drag.current;if(!d)return;drag.current=null;const el=track.current;if(d.moved){el.classList.remove('is-dragging');el.dataset.dragged='1';setTimeout(()=>{delete el.dataset.dragged},0);read()}};
 const open=image=>{if(!track.current.dataset.dragged)onOpen(image)};
 return <section className="cp-gallery" aria-labelledby="cp-gallery-title" data-reveal>
  <div className="cp-gallery-top">
   <Head en="Gallery" id="cp-gallery-title">作品照片</Head>
   <div className="cp-gallery-tools"><p className="cp-count" aria-hidden="true"><b>{pad(at+1)}</b><i/>{pad(n)}</p><button type="button" className="cp-arrow is-prev" onClick={()=>go(-1)} disabled={at===0} aria-label="上一張照片"><ArrowIcon/></button><button type="button" className="cp-arrow" onClick={()=>go(1)} disabled={at===n-1} aria-label="下一張照片"><ArrowIcon/></button></div>
  </div>
  <ul className="cp-track" ref={track} tabIndex={0} aria-label="作品照片，可左右捲動" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
   {photos.map((im,i)=><li key={im.src}><button type="button" style={{aspectRatio:String(ratioOf(im))}} onClick={()=>open(im)} aria-label={`放大圖片：${im.alt}`}><img src={im.src} {...small(im,half)} alt={im.alt} width={im.width} height={im.height} loading="lazy" draggable="false"/></button><p><b>{pad(i+1)}</b>{im.caption}</p></li>)}
  </ul>
  <span className="cp-progress" aria-hidden="true"><i style={{transform:`scaleX(${(at+1)/n})`}}/></span>
 </section>;
}

export default function ClassicPage({page,id,data,onOpen}){
 const name=classicNames[id],[,series]=page.title.split('｜'),options=prices.find(p=>p[0]===id)?.[1]||[];
 return <article className="cp">
  <header className="cp-top">
   <div className="cp-title">
    <p className="cp-kicker"><span lang="en">Classic</span>公版獎盃</p>
    <h1><span className="cp-name" lang="en"><b>{id}</b>{name.slice(1)}</span><em>{id} 款公版{id==='C'?'獎牌':'獎盃'}{series&&<>｜{series}</>}</em></h1>
   </div>
   {page.hero&&<figure className="cp-hero"><Photo image={page.hero} onOpen={onOpen} eager/>{page.hero.caption&&<figcaption>{page.hero.caption}</figcaption>}</figure>}
   <div className="cp-lead">
    <p className="cp-brief"><Lines text={page.summary}/></p>
    {/* Price and lead time are said here and nowhere else on the page; the measures are in 商品規格. */}
    <dl className="cp-buy">
     <div><dt>價格</dt><dd>{options.map(([label,n],i)=><span className="cp-price" key={i}><b>NT$ {n.toLocaleString('en-US')}</b>{label&&<i>{label}</i>}</span>)}</dd></div>
     <div><dt>製作</dt><dd><span className="cp-price"><b>3 個工作天起</b><i>10 座以上工期另計</i></span></dd></div>
     {page.metadata?.designer&&<div><dt>合作設計師</dt><dd><span className="cp-price"><b>{page.metadata.designer}</b></span></dd></div>}
    </dl>
    <div className="cp-actions"><StudioButton id={id}/><Button href={`mailto:${mail}`} variant="ghost" icon={<ActionIcon name="mail"/>}>寄信洽詢</Button></div>
    <p className="cp-hint">在銘版排版工作室編排文字與 LOGO，完成後可下載 PDF 與 EPS 檔。</p>
   </div>
  </header>

  {!!data.concept.length&&<section className={`cp-concept${data.beside?'':' is-text'}`} aria-labelledby="cp-concept" data-reveal>
   {data.beside&&<figure><Photo image={data.beside} onOpen={onOpen}/>{data.beside.caption&&<figcaption>{data.beside.caption}</figcaption>}</figure>}
   <div className="cp-body"><Head en="Concept" id="cp-concept">設計概念</Head><div className="cp-text"><Concept paragraphs={data.concept}/></div></div>
  </section>}

  {!!data.table.length&&<section className="cp-specs" aria-labelledby="cp-specs" data-reveal>
   <div className="cp-body">
    <Head en="Specification" id="cp-specs">商品規格</Head>
    <dl className="cp-table">{data.table.map(({label,value,photo})=><div key={label} className={photo?'has-photo':undefined}>
     <dt>{label}</dt>
     <dd>{label==='材質'?<ul>{value.split('、').map(v=><li key={v}>{v}</li>)}</ul>:/ × /.test(value)?keep(value):value}</dd>
     {photo&&<Photo image={photo} onOpen={onOpen} sizes={third} ratio={4/3}/>}
    </div>)}</dl>
    {data.notes.map(n=><p className="cp-note" key={n}>{n}{id==='A'&&<> <a href="#/read/pages/wooden-beam">認識木橫擔</a></>}</p>)}
   </div>
   {data.drawing&&<figure className="cp-drawing"><Photo image={data.drawing} onOpen={onOpen}/><figcaption>左：外觀尺寸。右：紅色區域為可客製範圍。</figcaption></figure>}
  </section>}

  {data.gallery.length>1&&<ClassicGallery photos={data.gallery} onOpen={onOpen}/>}

  <section className="cp-rail" aria-labelledby="cp-order" data-reveal>
   <Head en="How to order" id="cp-order">訂製步驟</Head>
   <ol className="cp-steps">{steps.map((s,i)=><li key={s.title}><span className="cp-num" aria-hidden="true">{pad(i+1)}</span><h3>{s.title}</h3><p>{keepRanges(s.text)}</p>{s.items&&<ul>{s.items.map(item=><li key={item}>{item}</li>)}</ul>}{s.contact&&<p className="cp-contact"><a href={`mailto:${mail}`}>{mail}</a><a href={`tel:${phone}`}>{phone}</a></p>}</li>)}</ol>
  </section>

  <section className="cp-rail" aria-labelledby="cp-notes" data-reveal>
   <Head en="Notes" id="cp-notes">注意事項</Head>
   <div><ol className="cp-notes">{notes.map(([title,text],i)=><li key={title}><span className="cp-num" aria-hidden="true">{pad(i+1)}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><p className="cp-made" lang="en">Made in Taiwan</p></div>
  </section>

  <aside className="cp-cta" aria-label="銘版排版工作室" data-reveal>
   <p>選擇這款公版獎盃，<wbr/>編排你的專屬文字與圖案。</p>
   <div className="cp-actions"><StudioButton id={id}/><Button href={`mailto:${mail}`} variant="ghost" icon={<ActionIcon name="mail"/>}>寄信洽詢</Button><Button href={`tel:${phone}`} variant="ghost" icon={<ActionIcon name="phone"/>}>來電洽詢</Button></div>
  </aside>
 </article>;
}
