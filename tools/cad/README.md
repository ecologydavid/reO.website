# CAD → studio pipeline

Turns the owner's STEP files into the plaque studio's 3D models, plate outlines and front views.
Pure JavaScript (Node + the project's own three.js); no CAD kernel or outside code is run.
First used for D and E on 2026-11-06 (`公版D款.step`, `公版E.step`), then A, B and C on 2026-11-07
(`公版A.step`, `公版B.step`, `公版C.step`). F is not converted.

## Steps

Run from a scratch folder; Node is the bundled runtime (see AGENTS.md).

1. **Tessellate** each STEP into triangles (millimetres, Z up as in the CAD):
   `node step2mesh.mjs <file.step> <out.json> [chordTolMm]`.
   - Use `.02` for the web and `.008` for OBJ hand-offs.
   - The report lists every solid with its colour, size and `holeEdges`, which must be 0.
2. **Optional OBJ for people**: `node toobj.mjs <out.json> <file.obj>`. This writes OBJ and MTL with normals.
3. **Studio data**: `node cad2web.mjs`.
   - It reads `Dw.json`, `Ew.json`, `Aw.json`, `Bw.json` and `Cw.json` from the current folder.
   - Which solid is wood, stone or metal is chosen inside the script, by STEP solid id. The A, B and C files hold
     several finishes of the same shape; one set is used and the finish is a material choice.
   - It writes `public/assets/models/cad-<id>.bin` and `src/data/cad-models.json`, which holds the mapping, part ranges and the CAD plate planes.
   - It keeps each model's `front` entry (front-view margin) when it rewrites `cad-models.json`.
   - It also computes E's plate outlines from the CAD:
     - **rear panel**: the panel minus whatever lies in front of it;
     - **front flap**: the flap's own face.
4. **Write the outlines and planes into the canonical data**: `node applycad.mjs A B C` updates `src/data/canonical-models.json` and `src/data/model-meshes.json`.
   - It sets the model height, each surface's position, size and outline, and each plane. It also clears old placement overrides.
   - D and E were applied by hand on 2026-11-06, and D's main outline is squared to the plate corners. Do not rerun applycad for D or E.
   - The editor, front view, 3D and PDF all read these.
5. **Front views**: start the dev server and headless Edge (port 9333), then run `node frontgen.mjs <A|B|C|D|E>`.
   - File keys must match `frontKey` in `src/editor/canonicalRender.js`. A's key is wood then base, for example `hw` (北美黃檜 with white stone) or `xm` (木橫擔 with 水庫淤泥).
   - Rerun it whenever a material changes.
   - It renders the model head-on for every finish into `public/assets/models/front-<id>-<finish>.webp`.
   - It adds `front.margin` to `cad-models.json`.
   - Run it after step 3, because step 3 rewrites that file.
6. **Check**:
   - Run `node scan.mjs <D|E> <outPrefix>` for 12 views: front, sides, back, top, low, grazing, close and far.
   - Pass a JSON list of views for close-ups, aimed at fractions of the model's bounds.
   - Run the tests, including `tests/chamfer.test.mjs` and `tests/model-meshes.test.mjs`.
7. **Build path on Windows Git Bash**: give vite `--outDir` as a Windows path (`C:...`). With `MSYS_NO_PATHCONV=1`, a `/c/...` path is passed through unconverted and Node writes under `C:c...`.

## Conventions

- **Scene units**: X right, Y down, Z toward the viewer.
- **D**: 4808 units = 249.6 mm, so k ≈ 19.26 units/mm.
- **E**: 1000 units = the metal's 103.4 mm width, so k ≈ 9.67 units/mm.
- **A**: 1000 units = the 55 mm column, so k ≈ 18.18. The 57 mm stone base overhangs by about 18 units each side.
- **B**: 1000 units = the 124.1 mm board, so k ≈ 8.06.
- **C**: 1000 units = the 150 mm board, so k ≈ 6.67.
- **Front**: the CAD front is −Y, except C, whose plate is on +Y. C is mirrored in X (`front:'+y'`).
- **Textures**: A, B and C size the box projection to each part and start it at the part's corner, so small pieces such as A's base show the stone at a sensible scale.
- **Supported STEP content**: planes; cylinders; cones; spheres; tori; rational and non-rational B-splines; line, circle, ellipse and B-spline edges.
