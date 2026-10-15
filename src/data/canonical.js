import data from './canonical-models.json';
export const stoneColors={白:'#e5e3db',黑:'#252a27',綠:'#24453e',淤泥:'#a89b83'};
export const metalColors={金:'#d7c17d',銀:'#cbd0d0',銅:'#b78c77'};
export const defaultFinish={A:'北美黃檜｜白再生大理石',B:'黑',C:'白',D:'白金',E:'黑金',F:'綠金'};
export const shapeChoices=data.models.F.shapeVariants.map(({id,name})=>({id,name}));
export function getModelScene(id,shape='ridge',finish=defaultFinish[id]){
  const base=data.models[id],variant=id==='F'?base.shapeVariants.find(v=>v.id===shape)||base.shapeVariants[0]:base;
  const chosen=base.variants.includes(finish)?finish:defaultFinish[id];
  const stone=chosen.includes('水庫')?'淤泥':chosen.includes('黑')?'黑':chosen.includes('綠')?'綠':'白';
  const metal=chosen.endsWith('銀')?'銀':chosen.endsWith('銅')?'銅':'金';
  const wood=chosen.includes('木橫擔')?'#82674d':id==='A'?'#bd9254':'#9f602e';
  const fills={wood,stone:stoneColors[stone],metal:metalColors[metal],acrylic:'#69756f'};
  return {...variant,id,shape,finish:chosen,stone,metal,wood,fills,source:base.source,options:base.variants,
    surfaces:variant.surfaces.map(s=>({...s,fill:fills[s.material],ink:s.material==='acrylic'?'#ffffff':s.material==='stone'&&stone!=='白'?'#f5f3ed':'#252d28'}))};
}
export function surfaceProductPolygon(s){return s.polygon.map(([u,v])=>[s.x+u*s.displayWidth,s.y+v*s.displayHeight])}
