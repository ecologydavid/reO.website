import React,{useEffect,useRef} from 'react';
import {loadBrandArtwork} from './brandArtwork.js';
export default function BrandMark({image,name}){
 const canvas=useRef(null);
 useEffect(()=>{
  let live=true;canvas.current.dataset.artworkState='loading';
  loadBrandArtwork(image).then(art=>{
   if(!live)return;
   const c=canvas.current,ctx=c.getContext('2d'),scale=Math.min(480/art.width,184/art.height),w=art.width*scale,h=art.height*scale;
   ctx.clearRect(0,0,512,216);ctx.drawImage(art,(512-w)/2,(216-h)/2,w,h);c.dataset.artworkState='ready';
  }).catch(()=>{if(live)canvas.current.dataset.artworkState='error'});
  return()=>{live=false};
 },[image]);
 return <canvas ref={canvas} width="512" height="216" role="img" aria-label={name}/>;
}
