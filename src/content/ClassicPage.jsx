import React,{useCallback,useEffect,useRef,useState} from 'react';
import {small,half,third} from '../components/site/responsive.js';
import {Button,ActionIcon,ArrowIcon,studioTab} from '../components/site/ui.jsx';
import {classicNames} from '../components/site/classics.js';
import {prices} from './landings.jsx';
import {keepRanges} from './arrange.js';
import './classic-page.css';
// v1.7.0 (owner, 2026-11-27): the five classic model pages (A to E) are designed pages, no longer the migrated
// article. The home hero cards and the home Classic photos open these pages; the plaque studio is entered from
// here, through one clear button.
// v1.8.0 (owner, same day, second round): nothing is said twice (price and lead time sit with the name, the
// measures only in 商品規格); every part of the specification has its picture beside the words; the concept is set
// in lines that turn at the punctuation; the steps and the notes are colour cards; the photos are one strip to
// move through (ClassicGallery), not a wall of pictures.
//
// Where the words live: each model's page JSON (public/content/pages).
//   summary                    the short concept (簡述): opening line, list summary, description
//   sections 設計概念 paragraphs  the full concept (詳述), in short paragraphs. A paragraph equal to the summary is
//                              not repeated; a short first paragraph is set large; 「名稱」：說明 lines become a
//                              named list; a line in “…” is set as a quotation
//   sections 商品規格 paragraphs  one row each, written 「項目：內容」 (材質, 尺寸, 包裝, 包裝尺寸, 淨重); `items` are
//                              notes on the materials
//   images[].kind              'drawing' the dimension drawing, 'material' and 'package' the photos shown beside
//                              those parts of the specification; images[].caption a few words under the photo
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
// The four notes in the owner's words; the two-to-four character heading only names what each is about.
const notes=[['拍攝道具','不含拍攝用所有道具。'],['手工製作','皆為手工開製模製作而成，會有模線與手工研磨的高低落差，手工非機器，如無法接受，請勿訂購。'],['非食材器皿','非食材器皿，請勿盛裝無包裝之食品。'],['運送與更換','運送途中如遇嚴重瑕疵或損壞，請保留完整包裝於七日內更換同款商品。']];
// The specification in three parts, each beside its picture. A row the data adds later joins the first part.
const parts=[{title:'尺寸與重量',en:'Size',rows:['尺寸','淨重'],kind:'drawing'},{title:'材質',en:'Material',rows:['材質'],kind:'material'},{title:'包裝',en:'Package',rows:['包裝','包裝尺寸'],kind:'package'}];
// A soft tint of each model's own material for the colour blocks: cypress, heat-treated wood, wood on white stone,
// grey-green stone, anodised aluminium. Decoration only.
const tints={A:['#f4ecda','#e9dcbd'],B:['#f2e6d9','#e5d0ba'],C:['#f0eae2','#dfd5c8'],D:['#e8ebe5','#d2d9cf'],E:['#eeedea','#dbd8d1']};
// "長 5.5 × 寬 5.5 × 高 28 cm": each measure stays whole, a line may only turn at a ×.
const keep=text=>text.split(/( × )/).map((part,i)=>part===' × '?' × ':<span className="cp-keep" key={i}>{part}</span>);
const ratioOf=im=>im.width/im.height,pad=n=>String(n).padStart(2,'0');
const finish=/^「([^」]{1,10})」：(.+)$/,quoted=/^[“"](.+)[”"]$/;

