// The case admin (/admin/, v75). The owner signs in, picks a case, edits it beside a live copy of the public page,
// and saves. Local dev writes the project files; the published site saves through admin-service (see api.js).
// Rules for what is saved live in model.mjs (tested); this file is the screens.
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {BrandLogo,Button} from '../components/site/ui.jsx';
import ContentReader from '../content/ContentReader.jsx';
import {arrangeArticle} from '../content/arrange.js';
import {findPage,isIndexPage} from '../content/catalogue.js';
import {navigate} from '../router.js';
import * as api from './api.js';
import {fromFile,copyOf,idFor} from './images.js';
import {groups,files,pageFile,groupOf,newDraft,toDraft,problems,buildChanges,shape,slugOf} from './model.mjs';
import '../components/home.css';
import '../content/content.css';
import './admin.css';

const loadData=async()=>{const [index,covers,details,cards]=await Promise.all([files.index,files.covers,files.details,files.cards].map(api.readJson));return {index,covers,details,cards}};
const latest=p=>Math.max(0,...(String(p.metadata?.year||'').match(/\d{4}/g)||[]).map(Number));
const casesOf=index=>index.pages.filter(p=>p.category==='cases'&&!isIndexPage(p)).sort((a,b)=>latest(b)-latest(a));
const groupName=id=>groups.find(g=>g[0]===id)?.[1]||id;
const flashKey='reo-admin-flash';
const putFlash=text=>{try{sessionStorage.setItem(flashKey,text)}catch{}};
const takeFlash=()=>{try{const t=sessionStorage.getItem(flashKey)||'';sessionStorage.removeItem(flashKey);return t}catch{return ''}};
// Read once when the page loads (React's development mode runs state initialisers twice, which would lose it).
const arrived=typeof sessionStorage==='undefined'?'':takeFlash();

// A photo that is not on the published site yet (saved a moment ago) is fetched through the back end instead.
function Photo({src,alt='',...rest}){
 const [url,setUrl]=useState(()=>api.assetUrl(src)),tried=useRef(false);
 useEffect(()=>{setUrl(api.assetUrl(src));tried.current=false},[src]);
 return <img src={url} alt={alt} loading="lazy" onError={()=>{if(tried.current)return;tried.current=true;api.loadPhoto(src).then(setUrl).catch(()=>{})}} {...rest}/>;
}

function SignIn({onDone,message}){
 const box=useRef(null),[error,setError]=useState(message||'');
 useEffect(()=>{
  let live=true;
  const start=()=>{
   if(!live||!window.google?.accounts?.id)return;
   window.google.accounts.id.initialize({client_id:api.clientId,callback:async r=>{api.setToken(r.credential);try{const who=await api.me();if(live)onDone(who)}catch(e){if(live)setError(e.message)}}});
   window.google.accounts.id.renderButton(box.current,{theme:'outline',size:'large',shape:'pill',text:'signin_with',locale:'zh_TW',width:280});
  };
  if(window.google?.accounts?.id)start();
  else{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=start;s.onerror=()=>setError('無法載入 Google 登入，請檢查網路後重新整理。');document.head.append(s)}
  return()=>{live=false};
 },[]);
 return <div className="adm-sign"><BrandLogo alt="re.O" size={84}/><h1>案例後台</h1><p>請用有編輯權限的 Google 帳號登入。</p><div ref={box} className="adm-sign-button"/>{error&&<p className="adm-error" role="alert">{error}</p>}<a className="adm-quiet" href="#/">回到網站</a></div>;
}

// After an online save the site rebuilds; this follows the build until it is live.
function BuildStatus(){
 const [state,setState]=useState(null);
 useEffect(()=>{let live=true,timer;const check=()=>api.status().then(s=>{if(!live)return;setState(s);if(s.status&&s.status!=='completed')timer=setTimeout(check,20000)}).catch(()=>{});timer=setTimeout(check,6000);return()=>{live=false;clearTimeout(timer)}},[]);
 if(!state?.status)return <span className="adm-build">網站更新中，約 3 至 5 分鐘後上線。</span>;
 if(state.status!=='completed')return <span className="adm-build is-running">網站更新中…</span>;
 return state.conclusion==='success'?<span className="adm-build is-done">已上線。</span>:<span className="adm-build is-failed">更新沒有成功，請通知維護人員。</span>;
}

