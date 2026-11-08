// Drawn material maps, tuned by eye to the owner's renders in 3D建模使用 (2026-11-07):
// - brushedMetal: hairlines running top to bottom (D and the other plates; never across).
// - anodizedMetal: E's anodised aluminium; a fine even grain with no direction.
// - greenStone: D's recycled green marble; grey-green with flowing gold threads and yellow flecks.
// - whiteMarble: E's white stone; white ground with silver-grey Carrara-like veins.
// Each is drawn once per colour and cached by the caller. Stones are 1:2 like the photo crops they replace,
// so the studio's box-projection UVs stay isotropic.
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function rng(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
// Smooth value noise on a 256×256 lattice (wraps), plus fractal sums of it.
function noise(seed){
 const N=256,g=new Float32Array(N*N),r=rng(seed);for(let i=0;i<g.length;i++)g[i]=r()*2-1;
 const n=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),x0=xi&255,x1=(xi+1)&255,y0=(yi&255)*N,y1=((yi+1)&255)*N;
  const a=g[y0+x0],b=g[y0+x1],c=g[y1+x0],d=g[y1+x1];return a+(b-a)*u+(c-a+(a-b+d-c)*u)*v};
 n.fbm=(x,y,oct)=>{let s=0,a=.5,f=1;for(let i=0;i<oct;i++){s+=a*n(x*f+i*17.3,y*f-i*9.1);a*=.5;f*=2.03}return s};
 return n;
}
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;

export function brushedMetal(color){
 const W=2048,H=1024,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,[R,G,B]=hex(color),r=rng(20261107);
 // Every column gets its own tone (the hairlines) and a few long scratches; the tone drifts slowly down the plate.
 const col=new Float32Array(W);for(let x=0;x<W;x++)col[x]=(r()+r()+r()-1.5)*.034;
 const L=new Float32Array(W*H);
 for(let i=0;i<5200;i++){const x=Math.floor(r()*W),y0=r()*H,len=80+r()*900,k=(r()-.5)*.1,w=r()<.15?2:1;
  for(let t=0;t<len;t++){const y=Math.floor(y0+t)%H,fade=Math.sin(Math.PI*t/len);for(let j=0;j<w&&x+j<W;j++)L[y*W+x+j]+=k*fade}}
 const n=noise(7);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x,v=1+col[x]+L[i]+n(x/700,y/90)*.025,o=i*4;
  d[o]=Math.min(255,R*v);d[o+1]=Math.min(255,G*v);d[o+2]=Math.min(255,B*v);d[o+3]=255;
 }
 ctx.putImageData(img,0,0);
 // A soft sheen for the flat (2D) plate; the 3D view lights it for real.
 const g=ctx.createLinearGradient(0,0,W*.6,H);g.addColorStop(0,'#ffffff24');g.addColorStop(.45,'#ffffff06');g.addColorStop(1,'#00000012');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 return c;
}

export function anodizedMetal(color){
 const W=1024,H=1024,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,[R,G,B]=hex(color),r=rng(4242),n=noise(11);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const v=1+(r()-.5)*.045+n.fbm(x/160,y/160,3)*.03,o=(y*W+x)*4;
  d[o]=Math.min(255,R*v);d[o+1]=Math.min(255,G*v);d[o+2]=Math.min(255,B*v);d[o+3]=255;
 }
 ctx.putImageData(img,0,0);
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ffffff1a');g.addColorStop(.5,'#ffffff04');g.addColorStop(1,'#0000000e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 return c;
}

