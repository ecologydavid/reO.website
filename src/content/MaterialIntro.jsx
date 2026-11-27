import React,{useCallback,useEffect,useRef,useState} from 'react';
import {materials} from '../components/site/materials.js';
import './material-intro.css';
// v65 (owner, 2026-11-18): a material page opens on the material itself, full width, and the photograph is
// "crushed and reborn": it holds for a moment, comes apart, then gathers back into the picture. Drawn on a canvas
// from the page's own photo (no new imagery). The <img> underneath is the real picture: it is what search engines,
// reduced-motion visitors and the prerendered page get, and what remains once the canvas has finished.
//
// v66 (owner, 2026-11-19): each material comes apart the way that material does, not as the same squares nine times.
//   再生大理石  angular slabs crack along a fault line and drop, turning slowly (heavy)
//   回收玻璃    sharp triangles burst from one point of impact, spinning, edges catching light
//   退役木橫擔  long beams slide out left and right, row by row
//   咖啡渣      fine grounds pour down and settle at the bottom
//   水庫淤泥    the picture slumps and runs down in streams, like wet silt
//   煤灰        fine ash lifts and drifts upward, thinning as it goes
//   木屑        thin shavings are blown off to the right
//   木頭拼板    square panels turn on edge and lift away, diagonal by diagonal
//   焚化粒料    round pellets tumble down and scatter
// A piece is a polygon of the photo (pts) or a plain rectangle; `fx` says where it goes when fully apart (k = 1).
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=v=>Math.max(0,Math.min(.4,v));
const grid=(W,H,cols,each)=>{const size=W/cols,rows=Math.ceil(H/size),out=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)out.push(each({bx:x*size,by:y*size,bw:size,bh:size,cx:(x+.5)*size,cy:(y+.5)*size,x,y,cols,rows,size}));return out};
// Cells with shared, jittered corners, so the pieces are irregular but still fit together exactly.
const shards=(W,H,cols,jitter,split,each)=>{
 const size=W/cols,rows=Math.ceil(H/size),V=[];
 for(let y=0;y<=rows;y++){V.push([]);for(let x=0;x<=cols;x++)V[y].push([x*size+(x&&x<cols?rnd(-jitter,jitter)*size:0),y*size+(y&&y<rows?rnd(-jitter,jitter)*size:0)])}
 const out=[],piece=pts=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),bx=Math.min(...xs),by=Math.min(...ys),bw=Math.max(...xs)-bx,bh=Math.max(...ys)-by;
  out.push(each({pts,bx,by,bw,bh,cx:xs.reduce((a,b)=>a+b)/xs.length,cy:ys.reduce((a,b)=>a+b)/ys.length,size,cols,rows}))};
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=V[y][x],b=V[y][x+1],c=V[y+1][x+1],d=V[y+1][x];
  if(!split)piece([a,b,c,d]);else if(Math.random()<.5){piece([a,b,c]);piece([a,c,d])}else{piece([a,b,d]);piece([b,c,d])}}
 return out;
};
const effects={
 'material-recycled-marble':{out:950,back:1400,make:(W,H)=>shards(W,H,W<900?9:16,.3,false,p=>({...p,
   tx:(p.cx-W/2)*rnd(.15,.5),ty:rnd(-.05,.1)*H,g:rnd(.45,.95)*H,rot:rnd(-.9,.9),shrink:rnd(.75,.95),fade:.25,
   delay:clamp(Math.abs((p.cx-W*.5)*.5+(p.cy-H*.5))/H*.55+rnd(0,.05))}))},
 glass:{out:700,back:1300,edge:true,make:(W,H)=>{const ix=W*.62,iy=H*.42,reach=Math.hypot(W,H);return shards(W,H,W<900?10:18,.42,true,p=>{
   const dx=p.cx-ix,dy=p.cy-iy,d=Math.hypot(dx,dy)||1,far=rnd(.35,1.1);
   return {...p,tx:dx/d*reach*far*.55,ty:dy/d*reach*far*.5,g:rnd(.05,.3)*H,rot:rnd(-6,6),shrink:rnd(.3,.7),fade:.3,delay:clamp(d/reach*.5)}})}},
 'wooden-beam':{out:1000,back:1400,make:(W,H)=>{const rows=W<900?9:13,h=H/rows,out=[];
   for(let r=0;r<rows;r++){const cuts=[0,...[rnd(.25,.45),rnd(.55,.8)].slice(0,r%3?2:1).map(v=>v*W),W],dir=r%2?1:-1;
    for(let i=0;i<cuts.length-1;i++)out.push({bx:cuts[i],by:r*h,bw:cuts[i+1]-cuts[i],bh:h,cx:(cuts[i]+cuts[i+1])/2,cy:(r+.5)*h,size:h,
     tx:dir*W*rnd(.75,1.15),ty:rnd(-.3,.3)*h,g:0,rot:rnd(-.05,.05),shrink:1,fade:0,delay:clamp(r/rows*.36+i*.03)})}
   return out}},
 'coffee-waste':{out:1050,back:1500,make:(W,H)=>grid(W,H,W<900?38:68,p=>({...p,
   tx:rnd(-3,3)*p.size,ty:0,g:(H-p.cy)*rnd(.85,1.02)+rnd(0,.04)*H,rot:rnd(-2,2),shrink:rnd(.45,.8),fade:.1,
   delay:clamp((1-p.cy/H)*.3+rnd(0,.1))}))},
 'reservoir-silt':{out:1150,back:1500,make:(W,H)=>{const cols=W<900?30:52,stream=Array.from({length:cols},()=>rnd(0,.24));return grid(W,H,cols,p=>({...p,
   tx:0,ty:0,g:rnd(.35,.8)*H,amp:rnd(.6,2.4)*p.size,phase:rnd(0,6.3),rot:rnd(-.25,.25),shrink:rnd(.7,.95),stretchY:rnd(.6,1.6),fade:.45,
   delay:clamp(stream[p.x]+p.cy/H*.16)}))}},
 'fly-ash':{out:1200,back:1500,make:(W,H)=>grid(W,H,W<900?40:74,p=>({...p,
   tx:rnd(-.06,.14)*W,ty:-rnd(.3,.95)*H,g:0,amp:rnd(1,5)*p.size,phase:rnd(0,6.3),rot:rnd(-1.5,1.5),shrink:rnd(.15,.4),fade:.85,
   delay:clamp(p.cy/H*.2+rnd(0,.2))}))},
 'wood-chips':{out:1000,back:1450,make:(W,H)=>grid(W,H,W<900?36:64,p=>({...p,
   tx:rnd(.45,1.15)*W,ty:rnd(-.3,.22)*H,g:0,amp:rnd(1,4)*p.size,phase:rnd(0,6.3),rot:rnd(-3.5,3.5),shrink:1,stretchX:rnd(1.2,2.2),stretchY:rnd(-.7,-.45),fade:.3,
   delay:clamp((1-p.cx/W)*.3+rnd(0,.1))}))},
 'wood-veneer-panel':{out:1000,back:1400,make:(W,H)=>grid(W,H,W<900?7:12,p=>({...p,
   tx:0,ty:-rnd(.2,.5)*p.size,g:0,rot:0,shrink:1,flip:true,fade:.2,
   delay:clamp((p.x+p.y)/(p.cols+p.rows)*.4)}))},
 'incineration-aggergates':{out:1000,back:1450,make:(W,H)=>grid(W,H,W<900?16:28,p=>({...p,round:true,
   tx:rnd(-4,4)*p.size,ty:rnd(-.08,0)*H,g:(H-p.cy)*rnd(.7,1.05)+rnd(.05,.25)*H,rot:rnd(-5,5),shrink:rnd(.5,.85),fade:.15,
   delay:clamp(rnd(0,.3)+(1-p.cy/H)*.1)}))}
};
// v67 (owner, 2026-11-20: "an animation, not an effect on the picture"). The opening is now a short film in four acts:
//   1 the material's photo holds, then comes apart in that material's own way (the effects above) and its pieces fade;
//   2 the pieces become grains, coloured from the photo, that stream toward the right of the stage;
//   3 the grains pour into the re.O mark, drawn as the logo draws itself: counter-clockwise from just above the dot at
//     three o'clock, leaving the gap, then the dot;
//   4 the ring sets solid in the material's own texture, a light runs once round it, and the photo returns.
// About 5.4s. Nothing is generated: every colour and texture comes from the page's photo.
// v68 (owner, 2026-11-21): the mark follows the real logo (measured on public/assets/reo-logo.png): a slim ring, the dot
// just inside the ring line at three o'clock with clear space above and below it (the logo's gap is 8.75° each side;
// the owner asked for a little more, 11°), and the "re" lettering, which lights up last. The letters are not redrawn:
// they are cut from the logo itself (public/assets/reo-re-mask.png, the logo's frame 2.198 ring radii wide), so their
// shape is the logo's.
const T={hold:350,pour:900,draw:1500,flight:750,set:3050,sweep:3350,re:4150,rest:5300,end:6200};
const reMask=typeof Image==='undefined'?null:Object.assign(new Image(),{src:'/assets/reo-re-mask.png'});
const smooth=(a,b,v)=>{const u=Math.max(0,Math.min(1,(v-a)/(b-a)));return u*u*(3-2*u)};
function useShatter(canvas,image,run,slug){
 useEffect(()=>{
  const c=canvas.current,im=image.current;
  if(!c||!im||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let frame=0,alive=true;
  const fx=effects[slug]||effects['material-recycled-marble'];
  const start=()=>{
   const box=c.parentElement.getBoundingClientRect(),dpr=Math.min(1.5,window.devicePixelRatio||1),W=Math.round(box.width*dpr),H=Math.round(box.height*dpr);
   if(!W||!H||!im.naturalWidth)return;
   c.width=W;c.height=H;
   const ctx=c.getContext('2d'),narrow=box.width<900;
   // The photo covers the frame (as object-fit: cover does); a piece maps a part of the photo to its place in the frame.
   const scale=Math.max(W/im.naturalWidth,H/im.naturalHeight),ox=(W-im.naturalWidth*scale)/2,oy=(H-im.naturalHeight*scale)/2;
   const pieces=fx.make(W,H),out=fx.out;
   const whole=alpha=>{ctx.globalAlpha=alpha;ctx.drawImage(im,-ox/scale,-oy/scale,W/scale,H/scale,0,0,W,H);ctx.globalAlpha=1};
   // The ring sits in the middle of the frame (v1.13.0: the photograph is a frame beside the words, no longer the
   // whole window with the words over it). Angles run counter-clockwise on screen (negative).
   const R=Math.min(W*.2,H*.3),cx=W*.5,cy=H*.5,band=R*.075,gap=Math.PI*11/180,arc=Math.PI*2-gap*2;
   // Grain colours: a small copy of the photo, read once.
   const small=document.createElement('canvas');small.width=64;small.height=Math.max(1,Math.round(64*H/W));
   const sctx=small.getContext('2d');sctx.drawImage(im,-ox/scale,-oy/scale,W/scale,H/scale,0,0,small.width,small.height);
   let px=null;try{px=sctx.getImageData(0,0,small.width,small.height).data}catch{}
   const count=narrow?900:1900,grains=[];
   for(let i=0;i<count;i++){
    const p=pieces[(Math.random()*pieces.length)|0],order=i/count;
    // Where the grain starts: where one of the material's pieces ended up, kept near the stage.
    const x0=Math.max(-W*.05,Math.min(W*1.05,p.cx+p.tx+(Math.random()-.5)*p.size)),y0=Math.max(-H*.05,Math.min(H*1.05,p.cy+p.ty+p.g+(Math.random()-.5)*p.size));
    const ang=-(gap+order*arc),rr=R+(Math.random()-.5)*band*2.2,x1=cx+Math.cos(ang)*rr,y1=cy+Math.sin(ang)*rr;
    // It swings out past the ring before landing, so the stream curls in along the direction the ring is drawn.
    const lead=ang+.9,mx=cx+Math.cos(lead)*R*(1.7+Math.random()*.9),my=cy+Math.sin(lead)*R*(1.7+Math.random()*.9);
    let col='rgb(200,198,190)';
    if(px){const sx=Math.max(0,Math.min(small.width-1,(p.cx/W*small.width)|0)),sy=Math.max(0,Math.min(small.height-1,(p.cy/H*small.height)|0)),k=(sy*small.width+sx)*4,l=1.12;
     col=`rgb(${Math.min(255,px[k]*l+14)|0},${Math.min(255,px[k+1]*l+14)|0},${Math.min(255,px[k+2]*l+14)|0})`}
    grains.push({x0,y0,mx,my,x1,y1,col,s:(1.4+Math.random()*2.2)*dpr,at:T.pour+order*T.draw+Math.random()*120,spin:Math.random()*6.3});
   }
   // The set ring, made once: the photo enlarged (so its grain reads), kept only where the band and the dot are.
   // The lettering: near white with a breath of the material's colour, in the logo's own shape.
   const side=Math.round(R*2.198),letters=document.createElement('canvas');letters.width=letters.height=side;
   const lettersReady=()=>{if(letters.done||!reMask?.complete||!reMask.naturalWidth)return !!letters.done;const l=letters.getContext('2d');l.fillStyle='#fff';l.fillRect(0,0,side,side);l.globalAlpha=.22;l.drawImage(im,0,0,im.naturalWidth,im.naturalHeight,0,0,side,side);l.globalAlpha=1;l.globalCompositeOperation='destination-in';l.drawImage(reMask,0,0,side,side);return letters.done=true};
   const half=Math.ceil(R+band),solid=document.createElement('canvas');solid.width=solid.height=half*2;
   {const s=solid.getContext('2d'),view=Math.min(im.naturalWidth,im.naturalHeight)*.55;
    s.drawImage(im,(im.naturalWidth-view)/2,(im.naturalHeight-view)/2,view,view,0,0,half*2,half*2);
    s.fillStyle='rgba(255,255,255,.08)';s.fillRect(0,0,half*2,half*2);
    s.globalCompositeOperation='destination-in';s.lineWidth=band;s.beginPath();s.arc(half,half,R,-gap,-(gap+arc),true);s.stroke();
    s.globalCompositeOperation='source-over';
    // the dot, cut from the same photo
    const d=document.createElement('canvas');d.width=d.height=half*2;const dc=d.getContext('2d');
    dc.drawImage(im,(im.naturalWidth-view)/2,(im.naturalHeight-view)/2,view,view,0,0,half*2,half*2);
    dc.globalCompositeOperation='destination-in';dc.beginPath();dc.arc(half+R*.98,half,R*.07,0,Math.PI*2);dc.fill();
    s.drawImage(d,0,0)}
   const t0=performance.now();
   c.classList.add('is-on');
   const draw=now=>{
    if(!alive)return;
    const t=now-t0;
    if(t<=T.hold){whole(1);frame=requestAnimationFrame(draw);return}
    ctx.fillStyle='#161816';ctx.fillRect(0,0,W,H);
    // The photo comes back under the ring at the end.
    const back=smooth(T.rest,T.end,t);if(back>0)whole(back);
    // Act 1: the pieces leave, in the material's own order, and thin out as they become grains.
    if(t<T.hold+out+500)for(const p of pieces){
     const u=Math.min(1,Math.max(0,(t-T.hold)/out-p.delay*.6)/(1-.4*.6)),k=1-Math.pow(1-u,3),alpha=(1-p.fade*k)*(1-smooth(.55,1,k));
     if(alpha<=.01)continue;
     const sx=(p.bx-ox)/scale,sy=(p.by-oy)/scale,sw=p.bw/scale,sh=p.bh/scale;
     if(k<=.001){
      if(!p.pts){ctx.drawImage(im,sx,sy,sw,sh,p.bx,p.by,p.bw+.6,p.bh+.6);continue}
      ctx.save();ctx.beginPath();p.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(im,sx,sy,sw,sh,p.bx-.4,p.by-.4,p.bw+.8,p.bh+.8);ctx.restore();continue;
     }
     const s=1-(1-p.shrink)*k,wave=p.amp?Math.sin(k*Math.PI*2+p.phase)*p.amp*k:0;
     ctx.save();
     ctx.translate(p.cx+p.tx*k+wave,p.cy+p.ty*k+p.g*k*k);
     ctx.rotate(p.rot*k);
     ctx.scale(s*(p.flip?Math.max(.02,Math.cos(k*Math.PI/2)):1+(p.stretchX||0)*k),s*(1+(p.stretchY||0)*k));
     ctx.globalAlpha=alpha;
     if(p.pts||p.round){
      ctx.beginPath();
      if(p.round)ctx.arc(0,0,p.size*(.5+.21*(1-k)),0,Math.PI*2);
      else{p.pts.forEach(([x,y],i)=>i?ctx.lineTo(x-p.cx,y-p.cy):ctx.moveTo(x-p.cx,y-p.cy));ctx.closePath()}
      if(fx.edge){ctx.strokeStyle=`rgba(255,255,255,${.55*Math.min(1,k*3)})`;ctx.lineWidth=1.5;ctx.stroke()}
      ctx.clip();
     }
     ctx.drawImage(im,sx,sy,sw,sh,p.bx-p.cx,p.by-p.cy,p.bw+.6,p.bh+.6);
     ctx.restore();
    }
    // Acts 2 and 3: grains appear where the pieces went, curl in and land on the ring in drawing order.
    const set=smooth(T.set,T.set+450,t),fade=1-smooth(T.rest,T.end-200,t);
    if(set<1&&t>T.pour-400){
     for(const g of grains){
      const u=(t-g.at)/T.flight;
      let x,y,a;
      if(u<=0){const wait=smooth(g.at-700,g.at,t);if(wait<=0)continue;x=g.x0+Math.sin(t/260+g.spin)*3*dpr;y=g.y0+Math.cos(t/310+g.spin)*3*dpr;a=wait*.9}
      else if(u<1){const e=u*u*(3-2*u),q=1-e;x=q*q*g.x0+2*q*e*g.mx+e*e*g.x1;y=q*q*g.y0+2*q*e*g.my+e*e*g.y1;a=1}
      else{x=g.x1;y=g.y1;a=1}
      ctx.globalAlpha=a*(1-set);ctx.fillStyle=g.col;
      const s=u>=1?g.s*.85:g.s;ctx.fillRect(x-s/2,y-s/2,s,s);
     }
     ctx.globalAlpha=1;
    }
    // Act 4: the ring sets in the material's texture; the dot arrives last; one light runs round it.
    if(set>0&&fade>0){
     ctx.save();ctx.globalAlpha=set*fade;
     ctx.drawImage(solid,cx-half,cy-half);
     // "re" lights up last: it arrives bright, with a glow that settles.
     const lit=smooth(T.re,T.re+550,t);
     if(lit>0&&lettersReady()){ctx.save();ctx.globalAlpha=lit*fade;ctx.shadowColor='rgba(255,255,255,.9)';ctx.shadowBlur=(1-smooth(T.re+200,T.re+1000,t))*22*dpr;ctx.drawImage(letters,cx-side/2,cy-side/2);ctx.restore()}
     const sw=(t-T.sweep)/900;
     if(sw>0&&sw<1){const head=-(gap+sw*arc);ctx.strokeStyle=`rgba(255,255,255,${.6*Math.sin(sw*Math.PI)})`;ctx.lineWidth=band*.9;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,R,head+.5,head,true);ctx.stroke()}
     ctx.restore();
    }
    if(t<T.end)frame=requestAnimationFrame(draw);else{whole(1);c.classList.remove('is-on')}
   };
   frame=requestAnimationFrame(draw);
  };
  if(im.complete&&im.naturalWidth)start();else im.addEventListener('load',start,{once:true});
  return()=>{alive=false;cancelAnimationFrame(frame);im.removeEventListener('load',start);c.classList.remove('is-on')};
 },[run,slug]);
}
export default function MaterialIntro({page,lead,onWorks}){
 const slug=decodeURIComponent(page.path).split('/').pop(),at=materials.findIndex(m=>m[2]===slug),m=materials[at];
 const canvas=useRef(null),image=useRef(null),[run,setRun]=useState(1);
 useShatter(canvas,image,run,slug);
 const replay=useCallback(()=>setRun(r=>r+1),[]);
 const hero=page.hero;
 return <header className="mat-intro">
  <div className="mat-intro-text">
   <p className="mat-intro-no">{at>=0&&<><b>{String(at+1).padStart(2,'0')}</b><span>/ {String(materials.length).padStart(2,'0')}</span></>}<em>re.O 循環材料</em></p>
   <h1>{m?m[0]:page.title}</h1>
   {m&&<p className="mat-intro-en" lang="en">{m[1]}</p>}
   {lead.map((p,i)=><p className="mat-intro-lead" key={i}>{p}</p>)}
   <p className="mat-intro-actions">
    {onWorks&&<a href="#material-works" onClick={e=>{e.preventDefault();onWorks()}}>看這個材料做成的作品<span aria-hidden="true"> ↓</span></a>}
    <button type="button" onClick={replay}><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 3v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>再看一次</button>
   </p>
  </div>
  {/* v1.13.0: the stage is a frame beside the words, no wider than the photograph can hold (--nat). */}
  <div className="mat-intro-stage" style={{'--nat':hero.width}}>
   <img ref={image} src={hero.src} alt={`re.O 循環材料：${m?m[0]:page.title}的原料`} width={hero.width} height={hero.height} fetchPriority="high"/>
   <canvas ref={canvas} aria-hidden="true"/>
  </div>
 </header>;
}
