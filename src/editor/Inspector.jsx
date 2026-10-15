import React from 'react';
import Icon from '../components/Icon.jsx';
function Field({label,children}) {return <label className="field"><span>{label}</span>{children}</label>}
export default function Inspector({object,objects,onPatch,onSelect,onDuplicate,onDelete,onReorder,surface}) {
  return <aside className="inspector"><h2>{object?.type==='image'?'圖案設定':'文字設定'}</h2>
    {object ? <div className="property-fields">
      {object.type==='text'?<>
        <Field label="文字內容"><textarea aria-label="文字內容" value={object.text} onChange={event=>onPatch({text:event.target.value.slice(0,300)})} rows={3}/></Field>
        <Field label="字體"><select aria-label="字體" value={object.font} onChange={event=>onPatch({font:event.target.value})}><option value="sans">黑體・清晰簡潔</option><option value="serif">明體・經典優雅</option></select></Field>
        <Field label={`字級 ${Math.round(object.fontSize)}`}><input aria-label="字級" type="range" min="14" max="200" value={object.fontSize} onChange={event=>onPatch({fontSize:Number(event.target.value)})}/></Field>
        <div className="split-field"><span>文字對齊</span><div className="segmented">{['left','center','right'].map((align,i)=><button key={align} aria-label={['靠左對齊','置中對齊','靠右對齊'][i]} aria-pressed={object.align===align} onClick={()=>onPatch({align})}><Icon name={align}/></button>)}</div><button className={`weight-control ${object.bold?'active':''}`} aria-label="粗體" aria-pressed={object.bold} onClick={()=>onPatch({bold:!object.bold})}>B</button></div>
        <Field label="文字顏色"><div className="color-field"><input aria-label="文字顏色" type="color" value={object.color} onChange={event=>onPatch({color:event.target.value})}/><span>{object.color.toUpperCase()}</span></div></Field>
      </>:<>
        <p className="small-copy">{object.name||'上傳圖案'}<br/>拖曳圖案即可調整位置。</p>
        <Field label={`圖案大小 ${Math.round(object.width)}`}><input aria-label="圖案大小" type="range" min="40" max="800" value={object.width} onChange={event=>{const width=Number(event.target.value);onPatch({width,height:width*object.height/object.width})}}/></Field>
      </>}
      <Field label={`旋轉 ${Math.round(object.rotation)}°`}><input aria-label="旋轉角度" type="range" min="-180" max="180" value={object.rotation} onChange={event=>onPatch({rotation:Number(event.target.value)})}/></Field>
      <div className="object-actions"><button className="outline compact" onClick={()=>onPatch({x:surface.width/2,y:surface.height/2})}>銘版置中</button><button className="icon-button" aria-label="複製物件" onClick={onDuplicate}><Icon name="copy"/></button><button className="icon-button" aria-label="刪除物件" onClick={onDelete}><Icon name="trash"/></button></div>
    </div>:<p className="empty-selection">點選預覽中的文字或圖案，<br/>開始調整你的排版。</p>}
    <div className="layer-panel"><h2>圖層管理 <span>{objects.length}</span></h2><div className="layers">{[...objects].reverse().map(o=><button key={o.id} className={`layer-row ${o.id===object?.id?'selected':''}`} onClick={()=>onSelect(o.id)}><Icon name={o.type==='image'?'image':'text'} size={16}/><span>{o.type==='text'?o.text||'空白文字':o.name||'圖案'}</span><span className="layer-dot"/></button>)}</div><div className="layer-actions"><button className="text-control" disabled={!object} onClick={()=>onReorder(1)}><Icon name="up" size={16}/>上移一層</button><button className="text-control" disabled={!object} onClick={()=>onReorder(-1)}><Icon name="down" size={16}/>下移一層</button></div></div>
  </aside>;
}
