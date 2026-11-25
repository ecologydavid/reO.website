import React from 'react';
import {shopLink} from './navigation.js';
// v1.4.0 (owner, 2026-11-26): re.O has two doors and a visitor should know which is theirs. Company orders are agreed
// by e-mail; single pieces are sold by 匠子 CHANZ STUDIO, re.O's own lifestyle brand, on Pinkoi (new tab).
// Shown on 禮贈品訂製 and on the 匠子 page, the two places where both kinds of visitor arrive.
export default function DoorNote(){
 return <p className="rv-doors">企業訂製請<a href="mailto:service@re-o.co">來信</a>；單件零售請到 <a href={shopLink[1]} target="_blank" rel="noopener noreferrer">Pinkoi 匠子設計館<span className="sr-only">（另開新視窗）</span></a>。</p>;
}