// v2 (2026-11-08, after 公版D-3…D-6): a sandy grey-green ground; mustard-gold filaments run in bundles mostly
// down the length, drifting and curling like poured marbling, broken and fibrous; bright yellow flecks and pores.
export function greenStone(){
 const W=1024,H=2048,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,r=rng(915),n=noise(3),w=noise(5),br=noise(17);
 const dark=hex('#3d4a40'),light=hex('#69725f'),grey=hex('#6d7069');
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const t=Math.min(1,Math.max(0,.5+n.fbm(x/300,y/420,5)*1.2)),g=smooth(.1,.6,n.fbm(x/500+30,y/900,3))*.35,grain=(r()-.5)*16;
  const o=(y*W+x)*4;for(let k=0;k<3;k++)d[o+k]=mix(mix(dark[k],light[k],t),grey[k],g)+grain;d[o+3]=255;
 }
 ctx.putImageData(img,0,0);ctx.lineCap='round';ctx.lineJoin='round';
 // Each bundle follows a wandering spine; its filaments keep an offset that breathes along the length
 // (bundles pinch and spread), and break where a noise along the filament drops, so they read as dragged paint.
 for(let b=0;b<30;b++){
  const x0=(b+r())/30*W*1.5-W*.25,slant=(r()-.5)*.7,threads=8+Math.floor(r()*26),spread=10+r()*55,curl=r()<.45?90+r()*130:30+r()*50,seed=r()*100;
  for(let t=0;t<threads;t++){
   const off=(r()-.5)*spread*2,wid=.5+Math.pow(r(),2.5)*2,alpha=.22+r()*.5,phase=r()*50,tone=r();
   ctx.strokeStyle=`rgba(${176+tone*36|0},${160+tone*30|0},${62+tone*30|0},${alpha})`;ctx.lineWidth=wid;
   let drawing=false;
   for(let y=-30;y<=H+30;y+=5){
    const breathe=.55+.9*(.5+.5*w(seed+y/300,b*1.7)),x=x0+off*breathe+y*slant+curl*w.fbm(seed+y/170,b*2.3,3)+160*w.fbm(seed*.5+y/700,b,2);
    const on=br.fbm(phase+y/70,t*1.9+b,2)>-.02&&br(phase*3+y/14,t+b*5)>-.45;
    if(on&&!drawing){ctx.beginPath();ctx.moveTo(x,y);drawing=true}else if(on)ctx.lineTo(x,y);else if(drawing){ctx.stroke();drawing=false}
   }
   if(drawing)ctx.stroke();
  }
 }
 // Bright yellow flecks (a few larger drops) and tiny dark pores, as in the cast stone.
 for(let i=0;i<70;i++){const x=r()*W,y=r()*H,s=1.5+Math.pow(r(),2.2)*9;ctx.fillStyle=`rgba(${222+r()*20|0},${190+r()*24|0},${30+r()*40|0},${.8+r()*.2})`;
  for(let k=0;k<2+r()*4;k++){ctx.beginPath();ctx.ellipse(x+(r()-.5)*s,y+(r()-.5)*s*1.4,s*(.4+r()*.5),s*(.5+r()*.7),r()*3,0,Math.PI*2);ctx.fill()}}
 for(let i=0;i<300;i++){ctx.fillStyle=`rgba(214,194,70,${.35+r()*.4})`;ctx.fillRect(r()*W,r()*H,1+r()*1.5,1+r()*1.5)}
 for(let i=0;i<1100;i++){ctx.fillStyle=`rgba(24,30,25,${.3+r()*.45})`;ctx.beginPath();ctx.arc(r()*W,r()*H,.5+r()*1.4,0,Math.PI*2);ctx.fill()}
 return c;
}

