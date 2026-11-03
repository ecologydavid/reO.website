import React from 'react';
import Icon from '../components/Icon.jsx';
import {fontFamilies} from './geometry.mjs';

// Settings for the picked object, in the order people reach for them: what it says, the typeface,
// how big, style and alignment, colour. Spacing, box width, exact position and angle wait under
// 進階設定. With nothing picked it explains the plate gestures and offers to add something.
const FONTS=[['sans','黑體'],['serif','明體'],['kai','楷體'],['arial','Arial'],['georgia','Georgia'],['mono','Courier']];
const INKS=[['#252d28','深墨'],['#f5f3ed','米白'],['#a8874a','香檳金'],['#8a8f88','霧灰']];
function Field({label,children,id}){return <div className="st-field"><span className="st-label" id={id}>{label}</span>{children}</div>}
function Range({label,value,min,max,step=1,onChange,unit=''}){
  const set=v=>{if(Number.isFinite(v))onChange(Math.max(min,Math.min(max,v)))};
  return <div className="st-range"><input type="range" aria-label={label} min={min} max={max} step={step} value={Math.max(min,Math.min(max,value))} onChange={e=>set(e.target.valueAsNumber)}/><label><input type="number" aria-label={`${label}數值`} min={min} max={max} step={step} value={Math.round(value*100)/100} onChange={e=>{if(e.target.value!=='')set(e.target.valueAsNumber)}}/>{unit?<span>{unit}</span>:null}</label></div>;
}
function NumberBox({label,value,min,max,step=1,onChange}){return <label className="st-number"><span>{label}</span><input type="number" min={min} max={max} step={step} value={Math.round(value*100)/100} onChange={e=>{if(e.target.value!==''&&Number.isFinite(e.target.valueAsNumber))onChange(Math.max(min,Math.min(max,e.target.valueAsNumber)))}}/></label>}
function Toggle({label,pressed,onClick,children}){return <button type="button" className="st-tog" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>{children}</button>}

