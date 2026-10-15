import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {makeCanvas,polygonPath,renderCanonicalProduct,renderCanonicalSurface} from './canonicalRender.js';
import {hitObject} from './geometry.mjs';
import {pointInPolygon} from './constraints.mjs';
const ThreePreview=lazy(()=>import('./ThreePreview.jsx'));
export default function DualPreview({scene,documents,surface,selectedId,mode,onMode,onSurface,onSelect,onPatch,onCheckpoint,onOverflow,onAddText,onUpload,onDelete}){
  const front=useRef(null),detail=useRef(null),frontResult=useRef(null),detailResult=useRef(null),drag=useRef(null),frontSequence=useRef(0),detailSequence=useRef(0);
  const [frontLoading,setFrontLoading]=useState(true),[detailLoading,setDetailLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{
    let live=true;const token=++frontSequence.current;setFrontLoading(true);
    renderCanonicalProduct(scene,documents,{width:780,height:1100,activeSurface:surface.id}).then(result=>{
      if(!live||token!==frontSequence.current)return;
      frontResult.current=result;if(front.current){front.current.width=result.canvas.width;front.current.height=result.canvas.height;front.current.getContext('2d').drawImage(result.canvas,0,0)}onOverflow(result.overflow);setFrontLoading(false);setError('');
    }).catch(()=>{if(live){setError('預覽載入失敗，請重新整理。');setFrontLoading(false)}});
    return()=>{live=false};
  },[scene,documents,surface.id,onOverflow,mode]);
  useEffect(()=>{
    let live=true;const token=++detailSequence.current;setDetailLoading(true);
    renderCanonicalSurface(surface,documents[surface.id]||[],{selection:selectedId}).then(result=>{
      if(!live||token!==detailSequence.current)return;
      const c=makeCanvas(1000,1100),ctx=c.getContext('2d');ctx.fillStyle='#eaece5';ctx.fillRect(0,0,c.width,c.height);
      const scale=Math.min(880/surface.width,980/surface.height),w=surface.width*scale,h=surface.height*scale,x=(1000-w)/2,y=(1100-h)/2;
      ctx.drawImage(result.canvas,x,y,w,h);ctx.save();ctx.translate(x,y);ctx.strokeStyle='#929b88';ctx.lineWidth=1.5;polygonPath(ctx,surface.polygon,w,h);ctx.stroke();ctx.restore();
      detailResult.current={x,y,width:w,height:h,canvasWidth:c.width,canvasHeight:c.height};
      if(detail.current){detail.current.width=c.width;detail.current.height=c.height;detail.current.getContext('2d').drawImage(c,0,0)}setDetailLoading(false);setError('');
    }).catch(()=>{if(live){setError('銘版載入失敗，請重新整理。');setDetailLoading(false)}});
    return()=>{live=false};
  },[surface,documents,selectedId]);
  function local(e){const d=detailResult.current,c=detail.current;if(!d||!c)return null;const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*c.width,py=(e.clientY-r.top)/r.height*c.height;return [(px-d.x)/d.width*surface.width,(py-d.y)/d.height*surface.height]}
  function pointerDown(e){if(detailLoading)return;const p=local(e);if(!p)return;const ctx=detail.current.getContext('2d'),o=[...(documents[surface.id]||[])].reverse().find(o=>!o.hidden&&hitObject(o,...p,ctx));onSelect(o?.id||null);if(o&&!o.locked){onCheckpoint();drag.current={id:o.id,offset:[p[0]-o.x,p[1]-o.y]};detail.current.setPointerCapture(e.pointerId)}}
  function pointerMove(e){if(!drag.current)return;const p=local(e);if(p)onPatch(drag.current.id,{x:p[0]-drag.current.offset[0],y:p[1]-drag.current.offset[1]},false)}
  function keyDown(e){if(!selectedId)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const o=documents[surface.id].find(o=>o.id===selectedId);if(!o||o.locked)return;const step=e.shiftKey?10:2;onPatch(o.id,{x:o.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),y:o.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)})}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();onDelete()}}
  function selectFront(e){const result=frontResult.current,c=front.current;if(!result||!c||frontLoading)return;const r=c.getBoundingClientRect(),p=[((e.clientX-r.left)/r.width*c.width-result.placement.x)/result.placement.scale,((e.clientY-r.top)/r.height*c.height-result.placement.y)/result.placement.scale];const s=[...scene.surfaces].reverse().find(s=>pointInPolygon((p[0]-s.x)/s.displayWidth,(p[1]-s.y)/s.displayHeight,s.polygon));if(s)onSurface(s.id)}
  return <div className="dual-preview">
    <section className="overall-panel" aria-labelledby="overall-title"><div className="preview-panel-title"><h2 id="overall-title">整體預覽</h2><div className="preview-mode" aria-label="整體預覽方式"><button className={mode==='front'?'selected':''} aria-pressed={mode==='front'} onClick={()=>onMode('front')}>正面平面</button><button className={mode==='three'?'selected':''} aria-pressed={mode==='three'} onClick={()=>onMode('three')}>3D 模型</button></div></div><div className="overall-artboard" aria-busy={mode==='front'?frontLoading:undefined}>{mode==='front'?<><canvas ref={front} aria-label={`${scene.id} 款正面整體預覽，點選客製區可切換編輯`} onPointerDown={selectFront}/>{frontLoading?<span className="artboard-loading">正在更新正面預覽…</span>:null}</>:<Suspense fallback={<div className="artboard-loading">正在載入 3D…</div>}><ThreePreview scene={scene} documents={documents}/></Suspense>}</div><p className="panel-caption">{mode==='front'?'點選獎盃上的客製區，右側同步編輯。':'由官網線稿重建的互動模型，細節以實品為準。'}</p></section>
    <section className="detail-panel" aria-labelledby="detail-title"><div className="preview-panel-title"><h2 id="detail-title">銘版特寫</h2><span>{surface.name}</span></div><div className="detail-artboard" aria-busy={detailLoading}><canvas ref={detail} aria-label={`${scene.id} 款 ${surface.name} 排版編輯區，可拖曳或用方向鍵移動`} tabIndex={0} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onKeyDown={keyDown}/>{detailLoading?<span className="artboard-loading">正在更新銘版…</span>:null}</div><div className="detail-add-controls"><button className="outline compact" onClick={onAddText}>新增文字</button><button className="outline compact" onClick={onUpload}>上傳圖案</button></div><p className="panel-caption">拖曳排版・方向鍵微調・內容限制於客製輪廓內{surface.material==='acrylic'?<span className="material-view-note">透明材質以灰色襯底檢視，並非實品底色。</span>:null}</p></section>
    {error?<p className="preview-error" role="alert">{error}</p>:null}
  </div>;
}
