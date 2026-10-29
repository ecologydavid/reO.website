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

## Photo calibration and content migration (v4)
The user supplied actual multi-angle photos and diagrams and requested more faithful
geometry/material rendering. Preserve real A/D corner cuts, B wrapped stone, C depth
facets and E tilted plates/folded foot. Use the same canonical layout in front, detail,
3D and PDF. Photo-derived textures are visual references, not measured PBR/CAD.
Detailed content must stay INSIDE this site. Never restore old re-o.co read-more links.
Retain six navigation groups, searchable/filterable libraries, full articles and the
prominent40-logo wall with verified relationships. Original empty policy templates
must not be published as company policies. Follow design/V4.txt and V4-QA.txt.


## Image-led homepage (v10, 2026-10-26)
User direction: white base, quality, recycling; images carry the message, a short Ming headline
names it, minimal small text. Follow design/HOME-V10.txt (以材為像). Homepage styles live in
src/components/home-v10.css scoped to .rv-home; shared Arrow/RoundArrow/SectionHead/Frame in
src/components/site/ui.jsx. The approved glass LogoWall component is reused unchanged.
Library cards hide summaries (still searchable). Editor, geometry, masks and PDF untouched.

## Consolidated navigation and refined controls (v11, 2026-10-26)
User request supersedes the v4 "six navigation groups" rule: the header shows FOUR direct
links (公版獎盃 / 合作案例 / 循環材料 / 關於 re.O) plus 排版工作室 and 選單 pills. 選單 opens a
one-page full-screen overview of every destination; deeper filters stay on library pages.
All destinations must remain valid (tests/content-migration checks groups + support links).
Controls: arrows always sit in a round chip; buttons are pills (dark/ghost/light/glass) from
src/components/site/ui.jsx + ui.css. No thin underline + long-arrow links. Layout language
follows the sunye_web.studio reference: full-bleed photo hero with overlaid headline, large
Latin display titles with counts, numbered photo cards, dark footer with large wordmark.
UI UX Pro Max skill is installed at ../.claude/skills/ui-ux-pro-max (v2.15.0, MIT).