export function arrangeClassic(page){
 const find=heading=>page.sections.find(s=>s.heading===heading),spec=find('商品規格');
 const concept=(find('設計概念')?.paragraphs||[]).filter(p=>p!==page.summary);
 const rows=(spec?.paragraphs||[]).map(p=>{const at=p.indexOf('：');return [p.slice(0,at),p.slice(at+1)]});
 const others=page.images.filter(im=>im.src!==page.hero?.src),of=kind=>others.find(im=>im.kind===kind);
 const named=parts.flatMap(p=>p.rows),loose=rows.filter(r=>!named.includes(r[0]));
 const groups=parts.map((p,i)=>({...p,rows:[...rows.filter(r=>p.rows.includes(r[0])),...(i?[]:loose)],image:of(p.kind)})).filter(g=>g.rows.length);
 const beside=others.find(im=>!im.kind&&ratioOf(im)<=1.8);
 // The strip holds every photo of the piece: first the ones not shown elsewhere on the page, the opening photo last.
 const placed=[of('material'),of('package'),beside].filter(Boolean),free=others.filter(im=>im.kind!=='drawing'&&!placed.includes(im));
 return {concept,groups,notes:spec?.items||[],beside,gallery:[...free,...placed,...(page.hero?[page.hero]:[])]};
}
// Every photo opens large; the small corner mark says so before it is pointed at.
function Photo({image,onOpen,eager,sizes=half}){
 return <button className="content-photo cp-photo" style={{aspectRatio:String(ratioOf(image))}} onClick={()=>onOpen(image)} aria-label={`放大圖片：${image.alt}`}><img src={image.src} {...small(image,sizes)} alt={image.alt} width={image.width} height={image.height} loading={eager?undefined:'lazy'} fetchPriority={eager?'high':undefined}/><span className="cp-zoom" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg></span></button>;
}
function Head({en,id,children,light}){return <header className={`cp-head${light?' is-light':''}`}><h2 id={id}>{children}</h2><p lang="en" aria-hidden="true">{en}</p></header>}
// Running text turns only where the sentence pauses: each clause (up to its 、，。；： mark) holds together, so a line
// ends at punctuation and never one character into the next clause. A clause longer than the line still wraps.
const clauses=text=>text.match(/[^，。；：！？]+[，。；：！？」』）]*/g)||[text];
function Lines({text}){return clauses(text).map((c,i)=><span className="cp-clause" key={i}>{c}</span>)}
// The full concept: a short first paragraph set large, paragraphs, the named finishes as a list, a quotation.
function Concept({paragraphs}){
 const out=[];
 paragraphs.forEach((p,i)=>{
  const named=p.match(finish),quote=p.match(quoted),last=out[out.length-1];
  if(named){if(last?.list)last.list.push(named);else out.push({list:[named],key:i})}
  else out.push({text:quote?quote[1]:p,quote:Boolean(quote),lead:i===0&&p.length<=50,key:i});
 });
 return out.map(b=>b.list?<dl className="cp-finishes" key={b.key}>{b.list.map(([,name,text])=><div key={name}><dt>{name}</dt><dd><Lines text={text}/></dd></div>)}</dl>:b.quote?<blockquote lang="en" key={b.key}>{b.text}</blockquote>:<p className={b.lead?'cp-concept-lead':undefined} key={b.key}><Lines text={b.text}/></p>);
}
function StudioButton({id,variant='dark'}){return <Button href={`#/preview/${id}`} {...studioTab} variant={variant} className="cp-studio" icon={<ActionIcon name="studio"/>}>以 {id} 款進入銘版排版工作室<span className="sr-only">（另開新視窗）</span></Button>}

// The photos as one strip: move it with the arrows, a drag, a swipe or the keyboard; the photo in front is named and
// counted, the others wait dimmed; the one in front opens large, any other comes forward when chosen.
function ClassicGallery({photos,onOpen}){
 const track=useRef(null),drag=useRef(null),[at,setAt]=useState(0),n=photos.length;
 const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const go=useCallback(i=>{const el=track.current,slide=el?.children[Math.max(0,Math.min(n-1,i))];if(slide)el.scrollTo({left:slide.offsetLeft-el.children[0].offsetLeft,behavior:still()?'auto':'smooth'})},[n]);
 const read=useCallback(()=>{const el=track.current;if(!el)return;const first=el.children[0].offsetLeft,x=el.scrollLeft;if(x>=el.scrollWidth-el.clientWidth-2){setAt(n-1);return}let best=0,gap=Infinity;[...el.children].forEach((c,i)=>{const d=Math.abs(c.offsetLeft-first-x);if(d<gap){gap=d;best=i}});setAt(best)},[n]);
 useEffect(()=>{const el=track.current;let frame=0;const on=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(read)};el.addEventListener('scroll',on,{passive:true});return()=>{el.removeEventListener('scroll',on);cancelAnimationFrame(frame)}},[read]);
 // Mouse drag (touch scrolls by itself). A drag is not a click.
 const down=e=>{if(e.pointerType!=='mouse'||e.button)return;drag.current={x:e.clientX,left:track.current.scrollLeft,moved:false}};
 const move=e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x;if(Math.abs(dx)>6&&!d.moved){d.moved=true;track.current.classList.add('is-dragging')}if(d.moved)track.current.scrollLeft=d.left-dx};
 const up=()=>{const d=drag.current;if(!d)return;drag.current=null;const el=track.current;if(d.moved){el.classList.remove('is-dragging');el.dataset.dragged='1';setTimeout(()=>{delete el.dataset.dragged},0);read()}};
 const pick=(i,image)=>{if(track.current.dataset.dragged)return;if(i===at)onOpen(image);else go(i)};
 return <section className="cp-gallery" aria-labelledby="cp-gallery-title" data-reveal>
  <div className="cp-gallery-top">
   <Head en="Gallery" id="cp-gallery-title" light>作品照片</Head>
   <div className="cp-gallery-tools"><p className="cp-count" aria-hidden="true"><b>{pad(at+1)}</b>/ {pad(n)}</p><button type="button" className="cp-arrow is-prev" onClick={()=>go(at-1)} disabled={at===0} aria-label="上一張照片"><ArrowIcon/></button><button type="button" className="cp-arrow" onClick={()=>go(at+1)} disabled={at===n-1} aria-label="下一張照片"><ArrowIcon/></button></div>
  </div>
  <ul className="cp-track" ref={track} tabIndex={0} aria-label="作品照片，可左右捲動" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
   {photos.map((im,i)=><li key={im.src} className={i===at?'is-on':undefined} style={{aspectRatio:String(ratioOf(im))}}><button type="button" onClick={()=>pick(i,im)} aria-label={i===at?`放大圖片：${im.alt}`:`第 ${i+1} 張：${im.alt}`}><img src={im.src} {...small(im,half)} alt={im.alt} width={im.width} height={im.height} loading="lazy" draggable="false"/></button></li>)}
  </ul>
  <div className="cp-gallery-foot"><span className="cp-progress" aria-hidden="true"><i style={{transform:`scaleX(${(at+1)/n})`}}/></span><p aria-live="polite"><b>{pad(at+1)}</b>{photos[at].caption||photos[at].alt}</p></div>
 </section>;
}

