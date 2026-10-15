export function projection(q) {
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=q;
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
  const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const det=dx1*dy2-dx2*dy1;
  const g=Math.abs(det)<1e-12?0:(dx3*dy2-dx2*dy3)/det;
  const h=Math.abs(det)<1e-12?0:(dx1*dy3-dx3*dy1)/det;
  return [x1-x0+g*x1,x3-x0+h*x3,x0,y1-y0+g*y1,y3-y0+h*y3,y0,g,h,1];
}
export function project(m,x,y) {
  const d=m[6]*x+m[7]*y+m[8];
  return [(m[0]*x+m[1]*y+m[2])/d,(m[3]*x+m[4]*y+m[5])/d];
}
export function invert(m) {
  const [a,b,c,d,e,f,g,h,i]=m;
  const out=[e*i-f*h,c*h-b*i,b*f-c*e,f*g-d*i,a*i-c*g,c*d-a*f,d*h-e*g,b*g-a*h,a*e-b*d];
  const det=a*out[0]+b*out[3]+c*out[6];
  if(Math.abs(det)<1e-12)throw new Error('Invalid projection');
  return out.map(v=>v/det);
}
export function objectBounds(o,ctx) {
  if(o.type==='image')return {width:o.width,height:o.height};
  ctx.font=`${o.bold?600:400} ${o.fontSize}px ${o.font==='serif'?'"Noto Serif TC", "PMingLiU", serif':'"Microsoft JhengHei", "Noto Sans TC", sans-serif'}`;
  const lines=o.text.split('\n');
  return {width:Math.max(20,...lines.map(t=>ctx.measureText(t).width)),height:Math.max(1,lines.length)*o.fontSize*1.35};
}
export function hitObject(o,x,y,ctx) {
  const {width,height}=objectBounds(o,ctx),a=-o.rotation*Math.PI/180;
  const dx=x-o.x,dy=y-o.y;
  const rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);
  return Math.abs(rx)<=width/2+12&&Math.abs(ry)<=height/2+12;
}
export function defaultObjects(surface) {
  const w=surface.width,h=surface.height;
  const base={type:'text',color:surface.ink||(surface.fill==='#4b4b49'?'#f5f3ed':'#252d28'),font:'sans',bold:false,rotation:0,align:'center'};
  const font=Math.min(w/6.8,h/4.4);
  return [
    {...base,id:'year',text:'2026',x:w*.5,y:h*.24,fontSize:font*.55},
    {...base,id:'title',text:surface.id==='lower'?'re.O 循環設計':'永續影響力獎',x:w*.5,y:h*.44,fontSize:font*.88,bold:true},
    {...base,id:'subtitle',text:'致每一份改變的力量',x:w*.5,y:h*.64,fontSize:font*.42},
  ];
}
