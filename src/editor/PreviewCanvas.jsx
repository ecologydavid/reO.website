import React,{useEffect,useRef,useState} from 'react';
import {renderProduct,photoQuad} from './render.js';
import {hitObject,invert,project,projection} from './geometry.mjs';

export default function PreviewCanvas({model,layout,documents,activeSurface,selectedId,mode,onSelect,onPatch,onCheckpoint,onOverflow}) {
  const canvasRef=useRef(null),renderRef=useRef(null),dragRef=useRef(null),sequence=useRef(0);
  const [error,setError]=useState(''),[completedModel,setCompletedModel]=useState(null);
  const loading=completedModel!==model.id;
  useEffect(()=>{
    const generation=++sequence.current;
    renderProduct(model,layout,documents,{width:1000,selectedSurface:activeSurface,selectedObject:selectedId,mode}).then(result=>{
      if(sequence.current!==generation)return;
      const visible=canvasRef.current;if(!visible)return;
      visible.width=result.canvas.width;visible.height=result.canvas.height;visible.getContext('2d').drawImage(result.canvas,0,0);
      renderRef.current=result;setCompletedModel(model.id);setError('');onOverflow(result.overflow);
    }).catch(ex=>{if(sequence.current===generation){setError(ex.message);setCompletedModel(model.id)}});
    return ()=>{sequence.current++};
  },[model,layout,documents,activeSurface,selectedId,mode,onOverflow]);
  function localPoint(event,surfaceId=activeSurface) {
    const c=canvasRef.current,result=renderRef.current;if(!c||!result)return null;
    const rect=c.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*c.width,y=(event.clientY-rect.top)/rect.height*c.height;
    const surface=layout.surfaces.find(s=>s.id===surfaceId)||layout.surfaces[0];
    if(mode==='detail'){
      const d=result.detail;return [(x-d.x)/d.width*surface.width,(y-d.y)/d.height*surface.height];
    }
    const matrix=invert(projection(photoQuad(surface,layout.crop,c.width,c.height)));
    const [u,v]=project(matrix,x,y);return [u*surface.width,v*surface.height];
  }
  function pointerDown(event) {
    if(!renderRef.current)return;
    const ctx=canvasRef.current.getContext('2d');
    let surfaceId=activeSurface;
    if(mode==='product'){
      for(const surface of [...layout.surfaces].reverse()){
        const p=localPoint(event,surface.id);
        if(p&&p[0]>=0&&p[0]<=surface.width&&p[1]>=0&&p[1]<=surface.height){surfaceId=surface.id;break;}
      }
    }
    const p=localPoint(event,surfaceId);if(!p)return;
    const o=[...(documents[surfaceId]||[])].reverse().find(o=>hitObject(o,p[0],p[1],ctx));
    onSelect(o?.id||null,surfaceId);
    if(o){onCheckpoint();dragRef.current={id:o.id,surfaceId,offset:[p[0]-o.x,p[1]-o.y]};canvasRef.current.setPointerCapture(event.pointerId)}
  }
  function pointerMove(event) {
    const drag=dragRef.current;if(!drag)return;
    const p=localPoint(event,drag.surfaceId);if(!p||!p.every(Number.isFinite))return;
    const surface=layout.surfaces.find(s=>s.id===drag.surfaceId);
    onPatch(drag.id,{x:Math.max(-surface.width/2,Math.min(surface.width*1.5,p[0]-drag.offset[0])),y:Math.max(-surface.height/2,Math.min(surface.height*1.5,p[1]-drag.offset[1]))},false,drag.surfaceId);
  }
  function keyDown(event) {
    if(!selectedId||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();const o=(documents[activeSurface]||[]).find(o=>o.id===selectedId);if(!o)return;
    const step=event.shiftKey?10:2;onPatch(o.id,{x:o.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),y:o.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0)});
  }
  return <div className="canvas-stage" aria-busy={loading}>
    {loading?<div className="canvas-loading">正在準備獎盃預覽…</div>:null}
    {error?<div className="canvas-error" role="alert">{error}</div>:null}
    <canvas ref={canvasRef} aria-label={`${model.id} 款銘版互動預覽，可拖曳文字圖案，或選取後用方向鍵移動`} tabIndex={0} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={()=>{dragRef.current=null}} onPointerCancel={()=>{dragRef.current=null}} onKeyDown={keyDown}/>
  </div>;
}
