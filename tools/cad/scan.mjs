// node scan.mjs <model> <outPrefix> [finishLabel] — render the studio's 3D view from 12 angles (front, sides,
// back, top, low, grazing on the plate, close-ups, far) and tile them into <outPrefix>-sheet.png.
import {writeFileSync} from 'node:fs';
const [model,prefix,finish,viewsArg]=process.argv.slice(2);
const target=await (await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map(),logs=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}else if(m.method==='Runtime.exceptionThrown')logs.push('EXC '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text).slice(0,200));else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')logs.push('ERR '+m.params.args.map(a=>a.value??a.description).join(' ').slice(0,200))};
const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async x=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});return r.result?.result?.value??r.result?.exceptionDetails?.exception?.description};
const wait=t=>new Promise(r=>setTimeout(r,t));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send('Runtime.enable');await send('Page.navigate',{url:'http://127.0.0.1:8787/#/preview/'+model});await wait(4500);
if(finish)console.log('finish',await ev(`(()=>{const b=[...document.querySelectorAll('.st-swatch')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(finish)});b?.click();return !!b})()`));
await ev("[...document.querySelectorAll('.st-switch button')][1].click(),document.querySelector('.st-pip-swap').click(),1");await wait(6500);
const rect=await ev("(()=>{const r=document.querySelector('.st-slot-product').getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()");
const views=viewsArg?JSON.parse(viewsArg):[['front',0,0,1],['front-left 35°',-35,12,1],['right side',90,5,1],['back',180,8,1],['left side',-90,5,1],['top',20,80,1.1],['low',25,-28,1],['back ¾',140,25,1],
 ['grazing plate',78,3,.55,'plate'],['plate close',12,4,.32,'plate'],['plate edge close',-55,-8,.26,'plate'],['far',30,15,3.2]];
const shots=[];
for(const [name,az,el,dist,aim] of views){
 const r=await ev(`(()=>{const s=window.__studio3d;if(!s?.group)return 'no group';const c=s.controls;c.minPolarAngle=0;c.maxPolarAngle=Math.PI;c.minDistance=.2;c.maxDistance=60;
  let t=[0,0,0];const aim=${JSON.stringify(aim||'')};if(Array.isArray(aim)){const b=new (s.group.children[0].geometry.boundingBox?.constructor||Object)();const bb={min:[1e9,1e9,1e9],max:[-1e9,-1e9,-1e9]};s.group.traverse(o=>{if(o.isMesh&&o.userData.part){o.geometry.computeBoundingBox();const g=o.geometry.boundingBox;bb.min=[Math.min(bb.min[0],g.min.x),Math.min(bb.min[1],g.min.y),Math.min(bb.min[2],g.min.z)];bb.max=[Math.max(bb.max[0],g.max.x),Math.max(bb.max[1],g.max.y),Math.max(bb.max[2],g.max.z)]}});t=[0,1,2].map(k=>bb.min[k]+(bb.max[k]-bb.min[k])*aim[k])}else if(aim==='plate'){const p=s.group.userData.plates[0];p.geometry.computeBoundingSphere();const cc=p.geometry.boundingSphere.center;t=[cc.x,cc.y,cc.z]}
  s.reframe();const base=s.camera.position.length();const R=base*${dist},a=${az}*Math.PI/180,e=${el}*Math.PI/180;
  c.target.set(...t);s.camera.position.set(t[0]+R*Math.cos(e)*Math.sin(a),t[1]+R*Math.sin(e),t[2]+R*Math.cos(e)*Math.cos(a));s.camera.lookAt(...t);c.update();s.invalidate();return 'ok'})()`);
 await wait(500);
 const shot=await send('Page.captureScreenshot',{format:'png',clip:{x:rect[0],y:rect[1],width:rect[2],height:rect[3],scale:1}});
 const file=`${prefix}-${shots.length}.png`;writeFileSync(file,Buffer.from(shot.result.data,'base64'));shots.push([name,file]);if(r!=='ok')logs.push(name+': '+r);
}
// contact sheet
const fs=await import('node:fs');
const html=`<body style="margin:0;background:#777;display:grid;grid-template-columns:repeat(4,1fr);gap:3px;width:1600px;font:12px sans-serif">`+shots.map(([n,f])=>`<div style="position:relative;background:#fff"><img style="width:100%;display:block" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"><span style="position:absolute;left:4px;top:4px;background:#000a;color:#fff;padding:2px 6px">${n}</span></div>`).join('')+'</body>';
const {frameTree}=(await send('Page.getFrameTree')).result;await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.setDocumentContent',{frameId:frameTree.frame.id,html});await wait(800);
const s=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(prefix+'-sheet.png',Buffer.from(s.result.data,'base64'));
console.log(logs.join('\n')||'no errors');
await fetch('http://127.0.0.1:9333/json/close/'+target.id);ws.close();
