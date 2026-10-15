from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/editor/ThreePreview.jsx'
s=p.read_text(encoding='utf-8')
a=s.index("import {materialTexture")
b=s.index('export default function ThreePreview')
s=s[:a]+"import {buildModel,disposeGroup} from './ThreeModel.js';\n\n"+s[b:]
s=s.replace("renderer.toneMappingExposure=1.1","renderer.toneMappingExposure=.95")
s=s.replace("'#7b8075',3","'#7b8075',2.2").replace("DirectionalLight('#ffffff',4)","DirectionalLight('#ffffff',3)").replace("DirectionalLight('#f3e7ce',2)","DirectionalLight('#f3e7ce',1.2)")
p.write_text(s,encoding='utf-8');print('3D now uses photo-audited XYZ meshes and shared surface bases')