## Brand mark and image frames (v12, 2026-10-26)
- The company's animated logo (public/assets/reo-logo-motion.gif, 300px, 1.8s draw cycle) is the
  re.O mark everywhere: header, menu, footer, about block, editor header, loading screen. Use
  BrandLogo from src/components/site/ui.jsx; never a static <img> of the old PNG. It draws once on
  entering view and on hover, then rests on reo-logo-still.png (the GIF's final frame); `loop`
  only for loading screens; reduced motion shows the still. PDF/favicon stay static PNG.
- Never letterbox photos (object-fit: contain + colored box). Frames take each photo's own ratio:
  article galleries use justified rows (src/content/justify.js, tested), portrait lead images get
  a narrower column. Uniform gutters; every row spans the measure.
- Offline exporter only rewrites plain src="…" asset attributes; write other asset attributes as
  JS expressions (srcSet={path}) so build:offline keeps working.

## Standard vs custom, image-led articles, designed About (v13, 2026-10-26)
- 公版獎盃 and 客製化獎盃 are separate: five header links (公版獎盃 / 客製化獎盃 / 合作案例 /
  循環材料 / 關於 re.O), separate homepage sections (#collection, #custom), and #/read/pages/custom
  renders the designed CustomPage (src/content/CustomPage.jsx). Tests pin this split.
- Article pages never stack long text: src/content/arrange.js (tested) turns each section into a
  photo + text chapter (alternating sides), maps old-site short captions to their detail photos,
  drops the 詳細資訊 block when metadata exists, and turns material/service pages whose sections
  mirror their links into a works index led by each linked case's photo. Text-only pages (FAQ,
  policies) keep the TOC layout.
- About / awards / contact render AboutPage: contact details (email, phone, hours, address, UBN)
  are the first thing on the page. Partner-logo images are not repeated there (the homepage and
  brand wall carry them). Art photos: drifting studio reel, origami pairs that lift in a slow wave
  on a black band matched to the photos (#0a0a0a). All motion stops under reduced motion.

## Landing pages, hero and footer (v14, 2026-10-26)
- 公版獎盃 / 合作案例 / 循環材料 (and the other libraries) use the About language via
  ContentLibrary + src/content/landings.jsx: Latin display + h1, a key-facts card (verified product
  facts, or group counts that act as filters), full-bleed photo, one feature band (dark studio
  steps, dark IP gallery, drifting material reel), numbered index grid, closing row.
- Homepage hero: frosted left column (kicker, headline with line reveal, site figures from
  src/components/site/stats.js — tested against the content index) and an A–F pick bar that opens
  the editor. Phones stack the panel under the photo.
- Footer: the animated mark signs the company info row; no standalone logo row.
- Press thumbnails stay in full colour.

## Featured D/E hero, banner cards, eight-step process (v15, 2026-10-26)
- Hero: headline column + separate stage, so trophies are never under text. D and E alternate on
  the stage (tabs with progress; pause on hover; no autoplay under reduced motion). Object
  positions are tuned so every trophy is whole at 1100–1900px and on phones (tabs get their own
  strip there). D shows its three-colour photo only from 1280px. D and E lead the collection.
- Images that show a client name must be shown whole: case cards use the old-site 2:1 banner
  (src/data/card-images.json + cardImage(), tested) in 2:1 frames, never cropped.
- Process is eight steps sourced from the marble page chart and the journal articles
  (重新定義「廢料」, 實驗再生材質, 強化材質脫氣升級, 工廠步驟把關); keep it sourced.

## Header interaction and hero loop (v16, 2026-10-26)
- Header is sticky: condenses (72px, frosted ::before layer — never put backdrop-filter/transform
  on the header itself while the menu is open, it would trap the fixed menu), hides on scroll down
  past 320px and returns on scroll up. Links sit in a stone capsule with a sliding white pill
  (rests on the current section, follows hover/focus), rolling labels and a dot for the current page.
- Hero loops endlessly, 12s per slide (the progress bar's animationend advances it; a timer under
  reduced motion). A pause/play button is required (WCAG 2.2.2). Gold sand (src/components/
  GoldDust.jsx, canvas) drifts while playing, gusts on each slide change, fades over the headline
  column, stops when paused, off screen or in a hidden tab, and is not drawn under reduced motion.

## Process, materials and brand wall sizing (v17, 2026-10-26)
- Process track stays inside the page margins and always shows whole, equal cards (4/3/1 per view).
- Home material swatches carry their names on the photo (large bold serif, white, bottom shade).
- Brand wall tiles: 8 per row, 5:4, so the 40 logos fit in five rows on desktop.
- Display titles carry no bracketed item counts (user decision 2026-10-27).

## Load weight and icon centring (v18, 2026-10-27)
- Round icon buttons centre their icon on both axes (the hero pause toggle needed place-content).
- Keep the first screen light: brand-wall logos load only as the wall approaches (BrandMark
  IntersectionObserver); the slab texture is a 640px WebP (the 2.7 MB PNG is no longer used);
  the first hero slide and its haze copy both carry fetchPriority="high".
- GoldDust stamps pre-rendered glow sprites; never use a live shadowBlur per grain per frame.

## Process at a glance, custom modes (v19, 2026-10-27)
- Home process is film (user idea 2026-10-27): strips of four frames (two on phones) read left to
  right, 01–04 then 05–08, joined by a ribbon of film looping from the end of one strip to the start
  of the next (FilmTurn: true arcs at the real pixel width, outer edges flush with the strips,
  filleted inner corners; strips have rounded outer corners and square joined corners). Frames wipe
  in left to right, then the ribbon draws into the next strip. Phase legend 回收 → 再生 → 成形 → 再利用 above; each frame shows
  its number, phase, step name and line on the photo. Never stack a phase's steps in one column. Steps 07–08 use model B (木客微光 × 匠子) photos.
- 客製化獎盃 has two modes only (專案訂製, 專料訂製); 公版 A–F lives on its own page.

## Film depth, phase brackets, Pinkoi retail window (v23, 2026-10-27)
- The film has thickness: a darker edge under strips and ribbon, a light upper edge, soft shadow,
  and lighter far ends on each turn. Desktop phase titles stand on brackets spanning exactly their
  two frames (回收・再生 above the first strip, 成形・再利用 below the last); phones keep the legend
  and the gold phase tag inside each frame.
- Retail: the studio's official Pinkoi store https://www.pinkoi.com/store/chanzstudio (匠子 CHANZ
  STUDIO). ShopWindow (src/components/site/ShopWindow.jsx) sits on the homepage after 授權與聯名 and
  as the 生活設計商品 landing band; the menu foot and footer carry「Pinkoi 線上選購 ↗」. Every Pinkoi
  link opens a new tab and says so to screen readers. Copy follows the 匠子 page; no store ratings.

## Collection labels (v24, 2026-10-27)
- Each A–F card: the model letter in a white tab cut into the photo's bottom-left corner (Ming serif,
  turns ink on hover), then the name in serif and one spec line from models.json (type・height or
  diameter・NT$ price). Small cards show only the round start arrow (label kept for screen readers);
  on phones that arrow sits in the photo's bottom-right corner and the spec stacks.

## GitHub Pages deployment (2026-10-27)
- .github/workflows/deploy-pages.yml builds on every push to main (pnpm install, tests, build) and
  force-pushes dist to the gh-pages branch; Pages serves that branch at
  https://ecologydavid.github.io/reO.website/ (Pages was enabled by the first gh-pages push).
- Pages serves under /<repo>/. Source keeps root paths ('/assets/…', '/content/…'); vite.config.js
  prefixes them at build time when BASE_PATH is set, and catalogue.js rebases fetched page JSON.
  Keep new public-file references as plain '/assets/…' or '/content/…' string literals.

## Header rhythm (v26, 2026-10-28)
- 8px grid, one 48px control height: capsule (4 + 40 + 4), 排版工作室 and 選單 buttons all 48px on one
  centre line; header 96px (72px condensed, 76px phones). Links 20px padding with 4px gaps (24px from
  1600px, 14px at 1320px and below); actions 12px apart. Media steps sit after the base rules.

