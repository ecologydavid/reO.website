"""Compile one visual model from audited official diagrams. Not manufacturing CAD."""
from pathlib import Path
import json,shutil
ROOT=Path(__file__).resolve().parents[1]
R=ROOT.parent/'research/data'
abc=json.loads((R/'abc-audit-v3.json').read_text(encoding='utf-8'))
audit=json.loads((R/'geometry-audit-v3.json').read_text(encoding='utf-8'))['models']
def surface(id,name,w,h,x,y,pw,ph,polygon,material='metal',z=20):
 return dict(id=id,name=name,width=w,height=h,x=x,y=y,displayWidth=pw,displayHeight=ph,polygon=polygon,material=material,z=z)
def body(polygon,material,depth=100,z=0):return dict(polygon=polygon,material=material,depth=depth,z=z)
out={}
names={'upper':'上方木面文字區','lower':'下方斜邊銘版','main':'正面銘版'}
for item in abc['products']:
 id=item['id'];h={'A':5091,'B':2333,'C':1000}[id]
 regions=[]
 for s in item['surfaces']:
  frame=s['front_frame_normalized'];w,sh=s['local_viewBox'][2:]
  pw=frame['width']*1000;ph=pw*sh/w
  y=frame['y']*(4400 if id=='A' else h)
  regions.append(surface(s['id'],names[s['id']],w,sh,frame['x']*1000,y,pw,ph,s['local_polygon_normalized'],'wood' if id=='A' and s['id']=='upper' else 'metal',35))
 if id=='A':
  bodies=[body([[0,0],[1000,300],[1000,4400],[0,4400]],'wood',1000),body([[0,4400],[1000,4400],[1000,h],[0,h]],'stone',1000,25)]
 elif id=='B':
  bodies=[body([[0,0],[1000,400],[1000,h],[0,h]],'wood',300),body([[550,1700],[1000,1500],[1000,h],[550,h]],'stone',330,65)]
 else:
  bodies=[body([[0,0],[1000,0],[1000,h],[0,h]],'wood',180),body([[0,820],[1000,650],[1000,h],[0,h]],'stone',215,65)]
 out[id]=dict(width=1000,height=h,bodies=bodies,surfaces=regions,variants=item['official_variant_values_original'],source=item['source_url'])
# D: remove only the bottom-edge shear of the whole body; never square the plaque.
d=audit['D'];front=d['visual_front_reconstruction']['optional_de_skewed_front_proposal'];h=4808
regions=[]
for s in front['surfaces']:
 x0,y0,x1,y1=s['global_bounds'];pw=x1-x0;ph=(y1-y0)*h/1000
 poly=[[(x-x0)/pw,(y-y0)/(y1-y0)] for x,y in s['product_polygon']]
 regions.append(surface(s['id'],'斜邊主銘版' if s['id']=='main' else '底部石面文字區',1000,1000*ph/pw,x0,y0*h/1000,pw,ph,poly,'metal' if s['id']=='main' else 'stone',30))
out['D']=dict(width=1000,height=h,bodies=[body([[0,0],[1000,480],[1000,h],[0,h]],'stone',1000)],surfaces=regions,variants=d['color_rules']['combinations'],source=d['source_url'])
# E: preserve both red silhouettes and their relative placement from the drawing.
e=audit['E'];h=1950
regions=[]
for s,p in zip(e['surfaces'],e['visual_front_reconstruction']['surface_placements']):
 pw=p['width'];ph=p['height']*h/1000
 regions.append(surface(s['id'],'上方高鋁片' if s['id']=='back' else '下方前鋁片',1000,1000*ph/pw,p['x'],p['y']*h/1000,pw,ph,[[x/1000,y/1000] for x,y in s['polygon']],'metal',20 if s['id']=='back' else 200))
out['E']=dict(width=1000,height=h,bodies=[body([[78,450],[983,3],[670,1875],[290,1770],[120,750]],'metal',14,15),body([[25,995],[789,560],[840,1780],[530,1950],[0,1740]],'stone',480,80)],surfaces=regions,variants=[v['name'] if isinstance(v,dict) else v for v in e['color_rules']['combinations']],source=e['source_url'])
# F: the source is a front elevation. Keep its slots and decorative exclusions.
f=audit['F'];variants=[]
for s in f['surfaces']:
 variant=s.get('variant',s.get('id'));variant={'main-ridge':'ridge','main-water':'water','main-diamond':'diamond'}.get(variant,variant)
 # The audit uses explicit variant_id on some captures.
 variant=s.get('variant_id',variant)
 if variant not in ['ridge','water','diamond']:
  variant=['ridge','water','diamond'][len(variants)]
 cx0,cy0,cx1,cy1=f['visual_front_reconstruction']['source_circle_bounds_px'][variant]
 x0,y0,x1,y1=s['source_bbox_px'];cw=cx1-cx0;ch=cy1-cy0
 pw=(x1-x0)/cw*1000;ph=(y1-y0)/ch*1000
 name={'ridge':'稜線','water':'水流','diamond':'菱格'}[variant]
 reg=surface('main',name+'壓克力客製區',1000,1000*ph/pw,(x0-cx0)/cw*1000,(y0-cy0)/ch*1000,pw,ph,[[x/1000,y/1000] for x,y in s['polygon']],'acrylic',70)
 mask=Path(s['alpha_mask']);dst=ROOT/'public/assets'/mask.name;shutil.copy2(mask,dst)
 reg['sourceMask']='/assets/'+dst.name
 variants.append(dict(id=variant,name=name,width=1000,height=1000,bodies=[],surfaces=[reg],circleSource=[cx0,cy0,cw,ch]))
out['F']=dict(width=1000,height=1000,shapeVariants=variants,variants=[a+b for a in ['白','黑','綠'] for b in ['金','銀','銅']],source='https://www.re-o.co/products/f款-層疊獎牌。再生大理石。綠')
meta=dict(version=3,units='diagram-relative visual units, not mm',note='D/E/A: diagram reconstruction; B/C rectangular plaques; F official front silhouettes. Shared by every preview and PDF.',models=out)
(ROOT/'src/data/canonical-models.json').write_text(json.dumps(meta,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Compiled canonical models',[(k,len(v.get('surfaces',v.get('shapeVariants',[])))) for k,v in out.items()])