export default function Inspector({object,outside,objects,surface,onPatch,onPatchLayer,onSelect,onDuplicate,onDelete,onReorder,onFit,onAddText,onUpload,onCenter}){
  const locked=object?.locked,text=object?.type==='text';
  return <aside className="st-inspector" aria-label="物件設定">
    {object?<>
      <header className="st-panel-head"><h2>{text?'文字':'圖案'}</h2>
        <div className="st-quick">
          <button type="button" onClick={()=>onCenter('x')} disabled={locked} title="左右置中" aria-label="左右置中"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v16M5 6h10v3H5zM7 11h6v3H7z"/></svg></button>
          <button type="button" onClick={()=>onCenter('y')} disabled={locked} title="上下置中" aria-label="上下置中"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10h16M6 5v10h3V5zM11 7v6h3V7z"/></svg></button>
          <button type="button" onClick={onDuplicate} title="複製" aria-label="複製物件"><Icon name="copy" size={17}/></button>
          <button type="button" onClick={onDelete} disabled={locked} title="刪除" aria-label="刪除物件"><Icon name="trash" size={17}/></button>
        </div>
      </header>
      {locked?<p className="st-locked">已鎖定，避免誤移。<button type="button" onClick={()=>onPatch({locked:false})}>解除鎖定</button></p>:null}
      {outside?<p className="st-out" role="status">有部分超出銘版，紅色部分不會製作。{locked?null:<button type="button" onClick={onFit}>放回銘版內</button>}</p>:null}
      <fieldset className="st-fields" disabled={locked}>
        {text?<>
          <Field label="內容"><textarea id="st-text-input" aria-label="文字內容" rows={3} value={object.text} onChange={e=>onPatch({text:e.target.value.slice(0,300)})}/></Field>
          <Field label="字體" id="st-font-label"><div className="st-fonts" role="group" aria-labelledby="st-font-label">{FONTS.map(([id,name])=><button type="button" key={id} aria-pressed={object.font===id} onClick={()=>onPatch({font:id})}><b style={{fontFamily:fontFamilies[id]}}>{['arial','georgia','mono'].includes(id)?'Ag':'永'}</b><span>{name}</span></button>)}</div></Field>
          <Field label="大小"><Range label="字級" value={object.fontSize} min={3} max={240} onChange={fontSize=>onPatch({fontSize})}/></Field>
          <Field label="樣式">
            <div className="st-tools">
              <div className="st-group"><Toggle label="粗體" pressed={!!object.bold} onClick={()=>onPatch({bold:!object.bold})}><b>B</b></Toggle><Toggle label="斜體" pressed={!!object.italic} onClick={()=>onPatch({italic:!object.italic})}><i>I</i></Toggle><Toggle label="底線" pressed={!!object.underline} onClick={()=>onPatch({underline:!object.underline})}><u>U</u></Toggle></div>
              <div className="st-group">{['left','center','right'].map((align,i)=><Toggle key={align} label={['靠左','置中','靠右'][i]} pressed={(object.align||'center')===align} onClick={()=>onPatch({align})}><Icon name={align} size={17}/></Toggle>)}</div>
              <div className="st-group">{[['horizontal','橫'],['vertical','直']].map(([mode,name])=><Toggle key={mode} label={name+'排'} pressed={(object.writingMode||'horizontal')===mode} onClick={()=>onPatch({writingMode:mode})}>{name}</Toggle>)}</div>
            </div>
          </Field>
          <Field label="顏色" id="st-ink-label">
            <div className="st-inks" role="group" aria-labelledby="st-ink-label">
              <button type="button" className="st-ink-auto" aria-pressed={object.autoColor!==false} onClick={()=>onPatch({color:surface.ink,autoColor:true})}><i style={{background:surface.ink}}/>依材質</button>
              {INKS.map(([hex,name])=><button type="button" key={hex} aria-label={name} title={name} aria-pressed={object.autoColor===false&&object.color.toLowerCase()===hex} onClick={()=>onPatch({color:hex})}><i style={{background:hex}}/></button>)}
              <label className="st-ink-custom" title="自訂顏色"><input type="color" aria-label="自訂文字顏色" value={object.color} onChange={e=>onPatch({color:e.target.value})}/><span>{object.color.toUpperCase()}</span></label>
            </div>
          </Field>
        </>:<>
          <p className="st-file">{object.name||'上傳圖案'}</p>
          <Field label="大小"><Range label="圖案寬度" value={object.width} min={10} max={surface.width} onChange={width=>onPatch({width,height:width*object.height/object.width})}/></Field>
        </>}
        <details className="st-more">
          <summary>進階設定<Icon name="chevronDown" size={16}/></summary>
          <div className="st-more-grid">
            {text?<><NumberBox label="行距" value={object.lineHeight||1.35} min={.8} max={3} step={.05} onChange={lineHeight=>onPatch({lineHeight})}/><NumberBox label="字距" value={object.letterSpacing||0} min={-2} max={40} onChange={letterSpacing=>onPatch({letterSpacing})}/><NumberBox label="文字框寬度" value={object.boxWidth||surface.width*.8} min={30} max={surface.width} onChange={boxWidth=>onPatch({boxWidth})}/></>:null}
            <NumberBox label="旋轉角度" value={object.rotation} min={-180} max={180} onChange={rotation=>onPatch({rotation})}/>
            <NumberBox label="水平位置" value={object.x} min={0} max={surface.width} onChange={x=>onPatch({x})}/>
            <NumberBox label="垂直位置" value={object.y} min={0} max={surface.height} onChange={y=>onPatch({y})}/>
          </div>
          <button type="button" className="st-text-btn" onClick={onFit}>放回銘版中央並調整大小</button>
        </details>
      </fieldset>
    </>:<div className="st-empty">
      <h2>開始排版</h2>
      <ol><li>點選銘版上的文字或圖案</li><li>拖曳移動，拉角落縮放，拉圓點旋轉</li><li>雙擊文字可直接修改內容</li></ol>
      <div className="st-empty-actions"><button type="button" className="st-btn st-btn-ghost" onClick={onAddText}><Icon name="text" size={17}/>新增文字</button><button type="button" className="st-btn st-btn-ghost" onClick={onUpload}><Icon name="image" size={17}/>上傳圖案</button></div>
    </div>}
    <section className="st-layers" aria-labelledby="st-layers-title">
      <header className="st-panel-head"><h2 id="st-layers-title">圖層<span>{objects.length}</span></h2>
        <div className="st-quick"><button type="button" disabled={!object} onClick={()=>onReorder(1)} title="上移一層" aria-label="上移一層"><Icon name="up" size={16}/></button><button type="button" disabled={!object} onClick={()=>onReorder(-1)} title="下移一層" aria-label="下移一層"><Icon name="down" size={16}/></button></div>
      </header>
      <ul>{[...objects].reverse().map(o=><li key={o.id} className={o.id===object?.id?'is-on':''}>
        <button type="button" className="st-layer" onClick={()=>onSelect(o.id)} aria-current={o.id===object?.id?'true':undefined}><Icon name={o.type==='image'?'image':'text'} size={15}/><span>{o.type==='text'?o.text.replace(/\n/g,' ')||'空白文字':o.name||'圖案'}</span></button>
        <button type="button" className="st-lock" aria-pressed={!!o.locked} aria-label={`${o.locked?'解鎖':'鎖定'} ${o.type==='text'?o.text:o.name||'圖案'}`} title={o.locked?'解鎖':'鎖定'} onClick={()=>{onSelect(o.id);onPatchLayer(o.id,{locked:!o.locked})}}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d={o.locked?'M7 9V6.5a3 3 0 0 1 6 0V9':'M7 9V6.5a3 3 0 0 1 5.8-1'}/></svg>
        </button>
      </li>)}</ul>
    </section>
  </aside>;
}
