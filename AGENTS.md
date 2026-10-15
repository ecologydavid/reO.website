# re.O website project requirements

## User-approved core (2026-10-16)

The user explicitly loves the existing plaque layout editor's functionality AND design.
Preserve this core through every homepage/template/brand redesign. Do not replace it
with a static mockup, remove controls, or redesign its layout without a new request.

Required retained behavior:
- A–F official trophy choices, photographs, calibrated plaque positions and clipping.
- Separate editable surfaces; F's ridge/water/diamond masks preserve the official art.
- Multiple text boxes and uploaded graphics; drag, position, size, rotate, align, layers.
- Product/detail preview, undo/redo, duplicate/delete, local draft save/restore.
- Downloadable PDF using the same layout and official geometry; overflow guard.
- Mobile editing and the official reference drawing for each product.

Keep src/editor/**, src/data/geometry.js, official masks/photos and editor styling
unchanged during visual-only home redesigns. Scope homepage CSS to avoid regressions.
Run projection tests and verify the editor can still be entered from the new homepage.
PDF remains a preview confirmation sheet, not a 1:1 manufacturing drawing.

## Visual direction

User prefers the restrained design of Panasonic Archi Design's about page:
https://www2.panasonic.biz/jp/archidesign/about/
Use re.O's own official logo, real photographs and verified copy. Favor generous
negative space, neutral cool gray, architectural alignment, restrained typography
and purposeful gentle movement. Avoid generic AI-looking ornaments, invented ESG
statistics/certifications, excessive cards, gradients and promotional badges.