function CaseList({data}){
 const all=useMemo(()=>casesOf(data.index),[data]),[tab,setTab]=useState('all'),[query,setQuery]=useState('');
 const tabs=[['all','全部'],...groups.map(g=>[g[0],g[1]]),['hidden','已隱藏']];
 const count=id=>id==='all'?all.length:id==='hidden'?all.filter(p=>p.hidden).length:all.filter(p=>!p.hidden&&groupOf(p)===id).length;
 const q=query.trim().toLowerCase();
 const shown=all.filter(p=>(tab==='all'||(tab==='hidden'?p.hidden:!p.hidden&&groupOf(p)===tab))&&(!q||[p.title,p.metadata?.client,p.metadata?.year,p.metadata?.material].join(' ').toLowerCase().includes(q)));
 return <div className="adm-list">
  <header className="adm-list-head"><div><p className="adm-kicker">Cases</p><h1>案例</h1></div><Button onClick={()=>navigate('#/admin?case=new')}>新增案例</Button></header>
  <div className="adm-tools"><div className="adm-tabs" role="tablist" aria-label="案例分類">{tabs.map(([id,name])=><button key={id} role="tab" aria-selected={tab===id} className={tab===id?'is-on':undefined} onClick={()=>setTab(id)}>{name}<em>{count(id)}</em></button>)}</div><input className="adm-search" type="search" placeholder="搜尋名稱、客戶、年份" value={query} onChange={e=>setQuery(e.target.value)} aria-label="搜尋案例"/></div>
  {shown.length?<ul className="adm-grid">{shown.map(p=>{const cover=data.covers[p.path]||p.hero;return <li key={p.path}><a href={`#/admin?case=${encodeURIComponent(slugOf(p.path))}`} className={p.hidden?'is-hidden':undefined}>
   <span className="adm-card-photo">{cover&&<Photo src={data.cards[cover.src]||cover.src} alt="" className={cover.width<cover.height?'is-whole':undefined}/>}{p.hidden&&<em>已隱藏</em>}</span>
   <span className="adm-card-meta"><span>{groupName(groupOf(p))}</span><span>{p.metadata?.year||'未填年份'}</span></span>
   <strong>{p.title}</strong>
  </a></li>})}</ul>:<p className="adm-empty">沒有符合的案例。</p>}
 </div>;
}

const isCaption=s=>!s.heading.trim()&&s.text.trim().length>0&&s.text.trim().length<=16&&!s.text.trim().includes('\n');
function Field({label,hint,children,wide}){return <label className={`adm-field${wide?' is-wide':''}`}><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}

