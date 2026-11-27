import React from 'react';
import './statement.css';
// The words under a page's first heading (v1.10.0, owner 2026-11-28: the grey paragraph under each title read as
// machine-made; he asked for it to be set with care). One way of setting them, on every landing page and article:
//   • the first sentence is the statement: Ming, a size up, in ink;
//   • what follows is the note: reading text, each sentence starting a line of its own;
//   • a line turns only after punctuation. A clause (up to ，：；。) holds together when it is short enough for a
//     line; a longer one holds piece by piece at its 、 (a list of names turns between names, never inside one).
//     So no name or figure is cut in two and no line ends on a stranded word. Where the column is too narrow for
//     that (phones, tablets), the text flows as ordinary text: statement.css decides by the column's own width.
// The words themselves are not touched: on landing pages they are the approved descriptions (pageMeta.js `written`).
const sentences=text=>text.match(/[^。！？]+[。！？]*/g)||[text];
const clauses=text=>text.match(/[^，。；：！？]+[，。；：！？」』）]*/g)||[text];
const pieces=text=>text.match(/[^、）]+[、），。；：！？」』]*/g)||[text];
// A piece still too long for a line is left to flow: holding it would leave the line before it half empty.
// A phrase is measured as it is set: a Chinese character is one wide, a Latin letter, figure or space about half.
const wide=text=>[...text].reduce((n,c)=>n+(c.codePointAt(0)<0x2000?.55:1),0);
// After a colon the line turns (where phrases are held): what the colon announces starts a line of its own.
// `max` is the widest phrase kept whole, in characters of the column it is set in; `hold` the class that holds it.
export function Held({text,max=22.5,hold='st-hold'}){const all=clauses(text).flatMap(c=>wide(c)<=max?[c]:pieces(c));return all.map((p,i)=><React.Fragment key={i}>{wide(p)>max?p:<span className={hold}>{p}</span>}{hold==='st-hold'&&p.endsWith('：')&&i<all.length-1&&<br className="st-turn"/>}</React.Fragment>)}
// `lead`: the longest first sentence still set as a statement. A long migrated summary (several lines of running
// text) is not a statement and is set as reading text instead.
export default function Statement({text,className='',lead=80}){
 if(!text)return null;
 const all=sentences(text.trim()),first=all[0].length<=lead?all[0]:null,rest=first?all.slice(1):all,short=rest.join('').length<=110;
 return <div className={`st ${className}`.trim()}>
  {first&&<p className="st-lead"><Held text={first}/></p>}
  {!!rest.length&&(short?<p className="st-more">{rest.map((s,i)=><span key={i}><Held text={s}/></span>)}</p>:<p className="st-body">{rest.join('')}</p>)}
 </div>;
}