export function whiteMarble(){
 const W=1024,H=2048,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,r=rng(2718),n=noise(21),v1=noise(23),v2=noise(29),w=noise(31),m=noise(37),k=noise(41);
 const ground=hex('#f5f5f3'),cloud=hex('#dcdfe2'),vein=hex('#7f868e');
 const line=(f,x,y,px)=>{const v=f(x,y),gx=f(x+1,y)-v,gy=f(x,y+1)-v;return smooth(px,0,Math.abs(v)/Math.max(1e-4,Math.hypot(gx,gy)))};
 const cs=Math.cos(.6),sn=Math.sin(.6),f1=(x,y)=>v1.fbm((x*cs+y*sn)/230,(y*cs-x*sn)/520,5),f2=(x,y)=>v2.fbm((x*cs+y*sn)/110,(y*cs-x*sn)/220,4),f3=(x,y)=>v1.fbm((x*cs-y*sn)/170+50,(y*cs+x*sn)/400,4);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const t=smooth(-.05,.5,n.fbm(x/420,y/420,5))*.35,grain=(r()-.5)*5;
  let R=mix(ground[0],cloud[0],t)+grain,G=mix(ground[1],cloud[1],t)+grain,B=mix(ground[2],cloud[2],t)+grain;
  // Veins are the zero lines of warped noise: a main network and many finer veins; each fades in and out.
  const px=x+60*w.fbm(x/240,y/240,4),py=y+60*w.fbm(x/240+40,y/240,4);
  const main=line(f1,px,py,2+2.2*smooth(-.3,.4,k.fbm(x/200+9,y/200,2)))*smooth(-.35,.1,k.fbm(x/260,y/260,3));
  const cross=line(f3,px,py,1.5)*smooth(-.05,.3,k.fbm(x/240+20,y/240,3));
  const fine=line(f2,px,py,1.2)*smooth(-.2,.25,m.fbm(x/300,y/300,3));
  const soft=smooth(.035,0,Math.abs(f1(px,py)))*.1;
  const a=Math.min(.85,main*.72+cross*.5+fine*.38+soft);
  R=mix(R,vein[0],a);G=mix(G,vein[1],a);B=mix(B,vein[2],a);
  const o=(y*W+x)*4;d[o]=R;d[o+1]=G;d[o+2]=B;d[o+3]=255;
 }
 ctx.putImageData(img,0,0);
 return c;
}

// Black recycled marble (A, B and C). v2 (2026-11-08, owner: the v1 hard cream strokes looked crude) drawn
// after D and E's black photo crop (stone-black-gold-D): a deep charcoal ground with soft, smoky bands of
// muted gold that drift mostly down the length, curl and fade; the gold breaks into a dry-brushed sandy grain
// along the flow, never a solid line. Fields are domain-warped value noise, evaluated per pixel; S sets the
// size of the figure (the sand grain keeps its own fine scale). `shift` starts the figure further down the
// same stone (no seam): C's wide, low piece only shows the top fifth of the map, so it starts where the gold runs.
export function blackGoldStone(shift=0){
 const W=1024,H=2048,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data;
 const r=rng(1618),n=noise(43),w=noise(47),s=noise(53),g=noise(59),k=noise(61);
 const ground=hex('#181917'),lift=hex('#2b2c27'),gold=hex('#7d6b4c'),hi=hex('#c2a978'),S=1.6;
 for(let row=0;row<H;row++)for(let x=0;x<W;x++){
  const y=row+shift;
  const wx=x+170*S*w.fbm(x/600/S,y/1000/S,3)+35*S*w.fbm(x/160/S+7,y/300/S,2),wy=y+100*S*w.fbm(x/600/S+30,y/700/S,2);
  const t=smooth(-.3,.5,n.fbm(x/340/S,y/460/S,3))*.7;
  // Main bands: soft zero lines of a field stretched down the length, their width breathing; finer veins; smoke.
  const v=s.fbm(wx/280/S,wy/950/S,3),width=.06+.12*smooth(-.4,.5,k.fbm(x/320/S,y/520/S,2));
  const vein=Math.pow(smooth(width,0,Math.abs(v)),1.4);
  const v2=g.fbm(wx/150/S+40,wy/520/S,3),vein2=smooth(.03,0,Math.abs(v2))*smooth(-.05,.35,k.fbm(x/260/S+20,y/380/S,2));
  const cloud=smooth(.0,.55,g.fbm(wx/320/S,wy/640/S,3))*.66;
  // Dry-brushed sand: short striations along the flow plus a fine speck.
  const st=.5+.45*n(wx/1.4,wy/30)+.3*n(wx/3.2+50,wy/80)+.3*n(wx/1.7+20,wy/2.4),sand=smooth(.1,.95,st);
  const strength=.68+.32*smooth(-.4,.4,k.fbm(x/500/S+60,y/800/S,2));
  const a=Math.min(1,Math.max(vein*1.05,vein2*.55,cloud)*mix(.3,1,sand)*strength);
  const tone=smooth(.35,.95,a),grain=(r()-.5)*7,o=(row*W+x)*4;
  for(let q=0;q<3;q++)d[o+q]=mix(mix(ground[q],lift[q],t),mix(gold[q],hi[q],tone),a*.9)+grain;
  d[o+3]=255;
 }
 ctx.putImageData(img,0,0);
 return c;
}

