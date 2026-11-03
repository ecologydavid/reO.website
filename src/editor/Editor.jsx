import React,{useMemo,useState,useRef,useCallback,useEffect} from 'react';
import models from '../data/models.json';
import {contentHref} from '../components/site/navigation.js';
import {BrandLogo} from '../components/site/ui.jsx';
import {getLayout} from '../data/geometry.js';
import {getModelScene,defaultFinish,shapeChoices,stoneColors,metalColors} from '../data/canonical.js';
import {defaultObjects} from './geometry.mjs';
import {fitObject,objectFits} from './constraints.mjs';
import useHistory from './useHistory.js';
import ProductView from './ProductView.jsx';
import PlateStage from './PlateStage.jsx';
import Inspector from './Inspector.jsx';
import Icon from '../components/Icon.jsx';
import './editor-v4.css';
const STORAGE='reo-preview-draft-v3',legacyStorage='reo-preview-draft-v1';
const keyFor=(id,shape,surface)=>`${id}:${shape}:${surface}`;
// Objects may run past the plate's outline (that part shows red and is never produced); only their
// centre has to stay on the plate's rectangle, so nothing can be dragged out of reach.
const settle=(o,s)=>{const x=Math.max(0,Math.min(s.width,o.x)),y=Math.max(0,Math.min(s.height,o.y));return x===o.x&&y===o.y?o:{...o,x,y}};
function readDraft(preferLegacy=false){
  try{
    const saved=preferLegacy?null:localStorage.getItem(STORAGE),d=JSON.parse(saved||localStorage.getItem(legacyStorage)||'null');
    if(!d||![1,3].includes(d.version)||!d.documents||typeof d.documents!=='object')return {version:3,documents:{},finishes:{}};
    const documents={};
    for(const [key,list] of Object.entries(d.documents)){
      const match=key.match(/^([A-F]):(ridge|water|diamond):(\w+)$/);if(!match||!Array.isArray(list)||list.length>20)continue;
      const [id,shape,sid]=match.slice(1),scene=getModelScene(id,shape),s=scene.surfaces.find(s=>s.id===sid);if(!s)continue;
      const old=getLayout(id,shape).surfaces.find(s=>s.id===sid);
      documents[key]=list.filter(o=>['text','image'].includes(o.type)&&[o.x,o.y,o.rotation].every(Number.isFinite)&&(o.type==='text'?typeof o.text==='string'&&o.text.length<=300&&Number.isFinite(o.fontSize):/^data:image\/(png|jpeg|webp);base64,/.test(o.src)&&o.src.length<4500000)).map(o=>{
        const legacy=d.version===1;
        return {...o,x:legacy?o.x/old.width*s.width:o.x,y:legacy?o.y/old.height*s.height:o.y,...(o.type==='image'?{width:Math.max(10,Number(o.width)||160),height:Math.max(10,Number(o.height)||160)}:{}),fontSize:o.type==='text'?Math.max(3,Math.min(400,legacy?o.fontSize*Math.min(s.width/old.width,s.height/old.height):o.fontSize)):undefined,boxWidth:o.boxWidth||s.width*.8,lineHeight:o.lineHeight||1.35,letterSpacing:o.letterSpacing||0,autoColor:o.autoColor??['#252d28','#f8f6ef','#f5f3ed'].includes(o.color)};
      });
    }return {version:3,documents,finishes:d.finishes||{},migrated:d.version===1};
  }catch{return {version:3,documents:{},finishes:{}}}
}

