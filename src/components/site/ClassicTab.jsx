import React from 'react';
import {classicNames} from './classics.js';
import './classic-tab.css';
// The name tab inside a classic model's photograph (v48 on home; shared since v1.12.0, when the owner asked for the
// same label on the 公版獎盃 model row). The letter stays in its square; the rest of the name rises in letter by
// letter when the card comes into view and rolls over when the photograph is pointed at or focused.
// Home styles it through .rv-product (home-v10.css); elsewhere the link carries .ct-card (classic-tab.css).
export default function ClassicTab({id}){
 const tail=classicNames[id].slice(1);
 return <span className="rv-tab" aria-hidden="true"><b>{id}</b><span className="rv-tab-tail">{[...tail].map((ch,i)=><i key={i} style={{'--i':i}}><span data-ch={ch}>{ch}</span></i>)}</span></span>;
}
