import React,{useEffect,useRef} from 'react';
// Gold sand drifting across the hero so the banner reads as moving. A steady breeze carries fine
// grains left to right; each slide change sends a brief gust. Pauses off screen and in hidden tabs;
// nothing is drawn under reduced motion.
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
export default function GoldDust({gust,running=true}){
 const canvas=useRef(null),state=useRef({grains:[],width:0,height:0,running,start:null});
 state.current.running=running;
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const el=canvas.current,ctx=el.getContext('2d'),s=state.current;
  let frame=0,last=0,visible=true;
  const resize=()=>{const ratio=Math.min(devicePixelRatio||1,2),box=el.getBoundingClientRect();s.width=box.width;s.height=box.height;el.width=box.width*ratio;el.height=box.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);const count=Math.min(150,Math.round(box.width*box.height/9000));s.grains=s.grains.filter(g=>g.gust);while(s.grains.length<count)s.grains.push(grain(s.width,s.height))};
  const draw=time=>{
   const dt=Math.min(3,(time-(last||time))/16.7);last=time;
   ctx.clearRect(0,0,s.width,s.height);ctx.globalCompositeOperation='lighter';
   s.grains=s.grains.filter(g=>{
    g.phase+=.02*dt;g.x+=g.vx*dt;g.y+=(g.vy+Math.sin(g.phase)*.18)*dt;
    if(g.x>s.width+20||g.y<-20||g.y>s.height+20){if(g.gust)return false;Object.assign(g,grain(s.width,s.height),{x:-10})}
    const alpha=g.a*(.6+.4*Math.sin(g.phase*2.3))*(g.gust?Math.min(1,(s.width-g.x)/(s.width*.4)+.2):1);
    // Gust grains leave a short fading trail; the breeze is fine glittering points.
    if(g.gust){const tail=ctx.createLinearGradient(g.x-g.vx*4,g.y-g.vy*4,g.x,g.y);tail.addColorStop(0,`rgba(${g.color},0)`);tail.addColorStop(1,`rgba(${g.color},${(alpha*.8).toFixed(3)})`);ctx.globalAlpha=1;ctx.strokeStyle=tail;ctx.lineWidth=g.r*.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(g.x-g.vx*4,g.y-g.vy*4);ctx.lineTo(g.x,g.y);ctx.stroke()}
    const size=HALF*2*g.r/R;ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.drawImage(spriteFor(g),g.x-size/2,g.y-size/2,size,size);
    return true;
   });
   frame=s.running&&visible&&!document.hidden?requestAnimationFrame(draw):0;
  };
  const start=()=>{if(!frame&&s.running&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(draw)}};
  s.start=start;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()});
  const sizes=new ResizeObserver(resize);
  observer.observe(el);sizes.observe(el);document.addEventListener('visibilitychange',start);resize();start();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();document.removeEventListener('visibilitychange',start)};
 },[]);
 useEffect(()=>{if(running)state.current.start?.()},[running]);
 // A gust sweeps through on every slide change; comparing with the last slide keeps it off first load.
 const shown=useRef(gust);
 useEffect(()=>{if(shown.current===gust)return;shown.current=gust;const s=state.current;for(let i=0;i<70;i++)s.grains.push(grain(s.width,s.height,true))},[gust]);
 return <canvas className="rv-hero-dust" ref={canvas} aria-hidden="true"/>;
}