export default function ClassicPage({page,id,data,onOpen}){
 const name=classicNames[id],[,series]=page.title.split('｜'),options=prices.find(p=>p[0]===id)?.[1]||[],[tint,tint2]=tints[id]||tints.E;
 return <article className="cp" style={{'--cp-tint':tint,'--cp-tint-2':tint2}}>
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

  {!!data.groups.length&&<section className="cp-specs" aria-labelledby="cp-specs" data-reveal>
   <Head en="Specification" id="cp-specs">商品規格</Head>
   <div className="cp-spec-grid">{data.groups.map(g=><div className={`cp-spec is-${g.kind}${g.image?'':' is-plain'}`} key={g.kind}>
    {g.image&&<figure><Photo image={g.image} onOpen={onOpen} sizes={g.kind==='drawing'?half:third}/>{g.kind==='drawing'&&<figcaption>左：外觀尺寸。右：紅色區域為可客製範圍。</figcaption>}</figure>}
    <div className="cp-spec-text">
     <p className="cp-spec-name"><b>{g.title}</b><span lang="en" aria-hidden="true">{g.en}</span></p>
     <dl>{g.rows.map(([label,value])=><div key={label}><dt className={label===g.title?'sr-only':undefined}>{label}</dt><dd>{label==='材質'?<ul>{value.split('、').map(v=><li key={v}>{v}</li>)}</ul>:/ × /.test(value)?keep(value):value}</dd></div>)}</dl>
     {g.kind==='material'&&data.notes.map(n=><p className="cp-note" key={n}>{n}{id==='A'&&<> <a href="#/read/pages/wooden-beam">認識木橫擔</a></>}</p>)}
    </div>
   </div>)}</div>
  </section>}

  {data.gallery.length>1&&<ClassicGallery photos={data.gallery} onOpen={onOpen}/>}

  <section className="cp-block" aria-labelledby="cp-order" data-reveal>
   <Head en="How to order" id="cp-order">訂製步驟</Head>
   <ol className="cp-steps">{steps.map((s,i)=><li key={s.title}><span className="cp-num" aria-hidden="true">{pad(i+1)}</span><h3>{s.title}</h3><p>{keepRanges(s.text)}</p>{s.items&&<ul>{s.items.map(item=><li key={item}>{item}</li>)}</ul>}{i<steps.length-1&&<span className="cp-next" aria-hidden="true"><ArrowIcon/></span>}</li>)}</ol>
  </section>

  <section className="cp-block cp-care" aria-labelledby="cp-notes" data-reveal>
   <div className="cp-care-head"><Head en="Notes" id="cp-notes">注意事項</Head><p className="cp-made" lang="en">Made in Taiwan</p></div>
   <ol className="cp-notes">{notes.map(([title,text],i)=><li key={title}><span className="cp-note-num" aria-hidden="true">{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
  </section>

  <aside className="cp-cta" aria-label="銘版排版工作室" data-reveal>
   <p>選擇這款公版獎盃，<wbr/>編排你的專屬文字與圖案。</p>
   <div className="cp-actions"><StudioButton id={id}/><Button href={`mailto:${mail}`} variant="ghost" icon={<ActionIcon name="mail"/>}>寄信洽詢</Button><Button href={`tel:${phone}`} variant="ghost" icon={<ActionIcon name="phone"/>}>來電洽詢</Button></div>
  </aside>
 </article>;
}
