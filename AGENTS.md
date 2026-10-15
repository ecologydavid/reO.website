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

## Authorized editor expansion (2026-10-16 follow-up)

The user rejects the v2 homepage aesthetic except the official logo and explicitly
authorizes upgrading the editor before redesigning the homepage again. Preserve
all existing core capabilities while replacing view tabs with simultaneous overall
and editable detail views. Add a real rotatable 3D model and an orthographic front
view. Use ONE canonical shape and placement for front, detail, 3D and PDF. Verify
D/E/F against official diagrams; protect nonrectangular boundaries and prevent
objects from leaving them. Offer only verified official product color combinations.
Expand common typography controls. Prior "unchanged" rules apply to visual-only
home edits; this explicit request authorizes editor/geometry improvements.
The 3D/front models are visual reconstructions from public references, not CAD.

## Visual direction

User prefers the restrained design of Panasonic Archi Design's about page:
https://www2.panasonic.biz/jp/archidesign/about/
Use re.O's own official logo, real photographs and verified copy. Favor generous
negative space, architectural alignment, purposeful typography
and purposeful gentle movement. Avoid generic AI-looking ornaments, invented ESG
statistics/certifications, excessive cards, gradients and promotional badges.

## Current homepage direction (v3)
The rejected v2 cool gray and thin sans treatment is superseded. Use warm ivory, Ming/Song editorial headlines, authentic large enterprise/IP photographs, an open public catalogue, asymmetric portfolio work pairs and a dark craft/material band. Follow design/HOME-V3.txt. Preserve the official circle logo and verified relationships. Protect all editor functionality from future home-only redesigns.

