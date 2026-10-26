// Packs photos into justified rows: each row shares one height and spans the measure,
// so frames always match the photo's own ratio (no letterbox bands, no cropping).
// The last row is justified too when it is at least 70% full; a shorter one joins the previous
// row if the merged row stays at least 60% of the target height, otherwise it stays open.
export function justifyRows(ratios,width,target,gap){
 const rows=[];let items=[],sum=0;
 const height=(total,count)=>(width-gap*(count-1))/total;
 ratios.forEach((ratio,i)=>{
  items.push(i);sum+=ratio;
  if(sum*target+gap*(items.length-1)<width)return;
  // Break where the row height lands closest to the target, with or without this photo.
  if(items.length>1&&Math.abs(height(sum-ratio,items.length-1)-target)<Math.abs(height(sum,items.length)-target)){rows.push({items:items.slice(0,-1),sum:sum-ratio});items=[i];sum=ratio}
  else{rows.push({items,sum});items=[];sum=0}
 });
 if(!items.length)return rows;
 const fill=(sum*target+gap*(items.length-1))/width,prev=rows[rows.length-1];
 if(fill>=.7){rows.push({items,sum});return rows}
 if(prev){const merged=prev.sum+sum,count=prev.items.length+items.length;if((width-gap*(count-1))/merged>=target*.6){prev.items.push(...items);prev.sum=merged;return rows}}
 rows.push({items,sum,open:true});
 return rows;
}
