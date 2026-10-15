from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT.parent
j=json.loads((WORK/'research/data/model-audit-v4.json').read_text(encoding='utf-8'))
out=ROOT/'public/assets/material-refs';out.mkdir(exist_ok=True)
textures=[]
for t in j['texture_candidates']:
 im=Image.open(WORK/t['source_file']).convert('RGB');w,h=im.size;im.thumbnail((2000,2000),Image.Resampling.LANCZOS);sx,sy=im.width/w,im.height/h
 name=t['source_asset_id']+'.webp';dest=out/name
 if not dest.exists():im.save(dest,'WEBP',quality=90)
 x0,y0,x1,y1=t['crop_xyxy_px'];textures.append({'id':t['id'],'src':'/assets/material-refs/'+name,'crop':[x0*sx,y0*sy,(x1-x0)*sx,(y1-y0)*sy]})
models={}
for key,m in j['models'].items():
 meshes=m.get('mesh_proposals',[])
 if key in ['A','D']:meshes=[m['mesh_proposal']]
 if key=='C':meshes=[m['wood_mesh_proposal'],m['mesh_proposal']]
 if key=='E':meshes=[m['stone_mesh_proposal'],m['metal_foot_mesh']]
 models[key]={'meshes':meshes,'surfaces':m['surface_attachment'],'placement':m.get('surface_placement_override',{})}
(ROOT/'src/data/model-meshes.json').write_text(json.dumps({'models':models,'textures':textures},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Prepared photo-calibrated meshes and nine unlettered material source regions')