function Editor({data,open,onSaved,onExpired}){
 const entry=open==='new'?null:data.index.pages.find(p=>p.category==='cases'&&slugOf(p.path)===open);
 const [draft,setDraft]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(''),[adding,setAdding]=useState('');
 const dirty=useRef(false),pane=useRef(null),picker=useRef(null),drag=useRef(null),[zoom,setZoom]=useState(.6);
 useEffect(()=>{
  let live=true;setDraft(null);setError('');dirty.current=false;
  if(open==='new'){setDraft(newDraft());return}
  if(!entry){setError('找不到這個案例。');return}
  api.readJson(pageFile(entry.id)).then(page=>{if(live)setDraft(toDraft(entry,page,data.covers[entry.path],data.details[entry.path]))}).catch(e=>{if(!live)return;if(e instanceof api.SignedOut)onExpired();setError(e.message)});
  return()=>{live=false};
 },[open]);
 useEffect(()=>{const warn=e=>{if(dirty.current){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[]);
 // The preview is the public page at its desktop width, scaled to the pane.
 useEffect(()=>{if(!pane.current)return;const ob=new ResizeObserver(([e])=>setZoom(Math.min(1,e.contentRect.width/1360)));ob.observe(pane.current);return()=>ob.disconnect()},[Boolean(draft)]);
 const change=patch=>{dirty.current=true;setDraft(d=>({...d,...(typeof patch==='function'?patch(d):patch)}))};
 const back=()=>{if(dirty.current&&!window.confirm('尚未儲存的修改會消失，確定要離開嗎？'))return;dirty.current=false;navigate('#/admin')};
 if(error&&!draft)return <div className="adm-list"><p className="adm-error" role="alert">{error}</p><button className="adm-quiet" onClick={()=>navigate('#/admin')}>← 回到案例列表</button></div>;
 if(!draft)return <p className="adm-loading" role="status">正在讀取案例…</p>;

 const path=draft.isNew?'#/read/pages/'+(draft.slug||'new'):draft.path,{page}=shape(draft,draft.id||'preview',path);
 const arranged=draft.photos.length?arrangeArticle(page,findPage):{chapters:[],details:[],photos:[]};
 const roleOf=src=>{if(src===page.hero.src)return '頁首大圖';let i=arranged.chapters.findIndex(c=>c.image?.src===src);if(i>=0)return `配第 ${i+2} 段文字`;i=arranged.details.findIndex(d=>d.image?.src===src);if(i>=0)return `細節圖 ${i+1}`;return '更多照片'};
 const view=draft.photos.length?{...page,hero:{...page.hero,src:api.assetUrl(page.hero.src)},images:page.images.map(im=>({...im,src:api.assetUrl(im.src)}))}:{...page,hero:null,images:[]};
 const coverPhoto=draft.coverFrom?draft.photos.find(p=>p.src===draft.coverFrom.src):null,cover=coverPhoto||draft.cover||draft.photos.find(p=>p.src===draft.hero)||draft.photos[0];
 const coverSrc=draft.coverFrom?.src||draft.cover?.src,wide=cover&&cover.width>cover.height*1.02,tall=cover&&cover.height>cover.width*1.02;
 const squared=Boolean(draft.coverFrom?.square),pos=draft.coverFrom?.pos??.5;

 const setMeta=(k,v)=>change(d=>({meta:{...d.meta,[k]:v}}));
 const setSection=(i,patch)=>change(d=>({sections:d.sections.map((s,j)=>j===i?{...s,...patch}:s)}));
 const moveSection=(i,by)=>change(d=>{const list=[...d.sections],j=i+by;if(j<0||j>=list.length)return {};[list[i],list[j]]=[list[j],list[i]];return {sections:list}});
 const setPhoto=(i,patch)=>change(d=>({photos:d.photos.map((p,j)=>j===i?{...p,...patch}:p)}));
 const movePhoto=(from,to)=>change(d=>{if(to<0||to>=d.photos.length||from===to)return {};const list=[...d.photos],[p]=list.splice(from,1);list.splice(to,0,p);return {photos:list}});
 const removePhoto=i=>change(d=>{const gone=d.photos[i],photos=d.photos.filter((_,j)=>j!==i);return {photos,hero:d.hero===gone.src?photos[0]?.src||'':d.hero,coverFrom:d.coverFrom?.src===gone.src?null:d.coverFrom}});
 const pickCover=p=>change({coverFrom:{src:p.src,square:p.width>p.height*1.02,pos:.5}});
 async function addFiles(list){
  const images=[...list].filter(f=>f.type.startsWith('image/'));if(!images.length)return;
  setError('');let done=0;
  for(const f of images){
   setAdding(`正在處理照片 ${++done} / ${images.length}`);
   try{const made=await fromFile(f);change(d=>d.photos.some(p=>p.src===made.src)?{}:{photos:[...d.photos,{src:made.src,width:made.width,height:made.height,alt:'',caption:'',file:made.file}],hero:d.hero||made.src})}
   catch{setError(`「${f.name}」無法讀取，請改用 JPG 或 PNG。`)}
  }
  setAdding('');
 }
 async function save(){
  const found=problems(draft,data.index);if(found.length){setError(found.join('；'));return}
  setError('');setBusy('正在準備照片…');
  try{
   // The shared lists are read again right before writing, so a change made elsewhere meanwhile is kept.
   const fresh=await loadData(),again=problems(draft,fresh.index);if(again.length){setError(again.join('；'));return}
   const id=draft.isNew?await idFor('#/read/pages/'+draft.slug):draft.id,made=buildChanges(draft,fresh,()=>id),out=draft.photos.filter(p=>p.file).map(p=>p.file);
   for(let i=0;i<made.thumbs.length;i++){const t=made.thumbs[i],copy=await copyOf(t.of,{limit:t.limit,square:t.square,folder:t.folder});out.push(copy.file);t.set({src:copy.src,width:copy.width,height:copy.height})}
   out.push(...made.texts().map(f=>({...f,encoding:'utf8'})));
   setBusy('正在儲存…');
   const text=`「${draft.title.trim()}」已儲存。`;
   // Local dev reloads the page as soon as the files change, so the message is left for the next load first.
   dirty.current=false;putFlash(text);
   await api.save(out,`${draft.isNew?'新增':'更新'}案例「${draft.title.trim()}」`);
   // Local: the reload may come after this line, so the message stays for it a few seconds longer.
   if(api.local)setTimeout(takeFlash,6000);else takeFlash();
   onSaved(text);
  }catch(e){takeFlash();dirty.current=true;if(e instanceof api.SignedOut)onExpired();setError(e.message)}
  finally{setBusy('')}
 }

 return <div className="adm-edit">
  <form className="adm-form" onSubmit={e=>{e.preventDefault();save()}}>
   <div className="adm-form-top"><button type="button" className="adm-quiet" onClick={back}>← 案例列表</button><p className="adm-kicker">{draft.isNew?'New case':'Edit case'}</p></div>

   <section><h2><em>01</em>基本資料</h2>
    <div className="adm-fields">
     <Field label="案例名稱" wide><input value={draft.title} onChange={e=>change({title:e.target.value})} placeholder="例如：TORNA獎盃" required/></Field>
     {draft.isNew&&<Field label="網址名稱" wide hint={`頁面網址會是 /pages/${draft.slug||'…'}/，儲存後不能更改。只能用小寫英文、數字和連字號。`}><input value={draft.slug} onChange={e=>change({slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})} placeholder="torna-trophy" spellCheck={false}/></Field>}
     <div className="adm-field is-wide"><span>列在哪一頁</span><div className="adm-seg" role="radiogroup" aria-label="分類">{groups.map(g=><button type="button" key={g[0]} role="radio" aria-checked={draft.group===g[0]} className={draft.group===g[0]?'is-on':undefined} onClick={()=>change({group:g[0]})}>{g[1]}</button>)}</div></div>
     <Field label="客戶"><input value={draft.meta.client} onChange={e=>setMeta('client',e.target.value)}/></Field>
     <Field label="年份" hint="例如 2025 或 2023–2025"><input value={draft.meta.year} onChange={e=>setMeta('year',e.target.value)} inputMode="numeric"/></Field>
     <Field label="材質"><input value={draft.meta.material} onChange={e=>setMeta('material',e.target.value)}/></Field>
     <Field label="服務"><input value={draft.meta.service} onChange={e=>setMeta('service',e.target.value)}/></Field>
     <label className="adm-check is-wide"><input type="checkbox" checked={draft.hidden} onChange={e=>change({hidden:e.target.checked})}/><span>從列表隱藏這個案例<small>隱藏後不會出現在任何列表，但知道網址的人仍可以開啟。</small></span></label>
    </div>
   </section>

   <section><h2><em>02</em>文字</h2>
    <Field label="摘要" wide hint="顯示在頁首照片旁，也是搜尋結果的說明文字。"><textarea rows={3} value={draft.summary} onChange={e=>change({summary:e.target.value})}/></Field>
    <ol className="adm-sections">{draft.sections.map((s,i)=>{
     const hiddenInfo=s.heading.trim()==='詳細資訊'&&(draft.meta.client||draft.meta.year),first=draft.sections.findIndex(x=>!(x.heading.trim()==='詳細資訊'&&(draft.meta.client||draft.meta.year)))===i;
     const role=hiddenInfo?'不顯示（頁面右上已有資料表）':first?'第 1 段：頁首照片旁':isCaption(s)?'細節圖的說明':'內文段落：旁邊配一張照片';
     return <li key={i}>
      <div className="adm-section-head"><span>{role}</span><div><button type="button" onClick={()=>moveSection(i,-1)} disabled={!i} aria-label="往上移">↑</button><button type="button" onClick={()=>moveSection(i,1)} disabled={i===draft.sections.length-1} aria-label="往下移">↓</button><button type="button" onClick={()=>change(d=>({sections:d.sections.filter((_,j)=>j!==i)}))}>刪除</button></div></div>
      <input value={s.heading} onChange={e=>setSection(i,{heading:e.target.value})} placeholder="小標題，例如：設計｜圓柱上的開槽" aria-label={`第 ${i+1} 段小標題`}/>
      <textarea rows={Math.max(3,Math.ceil(s.text.length/34))} value={s.text} onChange={e=>setSection(i,{text:e.target.value})} placeholder="內文。換行會分成不同段落。" aria-label={`第 ${i+1} 段內文`}/>
     </li>})}</ol>
    <button type="button" className="adm-add" onClick={()=>change(d=>({sections:[...d.sections,{heading:'',text:'',items:[]}]}))}>＋ 新增一段文字</button>
   </section>

   <section><h2><em>03</em>照片</h2>
    <p className="adm-note">照片的順序決定它出現的位置：每段內文依序配一張，其餘放在「更多照片」。可以拖曳或用箭頭調整。上傳的照片會自動縮小到網頁用的大小。</p>
    <div className={`adm-drop${adding?' is-busy':''}`} onDragOver={e=>{e.preventDefault()}} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files)}}>
     <input ref={picker} type="file" accept="image/*" multiple hidden onChange={e=>{addFiles(e.target.files);e.target.value=''}}/>
     <button type="button" onClick={()=>picker.current.click()} disabled={Boolean(adding)}>{adding||'選擇照片上傳'}</button><span>或把照片拖到這裡</span>
    </div>
    <ul className="adm-photos">{draft.photos.map((p,i)=><li key={p.src} draggable onDragStart={()=>{drag.current=i}} onDragOver={e=>{if(drag.current!=null)e.preventDefault()}} onDrop={e=>{if(drag.current==null)return;e.preventDefault();e.stopPropagation();movePhoto(drag.current,i);drag.current=null}} onDragEnd={()=>{drag.current=null}}>
     <div className="adm-photo-frame"><Photo src={p.src} alt="" draggable={false}/><span className="adm-badges"><em className={p.src===page.hero.src?'is-key':undefined}>{roleOf(p.src)}</em>{coverSrc===p.src&&<em className="is-key">封面</em>}{p.file&&<em className="is-new">新上傳</em>}</span></div>
     <input value={p.alt} onChange={e=>setPhoto(i,{alt:e.target.value})} placeholder="照片說明（給搜尋引擎與螢幕報讀）" aria-label={`第 ${i+1} 張照片說明`}/>
     <div className="adm-photo-actions"><button type="button" onClick={()=>movePhoto(i,i-1)} disabled={!i} aria-label="往前移">←</button><button type="button" onClick={()=>movePhoto(i,i+1)} disabled={i===draft.photos.length-1} aria-label="往後移">→</button><button type="button" onClick={()=>change({hero:p.src})} disabled={p.src===page.hero.src}>設為頁首</button><button type="button" onClick={()=>pickCover(p)} disabled={draft.coverFrom?.src===p.src}>設為封面</button><button type="button" className="is-danger" onClick={()=>removePhoto(i)}>移除</button></div>
    </li>)}</ul>
   </section>

   <section><h2><em>04</em>列表封面</h2>
    {cover?<div className="adm-cover">
     <div className="adm-cover-frame"><Photo src={cover.src} alt="" className={!squared&&tall?'is-whole':undefined} style={squared?{objectPosition:wide?`${pos*100}% 50%`:`50% ${pos*100}%`}:undefined}/></div>
     <div className="adm-cover-side">
      <p>這是案例在列表上的樣子。列表的框是正方形：直式照片會完整顯示，橫式照片會裁掉左右。</p>
      {coverPhoto?(wide||tall)&&<>
       <label className="adm-check"><input type="checkbox" checked={squared} onChange={e=>change(d=>({coverFrom:{...d.coverFrom,square:e.target.checked}}))}/><span>裁成正方形</span></label>
       {squared&&<label className="adm-range"><span>調整裁切位置，讓作品完整出現</span><input type="range" min="0" max="1" step="0.01" value={pos} onChange={e=>change(d=>({coverFrom:{...d.coverFrom,pos:Number(e.target.value)}}))}/></label>}
      </>:<p className="adm-quiet-text">要換封面，請在上面的照片按「設為封面」。</p>}
     </div>
    </div>:<p className="adm-quiet-text">上傳照片後，第一張會先當封面。</p>}
   </section>

   <div className="adm-save">{error&&<p className="adm-error" role="alert">{error}</p>}<div><Button type="submit" disabled={Boolean(busy||adding)}>{busy||(api.local?'儲存':'儲存並上線')}</Button><button type="button" className="adm-quiet" onClick={back}>取消</button></div></div>
  </form>

  <aside className="adm-preview" aria-label="頁面預覽"><p className="adm-preview-label">頁面預覽<span>修改會立刻顯示在這裡</span></p><div className="adm-preview-pane" ref={pane}><div className="adm-preview-page folio-home tx content-site" style={{zoom}} inert><ContentReader draft={view}/></div></div></aside>
 </div>;
}

