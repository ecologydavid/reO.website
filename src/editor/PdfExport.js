import {renderProduct,renderSurface} from './render.js';
function sheet(title,subtitle) {
  const c=document.createElement('canvas');c.width=1240;c.height=1754;const ctx=c.getContext('2d');
  ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#252d28';ctx.font='58px Georgia';ctx.fillText('re.O',72,100);
  ctx.font='30px "Microsoft JhengHei", sans-serif';ctx.fillText(title,72,168);
  ctx.fillStyle='#747c70';ctx.font='19px "Microsoft JhengHei", sans-serif';ctx.fillText(subtitle,72,206);
  ctx.strokeStyle='#cdcec5';ctx.beginPath();ctx.moveTo(72,230);ctx.lineTo(1168,230);ctx.stroke();
  ctx.fillStyle='#747c70';ctx.font='18px "Microsoft JhengHei", sans-serif';
  ctx.fillText('排版預覽確認稿｜非 1:1 製作尺寸，實際製作需由 re.O 校稿確認。',72,1660);
  ctx.fillText('service@re-o.co  /  +886-2-8966-5369',72,1698);
  return {canvas:c,ctx};
}
function place(ctx,image,x,y,w,h) {
  const s=Math.min(w/image.width,h/image.height),iw=image.width*s,ih=image.height*s;
  ctx.drawImage(image,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
}
export async function exportPdf(model,layout,documents,variantName='') {
  const [{jsPDF},product]=await Promise.all([import('jspdf'),renderProduct(model,layout,documents,{width:1600})]);
  if(product.overflow)throw new Error('部分內容超出客製區，請先調整文字或圖案。');
  const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
  const title=`${model.id} 款・${model.name}${variantName?'・'+variantName:''}`;
  const main=sheet(title,'產品整體預覽 · 頁面與銘版特寫使用同一份排版資料');
  place(main.ctx,product.canvas,100,260,1040,1310);
  pdf.addImage(main.canvas,'PNG',0,0,210,297);
  for(const surface of layout.surfaces){
    const {canvas:plate}=await renderSurface(surface,documents[surface.id]||[],{withBackground:true});
    const detail=sheet(`${model.id} 款・${surface.name}`,'銘版排版特寫 · 所有位置為視覺預覽，未標示生產尺寸');
    place(detail.ctx,plate,120,310,1000,1180);
    pdf.addPage();pdf.addImage(detail.canvas,'PNG',0,0,210,297);
  }
  pdf.setProperties({title:`re.O ${model.id} Plaque Layout Preview`,subject:'Visual approval preview, not a production drawing',creator:'re.O Preview Studio'});
  pdf.save(`reO-${model.id}-preview.pdf`);
  return layout.surfaces.length+1;
}
