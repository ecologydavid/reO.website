import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {renderCanonicalProduct} from './canonicalRender.js';
import {pointInPolygon} from './constraints.mjs';
const ThreePreview=lazy(()=>import('./ThreePreview.jsx'));

// The whole product as it will look: the official front view (tap a plate to edit it) or the
// rotatable 3D reconstruction. Both read the same shapes and layout as the plate and the exports.
export default function ProductView({scene,documents,surface,mode,onMode,onSurface}){
  const front=useRef(null),result=useRef(null),sequence=useRef(0);
  const [loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{
    let live=true;const token=++sequence.current;
    renderCanonicalProduct(scene,documents,{width:780,height:1100,activeSurface:surface.id}).then(r=>{
      if(!live||token!==sequence.current)return;
      result.current=r;
      if(front.current){front.current.width=r.canvas.width;front.current.height=r.canvas.height;front.current.getContext('2d').drawImage(r.canvas,0,0)}
      setLoading(false);setError('');
    }).catch(()=>{if(live){setError('預覽載入失敗，請重新整理。');setLoading(false)}});
    return()=>{live=false};
  },[scene,documents,surface.id,mode]);
  function pick(e){
    const r=result.current,c=front.current;if(!r||!c)return;
    const box=c.getBoundingClientRect(),p=[((e.clientX-box.left)/box.width*c.width-r.placement.x)/r.placement.scale,((e.clientY-box.top)/box.height*c.height-r.placement.y)/r.placement.scale];
    const s=[...scene.surfaces].reverse().find(s=>pointInPolygon((p[0]-s.x)/s.displayWidth,(p[1]-s.y)/s.displayHeight,s.polygon));if(s)onSurface(s.id);
  }
  return <div className="st-view">
    <div className="st-switch" role="group" aria-label="成品預覽方式">{[['front','正面'],['three','3D 旋轉']].map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>onMode(id)}>{label}</button>)}</div>
    <div className="st-view-board" aria-busy={mode==='front'?loading:undefined}>
      {mode==='front'?<><canvas ref={front} aria-label={`${scene.id} 款正面預覽，點選銘版可切換編輯區域`} onPointerDown={pick}/>{loading?<span className="st-loading">正在更新預覽…</span>:null}</>
        :<Suspense fallback={<span className="st-loading">正在載入 3D…</span>}><ThreePreview scene={scene} documents={documents}/></Suspense>}
      {error?<p className="st-error" role="alert">{error}</p>:null}
    </div>
  </div>;
}
