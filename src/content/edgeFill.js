// A portrait photo shown whole in a wider frame: the frame's sides continue the photo's own left and right
// edge colours, top to bottom, so no band shows (v36 case cards; v61 article detail frames).
// Returns a CSS background for the frame, or null when the image cannot be read.
export function edgeFill(im){
 if(!im?.naturalWidth)return null;
 try{
  const rows=24,c=document.createElement('canvas');c.width=2;c.height=rows;const ctx=c.getContext('2d');
  ctx.drawImage(im,2,0,1,im.naturalHeight,0,0,1,rows);ctx.drawImage(im,im.naturalWidth-3,0,1,im.naturalHeight,1,0,1,rows);
  const d=ctx.getImageData(0,0,2,rows).data,edge=k=>Array.from({length:rows},(_,y)=>{const i=(y*2+k)*4;return `rgb(${d[i]},${d[i+1]},${d[i+2]}) ${(y/(rows-1)*100).toFixed(1)}%`}).join(',');
  return `linear-gradient(${edge(0)}) left/50% 100% no-repeat,linear-gradient(${edge(1)}) right/50% 100% no-repeat`;
 }catch{return null}
}
