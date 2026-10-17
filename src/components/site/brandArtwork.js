// Both faces share the original mark and its measured background matte.
const artworkCache=new WeakMap();
function clearMatte(pixels,background,monochrome){
 for(let i=0;i<pixels.length;i+=4){
  if(!pixels[i+3])continue;
  const distance=Math.max(Math.abs(pixels[i]-background[0]),Math.abs(pixels[i+1]-background[1]),Math.abs(pixels[i+2]-background[2]));
  if(distance<=12){pixels[i+3]=0;continue}
  if(monochrome){
   // This supplied DCC wordmark has black and white ink on a red field.
   // Recover those two inks from the red-matted antialiasing, including counters.
   const light=pixels[i+1]+pixels[i+2]>background[1]+background[2]+20;
   const coverage=Math.min(1,Math.max(0,...background.map((color,c)=>light?(pixels[i+c]-color)/(255-color):(color-pixels[i+c])/(color||1))));
   pixels[i]=pixels[i+1]=pixels[i+2]=light?255:0;pixels[i+3]=Math.round(pixels[i+3]*coverage);continue;
  }
  if(distance>=42)continue;
  const coverage=(distance-12)/30;
  // Unmatte the antialiased edge to remove white, gray or colored fringes.
  for(let c=0;c<3;c++)pixels[i+c]=Math.round(Math.max(0,Math.min(255,(pixels[i+c]-background[c]*(1-coverage))/coverage)));
  pixels[i+3]=Math.round(pixels[i+3]*coverage);
 }
}
export function loadBrandArtwork(image){
 if(artworkCache.has(image))return artworkCache.get(image);
 const result=new Promise((resolve,reject)=>{
  const original=new Image();
  original.onload=()=>{
   try{
    const bounds=image.bounds||[0,0,original.width,original.height];
    const art=document.createElement('canvas');art.width=bounds[2];art.height=bounds[3];
    const ctx=art.getContext('2d',{willReadFrequently:!!image.background});
    ctx.drawImage(original,...bounds,0,0,art.width,art.height);
    if(image.background){const raster=ctx.getImageData(0,0,art.width,art.height);clearMatte(raster.data,image.background,image.matteMode==='monochrome');ctx.putImageData(raster,0,0)}
    resolve(art);
   }catch(error){reject(error)}
  };
  original.onerror=()=>reject(new Error('Brand artwork could not load'));
  original.src=image.src;
 });
 artworkCache.set(image,result);
 return result;
}