export default function AdminSite({open}){
 const [who,setWho]=useState(null),[data,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(arrived),[checking,setChecking]=useState(api.configured&&api.hasToken()),[expired,setExpired]=useState(false);
 useEffect(()=>{
  document.title='re.O｜案例後台';
  let m=document.head.querySelector('meta[name=robots]');const made=!m;
  if(!m){m=document.createElement('meta');m.name='robots';document.head.append(m)}
  const old=m.content;m.content='noindex,nofollow';
  return()=>{made?m.remove():m.content=old};
 },[]);
 useEffect(()=>{if(!checking)return;api.me().then(setWho).catch(()=>{}).finally(()=>setChecking(false))},[]);
 useEffect(()=>{if(!who)return;loadData().then(setData).catch(e=>{if(e instanceof api.SignedOut)setWho(null);else setError(e.message)})},[who]);
 // A message left by a save that reloaded the page (local dev): show it on the list.
 useEffect(()=>{if(notice&&open)navigate('#/admin',{replace:true})},[]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),api.local?9000:600000);return()=>clearTimeout(t)},[notice]);
 const saved=async text=>{setNotice(text);navigate('#/admin');try{setData(await loadData())}catch{}};
 const signOut=()=>{api.setToken('');setWho(null);setData(null);try{window.google?.accounts?.id?.disableAutoSelect()}catch{}};

 if(!api.configured)return <div className="adm folio-home tx"><div className="adm-sign"><BrandLogo alt="re.O" size={84}/><h1>案例後台</h1><p>後台尚未啟用。</p><a className="adm-quiet" href="#/">回到網站</a></div></div>;
 if(checking)return <div className="adm folio-home tx"><p className="adm-loading" role="status">正在確認登入…</p></div>;
 if(!who)return <div className="adm folio-home tx"><SignIn onDone={setWho}/></div>;
 return <div className="adm folio-home tx">
  <header className="adm-bar"><a href="#/admin" className="adm-brand"><BrandLogo alt="re.O" size={44}/><span>案例後台</span></a><div className="adm-bar-side">{api.local&&<em className="adm-mode">本機模式：儲存會直接寫入這台電腦的網站檔案</em>}{!api.local&&<span className="adm-who">{who.email}</span>}<a href="#/" target="_blank" rel="noopener">開啟網站</a>{!api.local&&<button onClick={signOut}>登出</button>}</div></header>
  {notice&&<div className="adm-notice" role="status"><span>{notice}{api.local?' 已寫入本機網站。':' '}{!api.local&&<BuildStatus key={notice}/>}</span><button onClick={()=>setNotice('')} aria-label="關閉訊息">×</button></div>}
  <main className="adm-main">
   {error&&<p className="adm-error" role="alert">{error}</p>}
   {!data?(!error&&<p className="adm-loading" role="status">正在讀取案例…</p>):open?<Editor key={open} data={data} open={open} onSaved={saved} onExpired={()=>setExpired(true)}/>:<CaseList data={data}/>}
  </main>
  {expired&&<div className="adm-overlay" role="dialog" aria-modal="true" aria-label="重新登入"><div><SignIn message="登入已過期，請重新登入後再按一次儲存。你的修改還在。" onDone={w=>{setWho(w);setExpired(false)}}/></div></div>}
 </div>;
}
