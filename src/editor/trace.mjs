// Raster-to-vector tracing for EPS export. Browsers draw text but never hand out glyph outlines, so
// each text object is drawn large on a canvas and its coverage traced back into closed polygons:
// marching squares on the alpha field (edges interpolated, so curves come out smooth), then
// Douglas–Peucker to drop points that sit on straight runs. Pure functions; tested in node.

// alpha: Float32Array/Uint8 values 0..1 (row-major, width×height). Returns loops of [x,y] in pixel
// units, pixel centres at integer + .5. Every loop runs with the inside on the same side, so nested
// counters (口, 0, o) come out as holes under even-odd filling.
export function traceContours(alpha,width,height,level=.5){
  const W=width+2,H=height+2;
  // One pixel of empty margin so every shape closes inside the grid.
  const v=(x,y)=>x<1||y<1||x>width||y>height?0:alpha[(y-1)*width+(x-1)];
  const hKey=(i,j)=>j*W+i,vKey=(i,j)=>W*H+j*W+i;
  const starts=new Map();
  const cut=(a,b)=>{const d=b-a;return Math.abs(d)<1e-9?.5:Math.min(1,Math.max(0,(level-a)/d))};
  for(let j=0;j<H-1;j++)for(let i=0;i<W-1;i++){
   const tl=v(i,j),tr=v(i+1,j),br=v(i+1,j+1),bl=v(i,j+1);
   const c=(tl>=level?8:0)|(tr>=level?4:0)|(br>=level?2:0)|(bl>=level?1:0);
   if(c===0||c===15)continue;
   const edge={
    T:()=>({key:hKey(i,j),p:[i+cut(tl,tr),j]}),
    B:()=>({key:hKey(i,j+1),p:[i+cut(bl,br),j+1]}),
    L:()=>({key:vKey(i,j),p:[i,j+cut(tl,bl)]}),
    R:()=>({key:vKey(i+1,j),p:[i+1,j+cut(tr,br)]}),
   };
   const centre=(tl+tr+br+bl)/4>=level;
   const pairs={1:[['L','B']],2:[['B','R']],3:[['L','R']],4:[['T','R']],6:[['T','B']],7:[['T','L']],8:[['T','L']],9:[['T','B']],11:[['T','R']],12:[['L','R']],13:[['B','R']],14:[['L','B']],
    5:centre?[['T','L'],['B','R']]:[['T','R'],['L','B']],10:centre?[['T','R'],['L','B']]:[['T','L'],['B','R']]}[c];
   const corner={tl:[0,0,tl],tr:[1,0,tr],br:[1,1,br],bl:[0,1,bl]};
   for(const [e1,e2] of pairs){
    let a=edge[e1](),b=edge[e2]();
    // Orient with an inside corner on the left of a→b (positive cross product), so the segments of
    // neighbouring cells always chain head to tail. Each pair cuts off one side of the cell; that
    // side is wholly inside or wholly outside, so take an inside corner from it or from the rest.
    const side={TL:['tl'],TR:['tr'],BR:['br'],LB:['bl'],LR:['bl','br'],TB:['tl','bl']}[e1+e2];
    const sideInside=corner[side[0]][2]>=level;
    const [px,py]=corner[Object.keys(corner).find(k=>corner[k][2]>=level&&side.includes(k)===sideInside)];
    // Test against edge midpoints, not the interpolated points: a corner exactly at the level would
    // put the point on the corner and make the sign meaningless.
    const mid={T:[.5,0],B:[.5,1],L:[0,.5],R:[1,.5]},[ax,ay]=mid[e1],[bx,by]=mid[e2];
    if((bx-ax)*(py-ay)-(by-ay)*(px-ax)<0)[a,b]=[b,a];
    starts.set(a.key,{p:a.p,next:b.key});
   }
  }
  const loops=[];
  for(const [key,first] of starts){
   if(first.done)continue;
   const loop=[];let at=key,seg=first;
   while(seg&&!seg.done){seg.done=true;loop.push([seg.p[0]-.5,seg.p[1]-.5]);at=seg.next;seg=starts.get(at)}
   if(loop.length>=3)loops.push(loop);
  }
  return loops;
}

// Douglas–Peucker for a closed loop: anchored at the point farthest from the first.
export function simplifyLoop(loop,tolerance=.25){
  if(loop.length<5)return loop;
  let far=0,best=-1;for(let k=1;k<loop.length;k++){const d=Math.hypot(loop[k][0]-loop[0][0],loop[k][1]-loop[0][1]);if(d>best){best=d;far=k}}
  const run=(points)=>{
   const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;const stack=[[0,points.length-1]];
   while(stack.length){const [s,e]=stack.pop();const [ax,ay]=points[s],[bx,by]=points[e],len=Math.hypot(bx-ax,by-ay)||1e-9;let idx=-1,max=tolerance;
    for(let k=s+1;k<e;k++){const d=Math.abs((bx-ax)*(ay-points[k][1])-(ax-points[k][0])*(by-ay))/len;if(d>max){max=d;idx=k}}
    if(idx>0){keep[idx]=1;stack.push([s,idx],[idx,e])}}
   return points.filter((_,k)=>keep[k]);
  };
  const a=run(loop.slice(0,far+1)),b=run([...loop.slice(far),loop[0]]);
  return [...a,...b.slice(1,-1)];
}

// Signed area (shoelace); the sign tells outer loops from holes for a given orientation.
export function loopArea(loop){let s=0;for(let k=0;k<loop.length;k++){const [x1,y1]=loop[k],[x2,y2]=loop[(k+1)%loop.length];s+=x1*y2-x2*y1}return s/2}
