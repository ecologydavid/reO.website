import {objectBounds} from './geometry.mjs';
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function pointInPolygon(x,y,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[j],b=poly[i],p=[x,y];
    if(Math.abs(cross(a,b,p))<1e-7&&x>=Math.min(a[0],b[0])-1e-7&&x<=Math.max(a[0],b[0])+1e-7&&y>=Math.min(a[1],b[1])-1e-7&&y<=Math.max(a[1],b[1])+1e-7)return true;
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside;
}
function crosses(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<-1e-7&&cross(c,d,a)*cross(c,d,b)<-1e-7}
export function objectCorners(o,ctx,padding=3){
  const {width,height}=objectBounds(o,ctx),a=o.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>{const u=x*(width/2+padding),v=y*(height/2+padding);return [o.x+u*c-v*s,o.y+u*s+v*c]});
}
export function objectFits(o,surface,ctx){
  const poly=surface.polygon.map(([u,v])=>[u*surface.width,v*surface.height]),corners=objectCorners(o,ctx);
  if(!corners.every(([x,y])=>pointInPolygon(x,y,poly)))return false;
  for(let i=0;i<4;i++)for(let j=0;j<poly.length;j++)if(crosses(corners[i],corners[(i+1)%4],poly[j],poly[(j+1)%poly.length]))return false;
  return true;
}
export function fitObject(candidate,surface,ctx,{previous,positionOnly=false}={}){
  let o={...candidate};
  if(objectFits(o,surface,ctx))return o;
  if(positionOnly&&previous&&objectFits(previous,surface,ctx)){
    const axis=[{...o,y:previous.y},{...o,x:previous.x}].filter(test=>objectFits(test,surface,ctx));
    if(axis.length)return axis.sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y))[0];
    let low=0,high=1;
    // Stay on the continuous path from the last legal point; a slot cannot be jumped.
    for(let i=0;i<24;i++){const t=(low+high)/2,test={...o,x:previous.x+(o.x-previous.x)*t,y:previous.y+(o.y-previous.y)*t};if(objectFits(test,surface,ctx))low=t;else high=t;}
    return {...o,x:previous.x+(o.x-previous.x)*low,y:previous.y+(o.y-previous.y)*low};
  }
  const positions=[[o.x,o.y],[surface.width/2,surface.height/2]];
  for(let y=.12;y<.94;y+=.08)for(let x=.12;x<.94;x+=.08)positions.push([x*surface.width,y*surface.height]);
  positions.sort((a,b)=>Math.hypot(a[0]-o.x,a[1]-o.y)-Math.hypot(b[0]-o.x,b[1]-o.y));
  for(let attempt=0;attempt<65;attempt++){
    for(const [x,y] of positions){const test={...o,x,y};if(objectFits(test,surface,ctx))return test;}
    if(o.type==='image'){o.width*=.92;o.height*=.92;}else{o.fontSize=Math.max(3,o.fontSize*.92);o.boxWidth=Math.min(o.boxWidth||surface.width*.8,objectBounds(o,ctx).width*.92);}
  }
  // Retain the last valid object when no legal placement exists.
  return previous&&objectFits(previous,surface,ctx)?previous:{...o,x:surface.width*.5,y:surface.height*.5};
}
