import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {drawObject,polygonPath,renderCanonicalSurface} from './canonicalRender.js';
import {loadImage} from './render.js';
import {hitObject,objectBounds,fontFamilies} from './geometry.mjs';
import Icon from '../components/Icon.jsx';

// The plate, large, as the one place to edit. Point at text or a graphic to pick it, drag to move,
// pull a corner to resize, pull the round knob to rotate (it settles on 0/45/90°; Shift steps 15°).
// Objects may run past the outline: the part outside is painted red here and is left out of the
// preview, the PDF and the EPS. Only an object's centre stays on the plate.
// V5 (2026-11-06), direct handling: a small toolbar rides above the picked object (size, bold, centre,
// copy, delete, edit); double-click or Enter edits text in place, set in the same face, size, spacing
// and angle as on the plate; dragging snaps to the plate's centre lines and to other objects' centres
// (hold Alt to place freely), with a guide line shown. The plate is drawn at the screen's density.
const HANDLES=['nw','ne','se','sw'],SPILL=.5,SPILL_RES=.5,SNAP=7;
export default function PlateStage({surface,objects,selectedId,measure,outside,inline,onInline,onSelect,onPatch,onCheckpoint,onDelete,onDuplicate,onCenter,onEditText}){
  const box=useRef(null),plate=useRef(null),canvas=useRef(null),spill=useRef(null),drag=useRef(null),sequence=useRef(0),shown=useRef(null),field=useRef(null);
  const [size,setSize]=useState({w:0,h:0}),[loading,setLoading]=useState(true),[hover,setHover]=useState(null),[error,setError]=useState(''),[guides,setGuides]=useState(null);
  useLayoutEffect(()=>{const observer=new ResizeObserver(([entry])=>setSize({w:entry.contentRect.width,h:entry.contentRect.height}));observer.observe(box.current);return()=>observer.disconnect()},[]);
  // Margin around the plate (in surface units) where spilled parts can still be seen.
  const margin=Math.max(surface.width,surface.height)*SPILL;
  const pad=size.w<520?18:56,scale=Math.max(.05,Math.min((size.w-pad*2)/surface.width,(size.h-pad*2)/surface.height));
  // Pixels per surface unit on this screen, in steps so resizing does not redraw on every frame.
  const density=Math.max(1,Math.min(3,Math.ceil(scale*(window.devicePixelRatio||1)*2)/2));
  const editing=objects.find(o=>o.id===inline&&o.type==='text');
  useEffect(()=>{
    // The veil only covers a new plate; edits redraw underneath without flashing it.
    let live=true;const token=++sequence.current;if(shown.current!==surface){shown.current=surface;setLoading(true)}
    const spilled=objects.filter(o=>outside.has(o.id));
    // The text being typed is drawn by the field over it, not twice.
    const drawn=editing?objects.map(o=>o.id===editing.id?{...o,hidden:true}:o):objects;
    Promise.all([renderCanonicalSurface(surface,drawn,{selection:null,scale:density}),Promise.all(spilled.filter(o=>o.type==='image').map(async o=>[o.src,await loadImage(o.src)]))]).then(([result,images])=>{
      if(!live||token!==sequence.current||!canvas.current)return;
      canvas.current.width=result.canvas.width;canvas.current.height=result.canvas.height;canvas.current.getContext('2d').drawImage(result.canvas,0,0);
      // Spill layer: the outside objects as red silhouettes, with the plate itself cut away.
      const c=spill.current;
      if(c){
        c.width=Math.round((surface.width+margin*2)*SPILL_RES);c.height=Math.round((surface.height+margin*2)*SPILL_RES);
        const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
        if(spilled.length){
          const place=()=>{ctx.setTransform(SPILL_RES,0,0,SPILL_RES,margin*SPILL_RES,margin*SPILL_RES)};
          place();const map=new Map(images);spilled.forEach(o=>drawObject(ctx,o,map));
          ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle='rgba(214,58,38,.82)';ctx.fillRect(0,0,c.width,c.height);
          ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';place();polygonPath(ctx,surface.polygon,surface.width,surface.height);ctx.fill();
          ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';
        }
      }
      setLoading(false);setError('');
    }).catch(()=>{if(live){setError('銘版載入失敗，請重新整理。');setLoading(false)}});
    return()=>{live=false};
  },[surface,objects,outside,margin,density,editing?.id]);// eslint-disable-line react-hooks/exhaustive-deps
  // Opening the in-place editor: one undo step for the whole edit, caret at the end.
  useEffect(()=>{if(!editing)return;onCheckpoint();requestAnimationFrame(()=>{const f=field.current;if(f){f.focus();f.select()}})},[editing?.id]);// eslint-disable-line react-hooks/exhaustive-deps
  const selected=objects.find(o=>o.id===selectedId);
  const point=e=>{const r=plate.current.getBoundingClientRect();return [(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]};
  const topAt=p=>[...objects].reverse().find(o=>!o.hidden&&hitObject(o,...p,measure));
  // The whole stage takes the pointer, so a part hanging past the plate can still be grabbed.
  function begin(e,kind){
    if(e.target.closest('.st-float,.st-inline'))return;
    e.stopPropagation();if(editing)onInline(null);
    const p=point(e);let o=selected;
    if(kind==='move'){o=topAt(p);onSelect(o?.id||null)}
    if(!o||o.locked)return;
    onCheckpoint();box.current.setPointerCapture(e.pointerId);
    drag.current={kind,id:o.id,start:o,offset:[p[0]-o.x,p[1]-o.y],reach:Math.hypot(p[0]-o.x,p[1]-o.y)||1};
  }
  // Snap a dragged centre to the plate's centre lines and to the other objects' centres.
  function snap(id,x,y,free){
    if(free)return {x,y,guides:null};
    const reach=SNAP/scale,others=objects.filter(o=>o.id!==id&&!o.hidden);
    const pick=(value,targets)=>{let best=null;for(const t of targets){const d=Math.abs(t-value);if(d<=reach&&(!best||d<best.d))best={t,d}}return best?.t};
    const gx=pick(x,[surface.width/2,...others.map(o=>o.x)]),gy=pick(y,[surface.height/2,...others.map(o=>o.y)]);
    return {x:gx??x,y:gy??y,guides:gx==null&&gy==null?null:{x:gx,y:gy}};
  }
  function move(e){
    const d=drag.current;
    if(!d){const o=topAt(point(e));setHover(o?(o.locked?'locked':'object'):null);return}
    const p=point(e),o=d.start;
    if(d.kind==='move'){const s=snap(d.id,p[0]-d.offset[0],p[1]-d.offset[1],e.altKey);setGuides(s.guides);onPatch(d.id,{x:s.x,y:s.y},false)}
    else if(d.kind==='scale'){
      const k=Math.max(.05,Math.hypot(p[0]-o.x,p[1]-o.y)/d.reach);
      onPatch(o.id,o.type==='image'?{width:Math.max(10,o.width*k),height:Math.max(10,o.height*k)}:{fontSize:Math.max(3,Math.min(400,o.fontSize*k)),boxWidth:Math.min(surface.width*1.5,(o.boxWidth||surface.width*.8)*k)},false);
    }else{
      let angle=Math.atan2(p[1]-o.y,p[0]-o.x)*180/Math.PI+90;if(angle>180)angle-=360;
      const step=e.shiftKey?15:45,near=Math.round(angle/step)*step;
      if(e.shiftKey||Math.abs(angle-near)<4)angle=near;
      onPatch(o.id,{rotation:Math.round(angle*10)/10},false);
    }
  }
  function keyDown(e){
    if(!selected||e.target!==e.currentTarget)return;
    if(e.key.startsWith('Arrow')){e.preventDefault();if(selected.locked)return;const step=e.shiftKey?10:2;onPatch(selected.id,{x:selected.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),y:selected.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)})}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();onDelete()}
    else if(e.key==='Enter'&&selected.type==='text'&&!selected.locked){e.preventDefault();onEditText(selected.id)}
  }
  const end=()=>{drag.current=null;setGuides(null)};
  let frame=null,bar=null;
  if(selected&&!selected.hidden){
    const b=objectBounds(selected,measure),gap=6/scale,a=selected.rotation*Math.PI/180,w=(b.width+gap*2)*scale,h=(b.height+gap*2)*scale;
    frame={left:selected.x*scale,top:selected.y*scale,width:w,height:h,transform:`translate(-50%,-50%) rotate(${selected.rotation}deg)`};
    // The toolbar sits above the object's upright extent (clear of the rotate knob), or below it near the top.
    const half=(Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*h)/2,off=(size.w-surface.width*scale)/2,cx=Math.max(158-off,Math.min(size.w-158-off,selected.x*scale)),above=selected.y*scale-half-58>-pad+8;
    bar={left:cx,top:above?selected.y*scale-half-52:selected.y*scale+half+14};
  }
  const text=selected?.type==='text',fontStep=f=>Math.max(3,Math.min(400,Math.round(f*10)/10));
  const sizeBy=k=>{if(!selected||selected.locked)return;onPatch(selected.id,text?{fontSize:fontStep(selected.fontSize*k)}:{width:Math.max(10,selected.width*k),height:Math.max(10,selected.height*k)})};
  const finish=()=>onInline(null);
  return <div className={`st-stage${hover?' is-'+hover:''}`} ref={box} onPointerDown={e=>begin(e,'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerLeave={()=>{if(!drag.current)setHover(null)}}
    onDoubleClick={e=>{if(e.target.closest('.st-float,.st-inline'))return;const o=topAt(point(e));if(o?.type==='text'&&!o.locked){onSelect(o.id);onEditText(o.id)}}}>
    <div className={`st-plate${outside.size?' is-over':''}`} ref={plate} style={{width:surface.width*scale,height:surface.height*scale}} tabIndex={0} onKeyDown={keyDown}
      role="application" aria-label={`${surface.name}排版區：點選物件後拖曳移動，拉角落縮放，拉圓點旋轉；方向鍵微調，Enter 直接編輯文字，Delete 刪除。拖曳時會對齊中線，按住 Alt 可自由放置。超出銘版的部分以紅色顯示，不會製作。`}>
      <canvas ref={canvas} aria-hidden="true"/>
      <canvas ref={spill} className="st-spill" aria-hidden="true" style={{left:-margin*scale,top:-margin*scale,width:(surface.width+margin*2)*scale,height:(surface.height+margin*2)*scale}}/>
      <svg className="st-outline" viewBox={`0 0 ${surface.width} ${surface.height}`} preserveAspectRatio="none" aria-hidden="true"><polygon points={surface.polygon.map(([u,v])=>`${u*surface.width},${v*surface.height}`).join(' ')}/></svg>
      {guides?<>{guides.x!=null?<i className="st-guide is-v" style={{left:guides.x*scale}}/>:null}{guides.y!=null?<i className="st-guide is-h" style={{top:guides.y*scale}}/>:null}</>:null}
      {frame&&!editing?<div className={`st-frame${selected.locked?' is-locked':''}${outside.has(selected.id)?' is-out':''}`} style={frame}>
        {selected.locked?null:<>{HANDLES.map(h=><span key={h} className={`st-handle st-handle-${h}`} onPointerDown={e=>begin(e,'scale')}/>)}<span className="st-turn" onPointerDown={e=>begin(e,'rotate')}><i/></span></>}
      </div>:null}
      {editing?<textarea ref={field} className="st-inline" aria-label="直接編輯文字" value={editing.text} rows={Math.max(1,editing.text.split('\n').length)}
        onChange={e=>onPatch(editing.id,{text:e.target.value.slice(0,300)},false)}
        onKeyDown={e=>{if(e.key==='Escape'||(e.key==='Enter'&&(e.ctrlKey||e.metaKey))){e.preventDefault();finish();plate.current?.focus()}}}
        onBlur={finish}
        style={{left:editing.x*scale,top:editing.y*scale,width:(editing.writingMode==='vertical'?undefined:Math.max(objectBounds(editing,measure).width,editing.fontSize*2)*scale+4),height:(editing.writingMode==='vertical'?Math.max(objectBounds(editing,measure).height,editing.fontSize*2)*scale+4:undefined),
          transform:`translate(-50%,-50%) rotate(${editing.rotation}deg)`,font:`${editing.italic?'italic ':''}${editing.bold?600:400} ${editing.fontSize*scale}px/${editing.lineHeight||1.35} ${fontFamilies[editing.font]||fontFamilies.sans}`,
          letterSpacing:(editing.letterSpacing||0)*scale,color:editing.color,textAlign:editing.align||'center',textDecoration:editing.underline?'underline':'none',writingMode:editing.writingMode==='vertical'?'vertical-rl':'horizontal-tb'}}/>:null}
      {bar&&!editing&&!drag.current?<div className="st-float" role="toolbar" aria-label="快速調整" style={bar} onPointerDown={e=>e.stopPropagation()}>
        {selected.locked?<span className="st-float-note">已鎖定</span>:<>
          <button type="button" aria-label={text?'縮小文字':'縮小圖案'} title="縮小" onClick={()=>sizeBy(1/1.1)}><Icon name="minus" size={15}/></button>
          <span className="st-float-size">{text?Math.round(selected.fontSize):Math.round(selected.width)}</span>
          <button type="button" aria-label={text?'放大文字':'放大圖案'} title="放大" onClick={()=>sizeBy(1.1)}><Icon name="plus" size={15}/></button>
          {text?<><i aria-hidden="true"/><button type="button" className={selected.bold?'is-on':undefined} aria-pressed={!!selected.bold} aria-label="粗體" title="粗體" onClick={()=>onPatch(selected.id,{bold:!selected.bold})}><b>B</b></button>
          <button type="button" aria-label="編輯文字" title="編輯文字（Enter）" onClick={()=>onEditText(selected.id)}><Icon name="text" size={15}/></button></>:null}
          <i aria-hidden="true"/>
          <button type="button" aria-label="水平置中" title="水平置中" onClick={()=>onCenter('x')}><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 1.5v13M4 5h8v2.5H4zM2.5 9.5h11V12h-11z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg></button>
          <button type="button" aria-label="複製" title="複製（Ctrl+D）" onClick={onDuplicate}><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5H11" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg></button>
          <button type="button" aria-label="刪除" title="刪除（Delete）" onClick={onDelete}><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg></button>
        </>}
      </div>:null}
    </div>
    {loading?<span className="st-loading" role="status">正在更新銘版…</span>:null}
    {error?<p className="st-error" role="alert">{error}</p>:null}
  </div>;
}