// Finishes as swatches. Every option is one of the product's verified combinations: D and F pair
// any stone with any metal, A pairs either wood with any base, B/C come in two stones, E in two sets.
const woods={北美黃檜:'#bd9254',木橫擔:'#82674d'};
function Swatch({label,colors,pressed,onClick}){return <button type="button" className="st-swatch" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}><i style={{background:colors.length>1?`linear-gradient(135deg,${colors[0]} 50%,${colors[1]} 50%)`:colors[0]}}/></button>}
function Finishes({scene,onChange}){
  // The row names the current choice, so the swatches can stay unlabelled.
  const row=(label,items)=><div className="st-finish-row"><span className="st-label">{label}<b>{[items].flat().find(item=>item.props.pressed)?.props.label}</b></span><div className="st-swatches">{items}</div></div>;
  if(['D','F'].includes(scene.id))return <>{row('再生大理石',['白','黑','綠'].map(c=><Swatch key={c} label={c} colors={[stoneColors[c]]} pressed={scene.stone===c} onClick={()=>onChange(c+scene.metal)}/>))}{row(scene.id==='F'?'金屬層':'主銘版',['金','銀','銅'].map(c=><Swatch key={c} label={c} colors={[metalColors[c]]} pressed={scene.metal===c} onClick={()=>onChange(scene.stone+c)}/>))}</>;
  if(scene.id==='A'){const [wood,base]=scene.finish.split('｜');return <>{row('木材',Object.keys(woods).map(w=><Swatch key={w} label={w} colors={[woods[w]]} pressed={wood===w} onClick={()=>onChange(`${w}｜${base}`)}/>))}{row('底座',['白再生大理石','黑再生大理石','水庫淤泥'].map(b=><Swatch key={b} label={b} colors={[stoneColors[b.includes('白')?'白':b.includes('黑')?'黑':'淤泥']]} pressed={base===b} onClick={()=>onChange(`${wood}｜${b}`)}/>))}</>}
  if(scene.id==='E')return row('配色',scene.options.map(v=><Swatch key={v} label={v} colors={[stoneColors[v[0]],metalColors[v[1]]]} pressed={scene.finish===v} onClick={()=>onChange(v)}/>));
  return row('石材',scene.options.map(v=><Swatch key={v} label={v+'色石材'} colors={[stoneColors[v]]} pressed={scene.finish===v} onClick={()=>onChange(v)}/>));
}

