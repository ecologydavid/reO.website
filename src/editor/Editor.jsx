import React,{useMemo,useState,useRef,useCallback,useEffect} from 'react';
import models from '../data/models.json';
import {getLayout} from '../data/geometry.js';
import {getModelScene,defaultFinish,shapeChoices,stoneColors,metalColors} from '../data/canonical.js';
import {defaultObjects} from './geometry.mjs';
import {fitObject,objectFits} from './constraints.mjs';
import useHistory from './useHistory.js';
import DualPreview from './DualPreview.jsx';
import Inspector from './Inspector.jsx';
import Icon from '../components/Icon.jsx';
import './editor-v3.css';
const STORAGE='reo-preview-draft-v3',legacyStorage='reo-preview-draft-v1';
const keyFor=(id,shape,surface)=>`${id}:${shape}:${surface}`;
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
function FinishOptions({scene,onChange}){
  if(['D','F'].includes(scene.id))return <><fieldset className="finish-field"><legend>再生大理石</legend><div className="color-options">{['白','黑','綠'].map(color=><button key={color} className={scene.stone===color?'selected':''} aria-label={`${color}色石材`} aria-pressed={scene.stone===color} onClick={()=>onChange(color+scene.metal)}><i style={{background:stoneColors[color]}}/>{color}</button>)}</div></fieldset><fieldset className="finish-field"><legend>{scene.id==='F'?'金屬層顏色':'主銘版顏色'}</legend><div className="color-options">{['金','銀','銅'].map(color=><button key={color} className={scene.metal===color?'selected':''} aria-label={`${color}色${scene.id==='F'?'金屬層':'銘版'}`} aria-pressed={scene.metal===color} onClick={()=>onChange(scene.stone+color)}><i style={{background:metalColors[color]}}/>{color}</button>)}</div></fieldset></>;
  if(scene.id==='A')return <label className="finish-select">木材與底座<select aria-label="木材與底座" value={scene.finish} onChange={e=>onChange(e.target.value)}>{scene.options.map(value=><option key={value}>{value}</option>)}</select></label>;
  return <div className="simple-finish">{scene.options.map(value=><button key={value} aria-pressed={scene.finish===value} className={scene.finish===value?'selected':''} onClick={()=>onChange(value)}>{scene.id==='E'?value:value+'色石材'}</button>)}</div>;
}
export default function Editor({modelId,onModelChange,onHome}){
  const model=models.find(m=>m.id===modelId)||models[1],history=useHistory(readDraft);
  const [shape,setShape]=useState('ridge'),[activeId,setActiveId]=useState('main'),[selectedId,setSelectedId]=useState('title'),[mode,setMode]=useState('front');
  const [notice,setNotice]=useState(''),[overflow,setOverflow]=useState(false),[busy,setBusy]=useState(false),[reference,setReference]=useState(false);
  const [hasLegacy]=useState(()=>{try{return !!localStorage.getItem(legacyStorage)}catch{return false}});
  const inputRef=useRef(null),noticeTimer=useRef(null),measureRef=useRef(null);
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
    return [s.id,list.map(o=>fitObject(o.type==='text'&&o.autoColor!==false?{...o,color:s.ink,autoColor:true}:o,s,measureRef.current))];
  })),[scene,model.id,shape,history.state.documents]);
  const objects=documents[surface.id],object=objects.find(o=>o.id===selectedId);
  const notify=useCallback(message=>{setNotice(message);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4500)},[]);
  useEffect(()=>()=>clearTimeout(noticeTimer.current),[]);
  function changeModel(id){onModelChange(id);setActiveId('main');setSelectedId('title')}
  function updateObjects(updater,{record=true,surfaceId=surface.id}={}){history.change(d=>{const key=keyFor(model.id,shape,surfaceId),s=scene.surfaces.find(s=>s.id===surfaceId);const current=(d.documents[key]||documents[surfaceId]||[]).map(o=>fitObject(o,s,measureRef.current));return {...d,documents:{...d.documents,[key]:updater(current)}}},{record})}
  function patch(id,changes,record=true){
    const positionOnly=Object.keys(changes).every(k=>['x','y'].includes(k));
    updateObjects(list=>list.map(o=>{if(o.id!==id||o.locked&&!('locked' in changes))return o;const next={...o,...changes,...('color' in changes?{autoColor:false}:{})};return fitObject(next,surface,measureRef.current,{previous:o,positionOnly})}),{record});
  }
  function addText(){if(objects.length>=20)return notify('每區最多可放置 20 個物件。');const o=fitObject({...defaultObjects(surface)[1],id:crypto.randomUUID(),text:'新增文字',autoColor:true,x:surface.width*.5,y:surface.height*.5},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id)}
  async function upload(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))return notify('請選擇 PNG、JPG 或 WebP 圖案。');if(file.size>3*1024*1024)return notify('圖案請小於 3 MB。');if(objects.length>=20)return notify('每區最多可放置 20 個物件。');
    try{const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});const width=Math.min(surface.width*.3,surface.height*.3*image.width/image.height);const o=fitObject({id:crypto.randomUUID(),type:'image',src,name:file.name.slice(0,60),x:surface.width*.5,y:surface.height*.5,width,height:width*image.height/image.width,rotation:0},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id);notify('圖案已加入，拖曳時會保留在客製輪廓內。')}catch{notify('無法讀取這個圖案，請改用 PNG 或 JPG。')}
  }
  function activeObject(){return (history.getState().documents[keyFor(model.id,shape,surface.id)]||objects).find(o=>o.id===selectedId)}
  function duplicate(){const current=activeObject();if(!current||objects.length>=20)return;const o=fitObject({...current,id:crypto.randomUUID(),locked:false,x:current.x+20,y:current.y+20},surface,measureRef.current);updateObjects(list=>[...list,o]);setSelectedId(o.id)}
  function remove(){const current=activeObject();if(!current||current.locked)return;updateObjects(list=>list.filter(o=>o.id!==current.id));setSelectedId(null)}
  function reorder(direction){if(!object)return;updateObjects(list=>{const a=[...list],i=a.findIndex(o=>o.id===object.id),j=i+direction;if(j>=0&&j<a.length)[a[i],a[j]]=[a[j],a[i]];return a})}
  function fitSelected(){if(!object)return;patch(object.id,{x:surface.width*.5,y:surface.height*.5,boxWidth:surface.width*.8});notify('已依客製輪廓調整位置與字級。')}
  function setFinish(value){history.change(d=>({...d,finishes:{...d.finishes,[model.id]:value}}))}
  function currentSnapshot(){const state=history.getState(),currentScene=getModelScene(model.id,shape,state.finishes?.[model.id]||defaultFinish[model.id]);const currentDocuments=Object.fromEntries(currentScene.surfaces.map(s=>[s.id,(state.documents[keyFor(model.id,shape,s.id)]||documents[s.id]).map(o=>fitObject(o.type==='text'&&o.autoColor!==false?{...o,color:s.ink}:o,s,measureRef.current))]));return {state,scene:currentScene,documents:currentDocuments}}
  function save(){try{const snap=currentSnapshot(),d={...snap.state,version:3,modelId:model.id,shape,documents:{...snap.state.documents,...Object.fromEntries(snap.scene.surfaces.map(s=>[keyFor(model.id,shape,s.id),snap.documents[s.id]]))}};localStorage.setItem(STORAGE,JSON.stringify(d));notify('草稿已儲存在此瀏覽器。')}catch{notify('草稿空間不足，請減少圖案大小後再儲存。')}}
  async function download(){setBusy(true);try{const snap=currentSnapshot();if(snap.scene.surfaces.some(s=>snap.documents[s.id].some(o=>!objectFits(o,s,measureRef.current))))throw Error('請先將內容調整到客製輪廓內。');const {exportPdf}=await import('./PdfExport.js');const pages=await exportPdf(model,snap.scene,snap.documents);notify(`已下載 ${pages} 頁排版預覽 PDF。`)}catch(e){notify(e.message||'PDF 匯出失敗，請稍後重試。')}finally{setBusy(false)}}
  return <div className="editor-page editor-v3">
    <header className="editor-header"><button className="editor-brand" onClick={onHome} aria-label="re.O 回到首頁"><img src="/assets/reo-logo.png" alt="re.O"/></button><h1>銘版排版工作室</h1><div className="editor-header-actions"><button className="text-control return-home" onClick={onHome}><Icon name="back"/>返回官網</button><button className="outline compact save-button" onClick={save}><Icon name="save"/>儲存草稿</button><button className="primary download-button" onClick={download} disabled={busy||overflow}><Icon name="download"/>{busy?'匯出中…':'下載 PDF'}</button></div></header>
    <div className="editor-layout">
      <aside className="model-rail"><h2>選擇款式</h2><div className="model-options">{models.map(m=><button key={m.id} aria-label={`選擇 ${m.id} 款`} aria-pressed={model.id===m.id} className={`model-option ${model.id===m.id?'selected':''}`} onClick={()=>changeModel(m.id)}><img src={`/assets/product-thumb-${m.id}.webp`} alt={`${m.id} 款 ${m.name}`} loading="lazy"/><span>{m.id}</span></button>)}</div>
        {model.id==='F'?<div className="variant-choice"><h2>獎牌款式</h2><div className="shape-options">{shapeChoices.map(v=><button key={v.id} aria-pressed={shape===v.id} className={shape===v.id?'selected':''} onClick={()=>{setShape(v.id);setSelectedId('title')}}>{v.name}</button>)}</div></div>:null}
        <div className="product-finishes"><h2>產品選項</h2><FinishOptions scene={scene} onChange={setFinish}/></div>
        <div className="surface-choice"><h2>編輯區域</h2>{scene.surfaces.map(s=><button key={s.id} className={surface.id===s.id?'selected':''} aria-pressed={surface.id===s.id} onClick={()=>{setActiveId(s.id);setSelectedId('title')}}><span className="surface-mark"/>{s.name}</button>)}</div>
        <button className="text-control reference-button" onClick={()=>setReference(true)}>官網線稿與實品<Icon name="expand" size={15}/></button><p className="rail-note">{Array.isArray(model.dimensions_mm)?model.dimensions_mm.map(v=>v/10).join(' × ')+' cm':'Ø8 × 厚1 cm'}<br/>色澤與紋理依實品為準</p>{hasLegacy?<button className="text-control legacy-restore" onClick={()=>{history.change(readDraft(true));notify('已載入原版草稿，可按復原回到剛才的版本。')}}>載入原版草稿</button>:null}
      </aside>
      <main className="preview-workspace"><div className="workspace-toolbar"><h2>{model.id}<span>/</span>{model.name}</h2><div className="history-controls"><button className="icon-button" aria-label="復原" disabled={!history.canUndo} onClick={history.undo}><Icon name="undo"/></button><button className="icon-button" aria-label="重做" disabled={!history.canRedo} onClick={history.redo}><Icon name="redo"/></button></div></div>
        <DualPreview scene={scene} documents={documents} surface={surface} selectedId={selectedId} mode={mode} onMode={setMode} onSurface={id=>{setActiveId(id);setSelectedId('title')}} onSelect={setSelectedId} onPatch={patch} onCheckpoint={history.checkpoint} onOverflow={setOverflow} onAddText={addText} onUpload={()=>inputRef.current.click()} onDelete={remove}/>
        <p className={`preview-disclaimer ${overflow?'warning':''}`}>{overflow?'有內容超出客製範圍，請按「符合輪廓」調整。':'正面、3D、特寫與 PDF 使用同一份形狀及排版資料。'}<span>圖示重建預覽・實際製作由專人校稿</span></p>
      </main>
      <Inspector object={object} objects={objects} surface={surface} onPatch={changes=>patch(selectedId,changes)} onPatchLayer={patch} onSelect={setSelectedId} onDuplicate={duplicate} onDelete={remove} onReorder={reorder} onFit={fitSelected}/>
    </div>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上傳圖案檔案" className="file-input" onChange={upload}/>
    {notice?<div className="toast" role="status"><Icon name="check" size={18}/>{notice}</div>:null}
    {reference?<div className="modal-backdrop" onClick={()=>setReference(false)}><section className="reference-modal" role="dialog" aria-modal="true" aria-labelledby="reference-title" onClick={e=>e.stopPropagation()}><div><h2 id="reference-title">{model.id} 款・官方客製範圍</h2><button className="icon-button" aria-label="關閉客製範圍" onClick={()=>setReference(false)}><Icon name="close"/></button></div><img src={model.referenceImage} alt={`${model.id} 款官網紅色客製範圍線稿`}/><details><summary>對照原始實品照片</summary><img src={model.photo} alt={`${model.id} 款官網實品照片`}/></details><p>紅色表示可排版區，不代表整片皆為金屬。A 上區為木面，D 下區為石面，F 客製區為透明壓克力。</p><p className="small-copy">模型依公開線稿視覺重建；局部尺寸、斜度與留邊仍需製作圖確認。</p><a className="text-control" href={model.source_url} target="_blank" rel="noopener noreferrer">查看原商品介紹<Icon name="arrow" size={16}/></a></section></div>:null}
  </div>;
}
