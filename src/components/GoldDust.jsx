import React,{useEffect,useRef} from 'react';
// Gold sand drifting across the hero so the banner reads as moving. A steady breeze carries fine
// grains left to right; each slide change sends a brief gust. Pauses off screen and in hidden tabs;
// nothing is drawn under reduced motion or Save-Data.
//
// Built to stay smooth on ordinary phones and laptops:
// - it starts only once the page has loaded and the browser is idle, then fades in;
// - the canvas is drawn at 1x (1.5x on capable devices): the grains are soft glows, and a 2x canvas
//   costs four times the fill;
// - the fade towards the headline is baked into each grain's alpha instead of a CSS mask, which would
//   cost an extra compositing pass on every frame;
// - phones and modest devices run fewer grains at 30 fps, and any device that still misses frames
//   steps down once more, then stops the sand rather than stutter.
const golds=['242,214,150','222,184,110','201,158,82','255,236,190'];
// Each glowing grain is drawn once per colour at a reference radius and then stamped and scaled;
// a live shadowBlur on every grain every frame cost most of the hero's main-thread time.
const R=4,HALF=R*7,SCALE=2;
let sprites;
function glow(color,core){
 const c=document.createElement('canvas');c.width=c.height=HALF*2*SCALE;
 const x=c.getContext('2d');x.scale(SCALE,SCALE);x.fillStyle=x.shadowColor=`rgb(${color})`;x.shadowBlur=R*5*SCALE;
 x.beginPath();x.arc(HALF,HALF,R*core,0,Math.PI*2);x.fill();
 return c;
}
const spriteFor=g=>(sprites??=Object.fromEntries(golds.map(color=>[color,[glow(color,.7),glow(color,.8)]])))[g.color][g.gust?1:0];
function grain(width,height,gust=false){
 const depth=Math.random(),fast=gust?2.2+Math.random()*2.6:.2+depth*.6;
 return {
  x:gust?width*(Math.random()*.45-.1):Math.random()*width,y:gust?height*(.25+Math.random()*.6):Math.random()*height,
  vx:fast,vy:(Math.random()-.62)*(gust?.7:.24),r:.8+depth*1.7+(Math.random()<.05?1.4:0),
  a:.4+depth*.55,phase:Math.random()*Math.PI*2,color:golds[Math.random()*golds.length|0],gust
 };
}
// Quality steps: grain share, frame interval (ms; 60 fps even on 120 Hz screens) and gust size.
// The last step stops the sand.
const levels=[{share:1,every:16,gust:70},{share:.55,every:33,gust:36},{share:.3,every:33,gust:18},null];
const modest=()=>matchMedia('(max-width: 760px)').matches||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
export default function GoldDust({gust,running=true}){
 const canvas=useRef(null),state=useRef({grains:[],width:0,height:0,running,start:null,level:0});
 state.current.running=running;
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData)return;
  const el=canvas.current,ctx=el.getContext('2d'),s=state.current;
  s.level=modest()?1:0;
  let frame=0,last=0,drawn=0,visible=true,ready=false,slow=0,frames=0,vertical=false;
  // Alpha of the old CSS mask: on desktop the sand thins towards the headline column on the left;
  // on phones (photo above the copy) it thins below the photo.
  const fade=(x,y)=>{
   if(vertical){const t=y/s.height;return t<.5?1:t>.62?.2:1-(t-.5)/.12*.8}
   const t=x/s.width;return t<.32?.18+t/.32*.17:t<.46?.35+(t-.32)/.14*.65:1;
  };
  const fill=()=>{const level=levels[s.level],count=Math.round(Math.min(150,s.width*s.height/9000)*level.share);s.grains=s.grains.filter(g=>g.gust);while(s.grains.length<count)s.grains.push(grain(s.width,s.height))};
  const resize=()=>{const ratio=Math.min(devicePixelRatio||1,s.level?1:1.5),box=el.getBoundingClientRect();vertical=matchMedia('(max-width: 760px)').matches;s.width=box.width;s.height=box.height;el.width=box.width*ratio;el.height=box.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);fill()};
  const stepDown=()=>{
   s.level++;slow=frames=0;
   if(!levels[s.level]){cancelAnimationFrame(frame);frame=0;el.classList.remove('is-on');return}
   resize();start();
  };
  const draw=time=>{
   frame=0;
   const level=levels[s.level];if(!level)return;
   if(time-drawn<level.every-4){frame=requestAnimationFrame(draw);return}
   const gap=drawn?time-drawn:16.7,dt=Math.min(3,gap/16.7);drawn=time;
   // Watch the real frame gaps; a run of slow frames (not a single hitch) lowers the quality.
   if(++frames>20){if(gap>level.every*1.6)slow++;else slow=Math.max(0,slow-.25);if(slow>24)return stepDown()}
   ctx.clearRect(0,0,s.width,s.height);ctx.globalCompositeOperation='lighter';
   s.grains=s.grains.filter(g=>{
    g.phase+=.02*dt;g.x+=g.vx*dt;g.y+=(g.vy+Math.sin(g.phase)*.18)*dt;
    if(g.x>s.width+20||g.y<-20||g.y>s.height+20){if(g.gust)return false;Object.assign(g,grain(s.width,s.height),{x:-10})}
    const alpha=g.a*(.6+.4*Math.sin(g.phase*2.3))*(g.gust?Math.min(1,(s.width-g.x)/(s.width*.4)+.2):1)*fade(g.x,g.y);
    const size=HALF*2*g.r/R,sprite=spriteFor(g);
    // Gust grains leave a short fading trail of smaller stamps; the breeze is fine glittering points.
    if(g.gust)for(let k=3;k>0;k--){const t=size*(1-k*.18);ctx.globalAlpha=Math.max(0,Math.min(1,alpha*(.5-k*.12)));ctx.drawImage(sprite,g.x-g.vx*k*1.4-t/2,g.y-g.vy*k*1.4-t/2,t,t)}
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.drawImage(sprite,g.x-size/2,g.y-size/2,size,size);
    return true;
   });
   if(s.running&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
  };
  const start=()=>{if(ready&&!frame&&levels[s.level]&&s.running&&visible&&!document.hidden){drawn=0;frames=0;frame=requestAnimationFrame(draw)}};
  s.start=start;
  // Hold the sand until the page has loaded and gone quiet, so it never competes with the first paint.
  let idle=0;
  const begin=()=>{idle=(window.requestIdleCallback||(f=>setTimeout(f,600)))(()=>{ready=true;resize();el.classList.add('is-on');start()},{timeout:2500})};
  if(document.readyState==='complete')begin();else window.addEventListener('load',begin,{once:true});
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()});
  const sizes=new ResizeObserver(()=>{if(ready)resize()});
  observer.observe(el);sizes.observe(el);document.addEventListener('visibilitychange',start);
  return()=>{cancelAnimationFrame(frame);(window.cancelIdleCallback||clearTimeout)(idle);window.removeEventListener('load',begin);observer.disconnect();sizes.disconnect();document.removeEventListener('visibilitychange',start)};
 },[]);
 useEffect(()=>{if(running)state.current.start?.()},[running]);
 // A gust sweeps through on every slide change; comparing with the last slide keeps it off first load.
 const shown=useRef(gust);
 useEffect(()=>{if(shown.current===gust)return;shown.current=gust;const s=state.current,level=levels[s.level];if(!level||!s.width)return;for(let i=0;i<level.gust;i++)s.grains.push(grain(s.width,s.height,true))},[gust]);
 return <canvas className="rv-hero-dust" ref={canvas} aria-hidden="true"/>;
}