export default function Editor({modelId,onModelChange,onHome}){
  const model=models.find(m=>m.id===modelId)||models[1],history=useHistory(readDraft);
  const [shape,setShape]=useState('ridge'),[activeId,setActiveId]=useState('main'),[selectedId,setSelectedId]=useState('title'),[mode,setMode]=useState('front');
  const [notice,setNotice]=useState(''),[busy,setBusy]=useState(''),[reference,setReference]=useState(false);
  const [menu,setMenu]=useState(false),[view,setView]=useState('edit'),[saved,setSaved]=useState('');
  const [hasLegacy]=useState(()=>{try{return !!localStorage.getItem(legacyStorage)}catch{return false}});
  const inputRef=useRef(null),noticeTimer=useRef(null),measureRef=useRef(null),menuRef=useRef(null);
  if(!measureRef.current)measureRef.current=document.createElement('canvas').getContext('2d');
  const scene=useMemo(()=>getModelScene(model.id,shape,history.state.finishes?.[model.id]||defaultFinish[model.id]),[model.id,shape,history.state.finishes]);
  const surface=scene.surfaces.find(s=>s.id===activeId)||scene.surfaces[0];
  const documents=useMemo(()=>Object.fromEntries(scene.surfaces.map(s=>{
    let seed=defaultObjects(s);
    if(model.id==='F')seed=seed.map((o,i)=>({...o,y:s.height*[.25,.4,.53][i],fontSize:o.fontSize*.72}));
    if(model.id==='E'&&s.id==='back')seed=seed.map((o,i)=>({...o,x:s.width*.5,y:s.height*[.40,.54,.68][i],rotation:-27,fontSize:o.fontSize*.7}));
    if(model.id==='E'&&s.id==='front')seed=seed.map((o,i)=>({...o,x:s.width*[.4,.48,.42][i],y:s.height*[.38,.64,.82][i],fontSize:[65,90,40][i]}));
    if(model.id==='D'&&s.id==='lower')seed=seed.map((o,i)=>({...o,y:s.height*[.22,.5,.8][i],fontSize:[50,90,40][i]}));
    const list=history.state.documents[keyFor(model.id,shape,s.id)]||seed;
    return [s.id,list.map(o=>settle(o.type==='text'&&o.autoColor!==false?{...o,color:s.ink,autoColor:true}:o,s))];
  })),[scene,model.id,shape,history.state.documents]);
  const objects=documents[surface.id],object=objects.find(o=>o.id===selectedId);
  const outside=useMemo(()=>new Set(objects.filter(o=>!o.hidden&&!objectFits(o,surface,measureRef.current)).map(o=>o.id)),[objects,surface]);
  const notify=useCallback(message=>{setNotice(message);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4500)},[]);
  useEffect(()=>()=>clearTimeout(noticeTimer.current),[]);
  function changeModel(id){onModelChange(id);setActiveId('main');setSelectedId('title')}
  function pickSurface(id){setActiveId(id);setSelectedId('title');setView('edit')}
  function updateObjects(updater,{record=true,surfaceId=surface.id}={}){history.change(d=>{const key=keyFor(model.id,shape,surfaceId),s=scene.surfaces.find(s=>s.id===surfaceId);const current=(d.documents[key]||documents[surfaceId]||[]).map(o=>settle(o,s));return {...d,documents:{...d.documents,[key]:updater(current)}}},{record})}
  function patch(id,changes,record=true){
    updateObjects(list=>list.map(o=>{if(o.id!==id||o.locked&&!('locked' in changes))return o;return settle({...o,...changes,...('color' in changes&&!('autoColor' in changes)?{autoColor:false}:{})},surface)}),{record});
  }
  function addText(){if(objects.length>=20)return notify('每區最多可放置 20 個物件。');const o=fitObject({...defaultObjects(surface)[1],id:crypto.randomUUID(),text:'新增文字',autoColor:true,x:surface.width*.5,y:surface.height*.5},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id);editText()}
  async function upload(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))return notify('請選擇 PNG、JPG 或 WebP 圖案。');if(file.size>3*1024*1024)return notify('圖案請小於 3 MB。');if(objects.length>=20)return notify('每區最多可放置 20 個物件。');
    try{const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});const width=Math.min(surface.width*.3,surface.height*.3*image.width/image.height);const o=fitObject({id:crypto.randomUUID(),type:'image',src,name:file.name.slice(0,60),x:surface.width*.5,y:surface.height*.5,width,height:width*image.height/image.width,rotation:0},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id);notify('圖案已加入。超出銘版的部分會以紅色標示，不會製作。')}catch{notify('無法讀取這個圖案，請改用 PNG 或 JPG。')}
  }
  function activeObject(){return (history.getState().documents[keyFor(model.id,shape,surface.id)]||objects).find(o=>o.id===selectedId)}
  function duplicate(){const current=activeObject();if(!current||objects.length>=20)return;const o=fitObject({...current,id:crypto.randomUUID(),locked:false,x:current.x+20,y:current.y+20},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id)}
  function remove(){const current=activeObject();if(!current||current.locked)return;updateObjects(list=>list.filter(o=>o.id!==current.id));setSelectedId(null)}
  function reorder(direction){if(!object)return;updateObjects(list=>{const a=[...list],i=a.findIndex(o=>o.id===object.id),j=i+direction;if(j>=0&&j<a.length)[a[i],a[j]]=[a[j],a[i]];return a})}
  // The one place that still shrinks and moves an object until it lies wholly on the plate.
  function fitSelected(){if(!object||object.locked)return;updateObjects(list=>list.map(o=>o.id===object.id?fitObject({...o,x:surface.width*.5,y:surface.height*.5,boxWidth:Math.min(o.boxWidth||surface.width*.8,surface.width*.8)},surface,measureRef.current):o));notify('已放回銘版內。')}
  function center(axis){if(object)patch(object.id,axis==='x'?{x:surface.width/2}:{y:surface.height/2})}
  // Focus the text box once the inspector has rendered the newly picked object.
  function editText(){requestAnimationFrame(()=>{const field=document.getElementById('st-text-input');if(field){field.focus();field.select()}})}
  function setFinish(value){history.change(d=>({...d,finishes:{...d.finishes,[model.id]:value}}))}
  function currentSnapshot(){const state=history.getState(),currentScene=getModelScene(model.id,shape,state.finishes?.[model.id]||defaultFinish[model.id]);const currentDocuments=Object.fromEntries(currentScene.surfaces.map(s=>[s.id,(state.documents[keyFor(model.id,shape,s.id)]||documents[s.id]).map(o=>settle(o.type==='text'&&o.autoColor!==false?{...o,color:s.ink}:o,s))]));return {state,scene:currentScene,documents:currentDocuments}}
  // Drafts save themselves a moment after each change, in this browser only.
  useEffect(()=>{
    const timer=setTimeout(()=>{try{const snap=currentSnapshot(),d={...snap.state,version:3,modelId:model.id,shape,documents:{...snap.state.documents,...Object.fromEntries(snap.scene.surfaces.map(s=>[keyFor(model.id,shape,s.id),snap.documents[s.id]]))}};localStorage.setItem(STORAGE,JSON.stringify(d));setSaved('草稿已自動儲存')}catch{setSaved('草稿空間不足，請縮小圖案')}},800);
    return()=>clearTimeout(timer);
  },[history.state,model.id,shape]);// eslint-disable-line react-hooks/exhaustive-deps
  async function exportFile(kind){
    setMenu(false);setBusy(kind);
    try{
      // Anything past the outline is left out of both files (they clip to the plate), and the note says so.
      const snap=currentSnapshot(),cut=snap.scene.surfaces.some(s=>snap.documents[s.id].some(o=>!o.hidden&&!objectFits(o,s,measureRef.current))),tail=cut?'超出銘版的紅色部分未納入。':'';
      if(kind==='pdf'){const {exportPdf}=await import('./PdfExport.js');const pages=await exportPdf(model,snap.scene,snap.documents);notify(`已下載 ${pages} 頁排版確認 PDF。${tail}`)}
      else{const {exportEps}=await import('./EpsExport.js');const plates=await exportEps(model,snap.scene,snap.documents);notify(`已下載 EPS 向量檔（${plates} 區，文字已轉外框）。${tail}`)}
    }catch(e){notify(e.message||'匯出失敗，請稍後重試。')}finally{setBusy('')}
  }
  // Shortcuts outside text fields: undo/redo, duplicate.
  useEffect(()=>{
    const key=e=>{
      if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;
      const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
      if(mod&&k==='z'){e.preventDefault();e.shiftKey?history.redo():history.undo()}
      else if(mod&&k==='y'){e.preventDefault();history.redo()}
      else if(mod&&k==='d'){e.preventDefault();duplicate()}
      else if(e.key==='Escape')setMenu(false);
    };
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  });
  useEffect(()=>{if(!menu)return;const close=e=>{if(!menuRef.current?.contains(e.target))setMenu(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[menu]);
  const size=Array.isArray(model.dimensions_mm)?model.dimensions_mm.map(v=>v/10).join(' × ')+' cm':'Ø8 × 厚1 cm';
  return <div className="st-app">
    <header className="st-header">
      <a className="st-mark" href="#/" onClick={e=>{e.preventDefault();onHome()}} aria-label="回到 re.O 首頁"><span className="st-logo"><BrandLogo alt=""/></span><span className="st-tag" aria-hidden="true">for real</span></a>
      <div className="st-title"><p>Plaque Studio</p><h1>銘版排版工作室</h1></div>
      <div className="st-header-actions">
        <span className="st-saved" role="status">{saved}</span>
        <button type="button" className="st-back" onClick={onHome}><Icon name="back" size={17}/>返回官網</button>
        <div className="st-export" ref={menuRef}>
          <button type="button" className="st-btn st-btn-dark" aria-haspopup="menu" aria-expanded={menu} disabled={!!busy} onClick={()=>setMenu(m=>!m)}><span>{busy?'匯出中…':'下載檔案'}</span><i className="st-chip"><Icon name="download" size={15}/></i></button>
          {menu?<div className="st-menu" role="menu">
            <button type="button" role="menuitem" onClick={()=>exportFile('pdf')}><b>PDF</b><span><strong>排版確認稿</strong>整體預覽與每區特寫，A4</span></button>
            <button type="button" role="menuitem" onClick={()=>exportFile('eps')}><b>EPS</b><span><strong>向量檔</strong>文字轉外框，交給設計或加工</span></button>
          </div>:null}
        </div>
      </div>
    </header>
    <div className={`st-layout is-${view}`}>
      <aside className="st-product" aria-label="選擇產品">
        <div className="st-product-head"><p className="st-kicker">{model.id} 款・{model.kind}</p><h2>{model.name}</h2><p className="st-meta">{size}<span>NT${model.price}</span></p></div>
        <section className="st-step st-step-models"><h3><span>01</span>款式</h3>
          <div className="st-models">{models.map(m=><button type="button" key={m.id} aria-label={`${m.id} 款 ${m.name}`} aria-pressed={model.id===m.id} onClick={()=>changeModel(m.id)}><img src={`/assets/product-thumb-${m.id}.webp`} alt="" loading="lazy"/><span>{m.id}</span></button>)}</div>
          {model.id==='F'?<div className="st-finish-row"><span className="st-label">獎牌造型</span><div className="st-chips">{shapeChoices.map(v=><button type="button" key={v.id} aria-pressed={shape===v.id} onClick={()=>{setShape(v.id);setSelectedId('title')}}>{v.name}</button>)}</div></div>:null}
        </section>
        <section className="st-step st-step-finish"><h3><span>02</span>顏色與材質</h3><Finishes scene={scene} onChange={setFinish}/></section>
        <section className="st-step st-step-view"><h3><span>03</span>成品預覽<button type="button" className="st-ref" onClick={()=>setReference(true)}>官方線稿<Icon name="expand" size={14}/></button></h3>
          <ProductView scene={scene} documents={documents} surface={surface} mode={mode} onMode={setMode} onSurface={pickSurface}/>
          <p className="st-note">圖示重建預覽，色澤紋理以實品為準</p>
          {hasLegacy?<button type="button" className="st-text-btn" onClick={()=>{history.change(readDraft(true));notify('已載入原版草稿，可按復原回到剛才的版本。')}}>載入原版草稿</button>:null}
        </section>
      </aside>
      <div className="st-mobile-switch" role="group" aria-label="切換檢視">{[['edit','排版'],['view','成品預覽']].map(([id,label])=><button type="button" key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div>
      <main className="st-work">
        <div className="st-work-bar">
          <h3 className="st-work-title"><span>04</span>排版</h3>
          {scene.surfaces.length>1?<div className="st-zones" role="group" aria-label="編輯區域">{scene.surfaces.map(s=><button type="button" key={s.id} aria-pressed={surface.id===s.id} onClick={()=>pickSurface(s.id)}>{s.name}</button>)}</div>:<p className="st-zone-name">{surface.name}</p>}
          <div className="st-work-tools">
            <button type="button" className="st-btn st-btn-ghost st-btn-sm" onClick={addText}><Icon name="text" size={16}/>文字</button>
            <button type="button" className="st-btn st-btn-ghost st-btn-sm" onClick={()=>inputRef.current.click()}><Icon name="image" size={16}/>圖案</button>
            <span className="st-sep" aria-hidden="true"/>
            <button type="button" className="st-icon" aria-label="復原" title="復原（Ctrl+Z）" disabled={!history.canUndo} onClick={history.undo}><Icon name="undo" size={18}/></button>
            <button type="button" className="st-icon" aria-label="重做" title="重做（Ctrl+Shift+Z）" disabled={!history.canRedo} onClick={history.redo}><Icon name="redo" size={18}/></button>
          </div>
        </div>
        <PlateStage surface={surface} objects={objects} selectedId={selectedId} measure={measureRef.current} outside={outside} onSelect={setSelectedId} onPatch={patch} onCheckpoint={history.checkpoint} onDelete={remove} onEditText={editText}/>
        <p className={`st-work-note${outside.size?' is-warning':''}`} role="status">{outside.size?'紅色部分超出銘版，不會製作；可直接下載，或拖回框內。':<>拖曳移動・拉角落縮放・拉圓點旋轉・雙擊改字{surface.material==='acrylic'?'・透明壓克力以灰色襯底顯示':''}</>}</p>
      </main>
      <Inspector object={object} outside={outside.has(selectedId)} objects={objects} surface={surface} onPatch={changes=>patch(selectedId,changes)} onPatchLayer={patch} onSelect={setSelectedId} onDuplicate={duplicate} onDelete={remove} onReorder={reorder} onFit={fitSelected} onCenter={center} onAddText={addText} onUpload={()=>inputRef.current.click()}/>
    </div>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上傳圖案檔案" className="file-input" onChange={upload}/>
    {notice?<div className="st-toast" role="status"><Icon name="check" size={18}/>{notice}</div>:null}
    {reference?<div className="modal-backdrop" onClick={()=>setReference(false)}><section className="reference-modal st-reference" role="dialog" aria-modal="true" aria-labelledby="reference-title" onClick={e=>e.stopPropagation()}><div><h2 id="reference-title">{model.id} 款・官方客製範圍</h2><button type="button" className="st-icon" aria-label="關閉客製範圍" onClick={()=>setReference(false)}><Icon name="close"/></button></div><img src={model.referenceImage} alt={`${model.id} 款官網紅色客製範圍線稿`}/><details><summary>對照原始實品照片</summary><img src={model.photo} alt={`${model.id} 款官網實品照片`}/></details><p>紅色表示可排版區，不代表整片皆為金屬。A 上區為木面，D 下區為石面，F 客製區為透明壓克力。</p><p className="small-copy">模型依實品多角度照片與線稿重建；局部尺寸、斜度與留邊仍需製作圖確認。</p><a className="text-control" href={contentHref(model.source_url)}>查看完整商品介紹<Icon name="arrow" size={16}/></a></section></div>:null}
  </div>;
}