// Wood for A after the owner's renders 公版A-1…A-6 (2026-11-07): grain runs down the texture (the column's
// length). Growth rings are the contour lines of a slowly warped field, so they form long straight stripes
// with the odd cathedral arch; fine pores are short vertical dashes. Two species:
// - light: 北美黃檜, a pale beige-tan with soft, low-contrast figure;
// - walnut: 木橫擔, a dark walnut brown with darker rings.
const woods={
 light:{base:'#e0c6a0',late:'#c6a578',early:'#ecd9bc',ring:.38,pore:.1,period:46,streak:.25},
 walnut:{base:'#553322',late:'#2e1a10',early:'#6e4632',ring:.5,pore:.2,period:30,streak:.55}
};
export function woodGrain(kind){
 const p=woods[kind],W=1024,H=2048,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,r=rng(kind==='light'?77:88),n=noise(61),w=noise(67),m=noise(71);
 const base=hex(p.base),late=hex(p.late),early=hex(p.early);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  // Flat-sawn figure: rings are distance from a stretched cone axis (nested arches, the "cathedral"),
  // warped so they wander; long fine streaks and pores run down the length.
  const wx=x+70*w.fbm(x/380,y/1500,4),ax=W*.5+160*m.fbm(3.7,y/2600,2),dy=(y-H*1.15)*.11;
  const f=Math.hypot(wx-ax,dy)/p.period+1.2*w.fbm(x/220+5,y/900,3),fr=f-Math.floor(f);
  const ringT=smooth(.6,.9,fr)*(1-smooth(.9,1,fr))*p.ring;
  const streak=n.fbm(x/2.5,y/260,2)*p.streak,tone=n.fbm(x/320,y/1100,3)*.4+streak;
  const pore=n(x/1.6,y/38)>.45?p.pore:0;
  const t=Math.max(-1,Math.min(1,tone));
  let R=t<0?mix(base[0],early[0],-t):mix(base[0],late[0],t*.6),G=t<0?mix(base[1],early[1],-t):mix(base[1],late[1],t*.6),B=t<0?mix(base[2],early[2],-t):mix(base[2],late[2],t*.6);
  const a=Math.min(1,ringT+pore)+(r()-.5)*.03;R=mix(R,late[0],a);G=mix(G,late[1],a);B=mix(B,late[2],a);
  const o=(y*W+x)*4;d[o]=R;d[o+1]=G;d[o+2]=B;d[o+3]=255;
 }
 ctx.putImageData(img,0,0);
 return c;
}

// 水庫淤泥 (reservoir silt) base on A, after the renders: a neutral matte grey with a faint speckle.
export function siltStone(){
 const W=512,H=1024,c=canvas(W,H),ctx=c.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,r=rng(31),n=noise(73),g=hex('#999896'),k=hex('#8a8986');
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=smooth(-.4,.5,n.fbm(x/200,y/200,4))*.6,s=(r()-.5)*8+(r()<.02?-18:0),o=(y*W+x)*4;d[o]=mix(g[0],k[0],t)+s;d[o+1]=mix(g[1],k[1],t)+s;d[o+2]=mix(g[2],k[2],t)+s;d[o+3]=255}
 ctx.putImageData(img,0,0);return c;
}
