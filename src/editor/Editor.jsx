import React,{useMemo,useState,useRef,useCallback} from 'react';
import models from '../data/models.json';
import {getLayout,layouts} from '../data/geometry.js';
import {defaultObjects} from './geometry.mjs';
import useHistory from './useHistory.js';
import PreviewCanvas from './PreviewCanvas.jsx';
import Inspector from './Inspector.jsx';
import Icon from '../components/Icon.jsx';

const STORAGE='reo-preview-draft-v1';
function readDraft() {
  try{
    const d=JSON.parse(localStorage.getItem(STORAGE));
    if(d?.version!==1||!d.documents||typeof d.documents!=='object')return {version:1,documents:{}};
    for(const [key,objects] of Object.entries(d.documents)){
      if(!/^[A-F]:(ridge|water|diamond):\w+$/.test(key)||!Array.isArray(objects)||objects.length>20)throw Error('Invalid draft');
      for(const o of objects)if(!['text','image'].includes(o.type)||![o.x,o.y,o.rotation].every(Number.isFinite)||(o.type==='text'&&(typeof o.text!=='string'||o.text.length>300||!Number.isFinite(o.fontSize)))||(o.type==='image'&&!/^data:image\/(png|jpeg|webp);base64,/.test(o.src)))throw Error('Invalid object');
    }
    return d;
  }catch{return {version:1,documents:{}};}
}
const keyFor=(modelId,variant,surfaceId)=>`${modelId}:${variant}:${surfaceId}`;
export default function Editor({modelId,onModelChange,onHome}) {
  const model=models.find(m=>m.id===modelId)||models[1];
  const history=useHistory(readDraft);
  const [variant,setVariant]=useState('ridge'),[activeId,setActiveId]=useState('main'),[selectedId,setSelectedId]=useState('title'),[mode,setMode]=useState('product');
  const [notice,setNotice]=useState(''),[overflow,setOverflow]=useState(false),[busy,setBusy]=useState(false),[reference,setReference]=useState(false);
  const inputRef=useRef(null),noticeTimer=useRef(null);
  const layout=getLayout(model.id,variant);
  const surface=layout.surfaces.find(s=>s.id===activeId)||layout.surfaces[0];
  const documents=useMemo(()=>Object.fromEntries(layout.surfaces.map(s=>{
    let seed=defaultObjects(s);
    if(model.id==='F')seed=seed.map((o,i)=>({...o,y:s.height*[.24,.40,.53][i]}));
    return [s.id,history.state.documents[keyFor(model.id,variant,s.id)]||seed];
  })),[layout,model.id,variant,history.state.documents]);
  const objects=documents[surface.id],object=objects.find(o=>o.id===selectedId);
  const notify=useCallback(message=>{setNotice(message);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4500)},[]);
  function updateObjects(updater,{record=true,surfaceId=surface.id}={}) {
    history.change(d=>{
      const key=keyFor(model.id,variant,surfaceId),current=d.documents[key]||documents[surfaceId]||[];
      return {...d,documents:{...d.documents,[key]:updater(current)}};
    },{record});
  }
  function patch(id,changes,record=true,surfaceId=surface.id) {updateObjects(list=>list.map(o=>o.id===id?{...o,...changes}:o),{record,surfaceId});}
  function addText() {
    if(objects.length>=20)return notify('每個區域最多可放置 20 個物件。');
    const o={...defaultObjects(surface)[1],id:crypto.randomUUID(),text:'新增文字',x:surface.width*.5,y:surface.height*.45};
    updateObjects(list=>[...list,o]);setSelectedId(o.id);
  }
  async function upload(event) {
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))return notify('請選擇 PNG、JPG 或 WebP 圖案。');
    if(file.size>3*1024*1024)return notify('圖案請小於 3 MB，建議使用透明背景 PNG。');
    if(objects.length>=20)return notify('每個區域最多可放置 20 個物件。');
    try{
      const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});
      const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
      const width=Math.min(surface.width*.32,surface.height*.32*image.width/image.height);
      const o={id:crypto.randomUUID(),type:'image',src,name:file.name.slice(0,60),x:surface.width*.5,y:surface.height*.42,width,height:width*image.height/image.width,rotation:0};
      updateObjects(list=>[...list,o]);setSelectedId(o.id);notify('圖案已加入，可拖曳或調整大小。');
    }catch{notify('無法讀取這個圖案，請改用 PNG 或 JPG。');}
  }
  function duplicate() {if(!object)return;if(objects.length>=20)return notify('每個區域最多可放置 20 個物件。');const o={...object,id:crypto.randomUUID(),x:object.x+20,y:object.y+20};updateObjects(list=>[...list,o]);setSelectedId(o.id)}
  function remove(){if(!object)return;updateObjects(list=>list.filter(o=>o.id!==object.id));setSelectedId(null)}
  function reorder(direction){if(!object)return;updateObjects(list=>{const a=[...list],i=a.findIndex(o=>o.id===object.id),j=i+direction;if(j>=0&&j<a.length)[a[i],a[j]]=[a[j],a[i]];return a})}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify({...history.state,modelId:model.id,variant}));notify('草稿已儲存在此瀏覽器。')}catch{notify('草稿空間不足，請減少圖案大小後再儲存。')}}
  async function download(){setBusy(true);try{const {exportPdf}=await import('./PdfExport.js');const pages=await exportPdf(model,layout,documents,model.id==='F'?layout.name:'');notify(`已下載 ${pages} 頁排版預覽 PDF。`)}catch(ex){notify(ex.message||'PDF 匯出失敗，請稍後重試。')}finally{setBusy(false)}}
  return <div className="editor-page">
    <header className="editor-header"><button className="wordmark" onClick={onHome} aria-label="re.O 回到首頁">re.O</button><h1>銘版排版預覽</h1><div className="editor-header-actions"><button className="text-control return-home" onClick={onHome}><Icon name="back"/>返回官網</button><button className="outline compact save-button" onClick={save}><Icon name="save"/>儲存草稿</button><button className="primary download-button" onClick={download} disabled={busy||overflow}><Icon name="download"/>{busy?'匯出中…':'下載 PDF'}</button></div></header>
    <div className="editor-layout">
      <aside className="model-rail"><h2>選擇款式</h2><div className="model-options">{models.map(m=><button key={m.id} aria-label={`選擇 ${m.id} 款`} aria-pressed={model.id===m.id} className={`model-option ${model.id===m.id?'selected':''}`} onClick={()=>{onModelChange(m.id);setActiveId('main');setSelectedId('title')}}><img src={m.photo} alt={`${m.id} 款${m.name}`} loading="lazy"/><span>{m.id}</span></button>)}</div>
        {model.id==='F'?<div className="variant-choice"><h2>獎牌款式</h2><div className="shape-options">{layouts.F.variants.map(v=><button key={v.id} aria-pressed={variant===v.id} className={variant===v.id?'selected':''} onClick={()=>{setVariant(v.id);setSelectedId('title')}}>{v.name}</button>)}</div></div>:null}
        <div className="surface-choice"><h2>編輯區域</h2>{layout.surfaces.map(s=><button key={s.id} className={surface.id===s.id?'selected':''} aria-pressed={surface.id===s.id} onClick={()=>{setActiveId(s.id);setSelectedId('title')}}><span className="surface-mark"/>{s.name}</button>)}</div>
        <div className="add-controls"><button className="outline" onClick={addText}><Icon name="text"/>新增文字</button><button className="outline" onClick={()=>inputRef.current.click()}><Icon name="image"/>上傳圖案</button><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上傳圖案檔案" className="file-input" onChange={upload}/></div>
        <button className="text-control reference-button" onClick={()=>setReference(true)}>查看官網客製範圍<Icon name="expand" size={16}/></button>
        <p className="rail-note">{model.id} 款・{model.name}<br/>{Array.isArray(model.dimensions_mm)?model.dimensions_mm.map(v=>v/10).join(' × ')+' cm':'Ø8 × 厚1 cm'}</p>
      </aside>
      <main className="preview-workspace"><div className="workspace-toolbar"><div className="view-tabs"><button className={mode==='product'?'selected':''} onClick={()=>setMode('product')}>整體預覽</button><button className={mode==='detail'?'selected':''} onClick={()=>setMode('detail')}>銘版特寫</button></div><div className="history-controls"><button className="icon-button" aria-label="復原" disabled={!history.canUndo} onClick={history.undo}><Icon name="undo"/></button><button className="icon-button" aria-label="重做" disabled={!history.canRedo} onClick={history.redo}><Icon name="redo"/></button></div></div>
        <PreviewCanvas model={model} layout={layout} documents={documents} activeSurface={surface.id} selectedId={selectedId} mode={mode} onSelect={(id,surfaceId)=>{setSelectedId(id);if(surfaceId)setActiveId(surfaceId)}} onPatch={patch} onCheckpoint={history.checkpoint} onOverflow={setOverflow}/>
        <p className={`preview-caption ${overflow?'warning':''}`} role={overflow?'alert':undefined}>{overflow?'部分內容超出客製範圍，請調整位置、字級或圖案大小。':'拖曳文字與圖案，讓每一份榮耀都獨一無二。'}</p><p className="preview-disclaimer">預覽確認稿・實際製作由專人校稿</p>
      </main>
      <Inspector object={object} objects={objects} surface={surface} onPatch={changes=>patch(selectedId,changes)} onSelect={setSelectedId} onDuplicate={duplicate} onDelete={remove} onReorder={reorder}/>
    </div>
    {notice?<div className="toast" role="status"><Icon name="check" size={18}/>{notice}</div>:null}
    {reference?<div className="modal-backdrop" onClick={()=>setReference(false)}><section className="reference-modal" role="dialog" aria-modal="true" aria-labelledby="reference-title" onClick={e=>e.stopPropagation()}><div><h2 id="reference-title">{model.id} 款・官網客製範圍</h2><button className="icon-button" aria-label="關閉客製範圍" onClick={()=>setReference(false)}><Icon name="close"/></button></div><img src={model.referenceImage} alt={`${model.id} 款官網紅色客製範圍線稿`}/><p>{model.zones}</p><p className="small-copy">照片預覽依此範圍定位；實際銘版尺寸與安全留邊仍需製作圖確認。</p><a className="text-control" href={model.source_url} target="_blank" rel="noopener noreferrer">查看原商品介紹<Icon name="arrow" size={16}/></a></section></div>:null}
  </div>;
}
