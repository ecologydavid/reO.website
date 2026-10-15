from pathlib import Path
from PIL import Image
import json,re,shutil
ROOT=Path(__file__).resolve().parents[1]
RESEARCH=ROOT.parent/'research'
OUT=ROOT/'public/assets'
OUT.mkdir(parents=True,exist_ok=True)
models=json.loads((RESEARCH/'data/trophy-models.json').read_text(encoding='utf-8'))
def copy_media(id,name):
    src=next((RESEARCH/'assets').glob(id+'.*'))
    dst=OUT/(name+src.suffix)
    shutil.copy2(src,dst)
    return '/assets/'+dst.name
for model in models:
    model['photo']=copy_media(re.search(r'image_clips/([a-f0-9]+)',model['gallery'][0])[1],'product-'+model['id'])
    model['referenceImage']=copy_media(model['reference'],'reference-'+model['id'])
    preview_index={'A':0,'B':0,'C':0,'D':2,'E':2,'F':1}[model['id']]
    model['previewPhoto']=copy_media(re.search(r'image_clips/([a-f0-9]+)',model['gallery'][preview_index])[1],'preview-'+model['id'])
    if model['id']=='F' and (OUT/'preview-F-clean.png').exists():model['previewPhoto']='/assets/preview-F-clean.png'
    # A public reference image is displayed unchanged. Normalized photo mappings
    # are a visual demo calibration, never millimetre manufacturing geometry.
    for key in ('gallery','reference_source_url'):model.pop(key,None)
(ROOT/'src/data').mkdir(parents=True,exist_ok=True)
(ROOT/'src/data/models.json').write_text(json.dumps(models,ensure_ascii=False,indent=2),encoding='utf-8')
copy_media('6965d25160a02116c1d757b0','material-powder')
copy_media('6965c88111f33b5acc98b65b','material-wood')
copy_media('6965cddd8afb055a43cf0737','material-glass')
copy_media('6a5f126a292c6c51e437249c','hero')
print('Prepared public product photos and unchanged official reference drawings')

# Binary masks encode the three public red customer areas. This analyses
# reference pixels; the official photograph and reference file stay unchanged.
reference=Image.open(RESEARCH/'assets/6a743800b4f98b70b6fce931.jpg').convert('RGB')
for i,(x0,x1) in enumerate([(45,420),(490,875),(945,1330)]):
    crop=reference.crop((x0,670,x1,1030))
    alpha=Image.new('L',crop.size)
    alpha.putdata([255 if r>190 and g<100 and b<100 else 0 for r,g,b in crop.getdata()])
    bbox=alpha.getbbox();alpha=alpha.crop(bbox)
    # Transparent canvas is a generated interaction mask, not a retouched photo.
    mask=Image.new('RGBA',alpha.size,'white');mask.putalpha(alpha)
    mask.save(OUT/f'f-mask-{i+1}.png')
