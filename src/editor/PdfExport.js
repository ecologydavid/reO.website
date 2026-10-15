import {renderCanonicalProduct,renderCanonicalSurface} from './canonicalRender.js';
import {loadImage} from './render.js';
function sheet(title,subtitle,logo) {
  const c=document.createElement('canvas');c.width=1240;c.height=1754;const ctx=c.getContext('2d');
  ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,c.width,c.height);
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.drawImage(logo,64,32,108,108);ctx.restore();ctx.fillStyle='#252d28';
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
export async function exportPdf(model,layout,documents) {
  const [{jsPDF},product,logo]=await Promise.all([import('jspdf'),renderCanonicalProduct(layout,documents,{width:1300,height:1650}),loadImage('/assets/reo-logo.png')]);
  if(product.overflow)throw new Error('部分內容超出客製區，請先調整文字或圖案。');
  const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
  const title=`${model.id} 款・${model.name}${model.id==='F'?'・'+layout.name:''}`;
  const main=sheet(title,`正面整體預覽 · ${layout.finish} · 與銘版特寫共用輪廓及排版`,logo);
  place(main.ctx,product.canvas,100,260,1040,1310);
  pdf.addImage(main.canvas,'PNG',0,0,210,297);
  for(const surface of layout.surfaces){
    const {canvas:plate}=await renderCanonicalSurface(surface,documents[surface.id]||[],{withBackground:true});
    const detail=sheet(`${model.id} 款・${surface.name}`,'客製輪廓與排版特寫 · 圖示比例重建，非 CAD 或生產尺寸',logo);
    place(detail.ctx,plate,120,310,1000,1180);
    pdf.addPage();pdf.addImage(detail.canvas,'PNG',0,0,210,297);
  }
  pdf.setProperties({title:`re.O ${model.id} Plaque Layout Preview`,subject:'Visual approval preview, not a production drawing',creator:'re.O Preview Studio'});
  pdf.save(`reO-${model.id}-preview.pdf`);
  return layout.surfaces.length+1;
}