## Spec sheets and material tabs (v27, 2026-10-28)
- Landing and About fact cards (.pg-contact) have no grey box: an ink rule on top, two columns of
  facts with hairlines, values in the Ming serif; group cards (cases, materials) lead with large
  tabular numerals. Material reel names sit in a white tab cut into each photo's bottom-left corner
  (index + bold Ming name), matching the A–F letter tabs. No floating pill labels on photos.

## Hero performance, even custom grid, brand ledger, clean case photos (v28, 2026-10-29)
- Hero: the panel haze uses pre-blurred 160px images (public/assets/hero-haze-*.webp), never a live
  blur filter; the E photo is hero-wide.webp, preloaded from index.html on the home route only.
  GoldDust starts after load + idle, bakes its edge fade into grain alpha (no CSS mask), draws at 1x
  (1.5x on capable devices), caps at 60 fps, runs fewer grains at 30 fps on phones/modest devices and
  steps down (finally stops) if frames keep running late. Zoom and progress bar pause off screen.
- Home Custom: no stagger on desktop. Three modes in one even row (3:4), selected works in an even
  row of four (4:5).
- Brand wall: hairline ledger under an ink rule, grey marks, flat cards that turn over to an ink face
  with the project name. No glass, gradients, granule texture, thickness or shadows.
- Case cards show a clean product photo (src/data/case-photos.json, hand-picked; not the old 2:1
  banners that print the client name). The client appears only on hover/focus as a white tab rising
  from the photo's lower-left corner (splitCase in catalogue.js).

## Brand index, shop button, one view per set (v29, 2026-10-29)
- Brand wall (supersedes the v28 grey flip ledger): marks in their own colours on white tiles over a
  warm ground (#f4f2ec). Pointing at a mark dims the others and a print of the work (520px WebP in
  public/assets/brand-previews, `preview` in logo-wall.json) follows the cursor with project and
  partner; keyboard focus shows it beside the tile; touch goes straight to the case. 木客 sits on an
  ink tile; DCC prints as a silhouette.
- Header: a Pinkoi pill (ivory, tilted arrow, new tab) beside 排版工作室; "選購" drops 1101–1320px
  and on phones.
- A set of photos and their facts must read in one screen. Home collection (desktop): E and D two
  columns wide and two rows tall, the other four as a 2×2; row height = min(window-based, the height
  that keeps E/D at least 4:5 so no trophy is cut). Home materials: 3×3, row height from the window.
  Standard page: all six models in one row of 4:5 frames.

## Case peek and group ledger (v30, 2026-10-29)
- Case cards: the client tab keeps even inner margins (16px left, 14px top, 13px bottom). On hover the
  photo narrows to its own shape where possible (--main 0.56–0.72, so the whole piece stays in view)
  and two hand-checked detail shots (public/assets/case-details, 480px; case-details.json, no event
  photos or name banners) slide in on the right; the lower one shows "+N" photos left on the page.
  Details mount on first hover only. Used on the cases index and the custom page works list.
- Cases/materials summary reads as a phrase: group name (Ming) left, count (light, tabular) and unit
  right on one baseline, e.g. 企業獎盃 … 36 件作品; the name filters the index.

## FAQ page and line breaking (v31, 2026-10-30)
- #/read/pages/faq is a designed page (FaqPage.jsx): three key numbers, then every answer open in a
  question | answer ledger (訂製方式 / 製作與配送 / 材質), then contact. Answers are shortened from
  the migrated FAQ and shipping policy in the company's voice; never mention "舊官網/舊站" to visitors.
- Line breaking: headings and card titles use text-wrap:balance, running text text-wrap:pretty
  (site.css). Old-site copy split into unpunctuated phrases is flowed into one paragraph by
  flowParagraphs (arrange.js; joins with "，", closes with "。", words unchanged; labels, specs and
  steps excluded). keepRanges keeps "3～4 天" style ranges with their unit on one line.
- Case detail tiles size by count (--n), so a case with one detail fills the column. Related cards
  without a photo render as text cards, not grey boxes.

## Shorter home, contact sheets, SEO basics (v33, 2026-10-30)
- Home keeps hero, process, collection, custom modes, materials, 16 partner marks (12 on phones, link
  to all 40) and the shop: about 9 screens instead of 14. Selected works live on the custom page, IP
  collaborations on the cases page, studio/craft/awards on About. Do not add them back to home.
- Custom page header shows email and phone like About; buttons 寄信洽詢 / 來電洽詢. Contact values:
  Chinese in Ming 500, email/phone in the Latin sans; .pg-keep phrases never break (address splits
  only between 板橋區 and 實踐路).
- SEO: src/seo.js setPageMeta sets title, description and og/twitter copies per route (App only
  handles the editor). index.html carries canonical, Open Graph/Twitter (assets/og-image.jpg, 1200×630),
  Organization JSON-LD and a noscript summary; %SITE_URL% comes from the SITE_URL env (workflow), and
  the build writes robots.txt and sitemap.xml. Hash routes cannot be indexed as separate URLs; moving
  to path URLs with prerendered HTML is the next step if search traffic matters.
