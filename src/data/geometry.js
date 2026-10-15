// Normalized visual positions on the immutable source photographs.
// These are preview mappings, not production dimensions or cutting paths.
export const layouts = {
  A: {crop:[.32,.055,.34,.88],surfaces:[
    {id:'upper',name:'上方文字區',width:1000,height:1500,fill:'#d6ae6f',quad:[[.421,.356],[.500,.378],[.500,.557],[.421,.524]],outline:[[.421,.356],[.485,.374],[.500,.490],[.500,.557],[.421,.524]]},
    {id:'lower',name:'下方主銘版',width:1000,height:1900,fill:'#c8a35f',quad:[[.420,.524],[.501,.605],[.501,.789],[.420,.774]]},
  ]},
  B: {crop:[.35,.04,.48,.92],surfaces:[
    {id:'main',name:'上方銘版',width:1000,height:550,fill:'#ddc886',quad:[[.472,.347],[.704,.390],[.703,.576],[.475,.533]]},
  ]},
  C: {crop:[.15,.09,.66,.86],surfaces:[
    {id:'main',name:'正面銘版',width:1000,height:580,fill:'#ddc886',quad:[[.274,.261],[.571,.356],[.570,.604],[.280,.506]]},
  ]},
  D: {crop:[.25,.035,.36,.92],surfaces:[
    {id:'main',name:'斜面主銘版',width:1000,height:1300,fill:'#c9a596',quad:[[.392,.590],[.516,.598],[.512,.715],[.388,.815]]},
    {id:'lower',name:'底部文字區',width:1000,height:430,fill:'#4b4b49',quad:[[.388,.837],[.509,.783],[.507,.851],[.386,.899]]},
  ]},
  E: {crop:[.36,.12,.50,.83],surfaces:[
    {id:'back',name:'後方高鋁片',width:1000,height:620,fill:'#bdb395',quad:[[.430,.414],[.760,.189],[.734,.389],[.448,.567]]},
    {id:'front',name:'前方低鋁片',width:1000,height:1450,fill:'#c9bea6',quad:[[.644,.578],[.807,.687],[.776,.855],[.606,.867]],outline:[[.644,.578],[.807,.687],[.811,.705],[.776,.855],[.606,.867]]},
  ]},
  F: {variants:[
    {id:'ridge',name:'稜線',crop:[.345,.27,.32,.45],surfaces:[{id:'main',name:'稜線客製區',width:1000,height:1000,fill:'#9d9b8c',transparent:true,ink:'#f8f6ef',mask:'/assets/f-mask-1.png',quad:[[.412,.354],[.587,.353],[.589,.601],[.407,.600]]}]},
    {id:'water',name:'水流',crop:[.03,.37,.30,.40],surfaces:[{id:'main',name:'水流客製區',width:1000,height:1000,fill:'#9d9b8c',transparent:true,ink:'#f8f6ef',mask:'/assets/f-mask-2.png',quad:[[.098,.413],[.272,.459],[.265,.646],[.105,.617]]}]},
    {id:'diamond',name:'菱格',crop:[.66,.395,.30,.44],surfaces:[{id:'main',name:'菱格客製區',width:1000,height:1000,fill:'#9d9b8c',transparent:true,ink:'#f8f6ef',mask:'/assets/f-mask-3.png',quad:[[.700,.471],[.887,.493],[.899,.730],[.701,.704]]}]},
  ]},
};

export function getLayout(modelId,variant='ridge') {
  const layout=layouts[modelId];
  return modelId==='F' ? layout.variants.find(v=>v.id===variant)||layout.variants[0] : layout;
}
