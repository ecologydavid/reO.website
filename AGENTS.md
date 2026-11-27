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
  循環材料 / 關於 re.O), separate homepage sections (#classic, #custom), and #/read/pages/custom
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
  strip there). D shows its three-colour photo only from 1280px. D and E lead the classic.
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

## Classic labels (v24, 2026-10-27)
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
- A set of photos and their facts must read in one screen. Home classic (desktop): E and D two
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
- Home keeps hero, process, classic, custom modes, materials, 16 partner marks (12 on phones, link
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

## v34 header mark, footer credit, Pinkoi logo (2026-11-02)
- The header and menu logo read "re: for real": HomeMark in SiteHeader.jsx sets "for real" in Cormorant
  Garamond italic 500 (Google Fonts, `text=for real` subset, non-blocking link in index.html). It hides at
  1101–1240px, where the links need the room, and below 360px. On phones 選單 is icon-only (label kept
  for screen readers) so the mark, tag and both pills fit.
- Footer: the bottom legal band is gone; "© re.O 材質再生 循環設計" sits centred under the company row.
- The Pinkoi pill shows Pinkoi's own wordmark (public/assets/pinkoi-logo.png, cut from the brand-wall
  photo in its navy #033052). Hover/tap inks the chip; on hover the tilted arrow exits top-right and
  returns from bottom-left. Before this, the chip stayed white and the arrow kept its tilt, so hover
  showed no change.

## Studio v4: redesigned plate editor, EPS export (2026-11-03, explicit user request)
The user asked to replan the 銘版排版工作室 in the public site's look, make customising simpler, and
export both PDF and .eps. This authorises editor UI changes; all v3 capabilities stay.
- Layout (src/editor/Editor.jsx, editor-v4.css, own st- classes): left = product (01 款式 thumbs,
  02 finishes as swatches — only verified combinations; A splits wood × base, E shows two-tone sets —
  03 front/3D preview, tap a plate to edit it); centre = one large plate (PlateStage.jsx); right =
  settings (Inspector.jsx). Tablets put settings under the plate; phones stack and switch 排版/成品預覽.
- PlateStage: click to pick, drag to move, corner handles resize, round knob rotates (snaps 0/45/90°,
  Shift = 15° steps), double-click or Enter edits text, arrows nudge, Delete removes. Resizes/turns that
  would cross the outline are refused; moves keep the old slide-along-the-edge fit.
- Inspector: content, typeface cards, size slider, B/I/U + align + 橫/直, ink swatches (依材質 restores
  auto colour), 進階設定 for spacing, box width, x/y, angle. Layers with lock, up/down.
- Drafts autosave (debounced) to the same localStorage key; Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y / Ctrl+D.
- 下載檔案 menu: PDF 排版確認稿 (unchanged PdfExport.js) or EPS 向量檔 (EpsExport.js): every surface at
  approximate product scale (listed height or diameter ÷ scene units), red outline, text traced to
  outlines (trace.mjs: marching squares + Douglas–Peucker, tested in tests/trace.test.mjs), uploads
  embedded (Flate + ASCII85) and clipped to their traced alpha. Not CAD; production drawing by re.O.
- DualPreview.jsx and editor-v3.css were removed; ThreePreview/canonical rendering/geometry unchanged.
- v4.1 (same day, user request): objects may now run past the plate outline. Only the centre is kept
  on the plate's rectangle (settle() in Editor.jsx); the part outside shows red on the stage (spill
  canvas in PlateStage) and is never produced: previews, 3D, PDF and EPS all clip to the outline (the
  EPS wraps each surface's artwork in a clip path). Downloads are no longer blocked; the toast says when
  red parts were left out. 放回銘版內 (inspector) still uses fitObject to bring one object fully inside.
  The workspace, product preview, 3D view and PDF sheets are on white. This supersedes the earlier
  "prevent objects from leaving the boundary" rule.

## One brand wall, on home (v35, 2026-11-04)
- By request the home page shows all 40 partner marks (five rows of 8 on desktop) and the separate
  wall page is gone, so the wall exists in one place only. Hash routes are not indexed as their own
  pages (the sitemap lists home only), so home is where the names count for search. Each mark's link
  carries its name and project as text (the marks are canvases). Phones show 12 and open the rest in
  place (all 40 stay in the markup). #/brands still works: it opens home at the wall. This supersedes
  the v33 "16 partner marks, link to all 40" note.

## Custom page at a glance, whole trophies, one page end (v36, 2026-11-05)
- 客製化獎盃: the four services (專案訂製, 專料訂製, 包裝款式, 3D 建模服務) sit side by side in one view,
  each numbered n / 04, so the whole sequence and its last step read at once; packaging options follow
  as a short strip, then the works grid. The full-bleed 3D band is gone (04 is the fourth column).
- Case cards are square (the shape of most case photos) so the whole trophy shows before any hover.
  Portrait photos are shown whole; the frame's sides continue the photo's own edge colours (sampled
  from its left and right columns), so no band shows. Do not go back to 4:3 crops.
- Every page ends with the same open space before the footer (--page-end, site.css): main carries it
  and its last block drops its own bottom spacing. New final blocks need no padding of their own.

## Calmer page ends, tax ID in footer (v37, 2026-11-05)
- --page-end is clamp(72px,6.5vw,104px) (64px on phones), tuned by request after v36 felt too open.
  A ruled .pg-closing line is a short band: 40px above its text, 48–64px below, 56–80px from the
  content before it. The FAQ's tinted contact band keeps its own inner padding and meets the footer.
- The footer company line carries 統編：83502057 after the company name (also on About and in JSON-LD).

## Cleaner services, readable packaging, standard page flow (v38, 2026-11-05)
- 客製化獎盃 services share subgrid rows (title, description, keywords, link line up across columns);
  keywords are a quiet slash-separated line, not pills; each link sits on its own hairline.
- Packaging: heading, intro and the two options (全客製化 / 部分客製化) as item–detail rows on the
  left, the two box photos on the right.
- 公版獎盃 has no full-bleed hero photo. Right under the facts, the four ordering steps run on one ruled
  track over a stone band (numbered rings joined by arrowed lines, the last ring filled; vertical on
  phones). The six models follow at about one screen. Other landings keep their hero photos.

## D-only hero, interactive ordering flow (v39, 2026-11-05)
- By request the home hero features the D model alone (E stepped down): four real D photographs
  (three colours, stone grain, held in hand — tab 「將榮譽賦予份量」, the black corrugated gift box) under 「再生大理石，
  成就高雅的榮譽。」. Each slide has a pre-blurred 160px haze (public/assets/hero-haze-D-*.webp);
  phone tabs show numbers only.
- 公版獎盃 ordering flow: a photo on the left follows the active step (A–F mosaic, studio screenshot
  public/assets/studio-preview.webp, a lettered plate, the workshop); numbered rings on the right.
  Steps auto-advance in view with a hairline timer and stop once a visitor picks one. Step 01 names
  A、B、C、D、E、F (never "A–F" there). Step 02 states the layout help rule: more than 10 pieces may ask
  re.O to lay out; 10 or fewer pay a NT$500 layout fee for that help.

## Matching flow photos, press index (v40, 2026-11-05)
- Ordering flow photos: 03 提供資料 is an illustration (public/assets/flow-provide.webp, made in the
  browser: a LOGO vector-file card with a partner mark from the brand wall and a text and name-list
  card), 04 手工生產 is the studio photo of marble slurry poured into a mould (flow-casting.webp);
  both supplied or requested by the owner. Each photo must show what its step says.
- About 「報導與講座」: a stone band with an index (year, outlet, title, one line; external links open
  in a new tab) beside one sticky print that follows the pointed, focused or tapped entry. Prints are
  in full colour (by request, superseding the toned v40 prints). Every entry was checked against
  its linked page; covers are re.O's own photos of the work discussed or stills the studio already
  published. Never copy photos from outlets' sites. Unverified items (TISDC talks, GQ feature,
  Taiwan Designers' Week, 人間福報, MOT TIMES) wait for a source link before they are added.

## Bare header mark, 5s hero, no filler images, one record (v41, 2026-11-06)
- Every header (site and plaque studio) shows the animated circle logo alone; the "for real"
  signature and its Cormorant Garamond font link are gone (supersedes the v34 note above).
- Home hero: three D slides (三色, 將榮譽賦予份量, 黑卡浪紙盒包裝), 5s each (supersedes 12s). All slide
  photos keep their alt text for indexing; inactive slides stay aria-hidden.
- Section heads on home carry no read-more link (Process, Classic, Custom); nav and cards link on.
- Migrated pages hold no layout-only images: the three-tile 「— 案例 —」 dividers on the nine
  material pages, contact-page logo/FB/IG banners, a re: end card and two avatar icons were removed
  from public/content/pages and deleted. Client logos, dimension drawings, icon diagrams and the
  map are content and stay. Re-check new migrations for such tiles.
- About 「設計講座與產業報導」 (id about-awards) merges awards, industry roles, press and talks into
  one newest-first record with kind chips (全部/設計獲獎/產業參與/媒體報導/講座與平台); a year shows once;
  undated broadcasts close the list; each entry switches the sticky print (潛力企業獎 ceremony,
  award pieces, studio photos).

## One record with exhibitions and talks (v41b, 2026-11-06)
- 「設計講座與產業報導」 now also lists the 匠子 CHANZ STUDIO 「展覽、課程與分享」 items (2017–2026), 32
  entries in five kinds: 設計獲獎, 產業參與, 展覽活動, 講座課程, 媒體報導. Data lives in
  src/content/record.js (field notes at its top); add future press or talks there. Items without
  their own photo use a re.O event or studio photo marked `generic` (the print says 示意照片).

## Studio v5: realistic 3D, one stage, direct handling (2026-11-06, by request)
- 3D (ThreeModel.js / ThreePreview.jsx): physically based materials (sealed stone, oiled wood,
  brushed metal, clear acrylic), a studio environment built in the browser (RoomEnvironment plus a
  front soft box; no download), neutral tone mapping, a sub-millimetre chamfer on every body edge
  (chamferMesh in modelGeometry.mjs, tested in tests/chamfer.test.mjs; falls back to sharp edges
  where the result would not stay closed, e.g. C's wave), printed ink as a matte layer above the
  metal face. The body builds once per model/finish; edits only repaint plate textures; frames
  render only when something changed. Tapping a plate in 3D or the front view opens it to edit.
- Layout: picture in picture. Plate and finished product share one stone stage; one fills it, the
  other is a live corner card, tap to swap. Phones use the 排版/成品預覽 switch instead of the card.
- Plate: a floating toolbar above the picked object (size −/+, bold, edit, centre, copy, delete);
  double-click or Enter edits text in place; drags snap to the plate centre lines and other objects'
  centres (Alt = free) with a guide line; the plate and front view render at screen density.
- Canonical shape, PDF/EPS and all earlier capabilities are unchanged (renderCanonicalSurface's new
  `scale` option defaults to 1).
- Pending (owner will supply): real product photos or 3D files (glTF/CAD/scans) to replace the
  reconstructions; an optional path-traced "high quality still" can follow after that.

## Type system (v42, 2026-11-06)
- One set of faces and one scale for the public site, in src/components/site/type.css (imported by
  ui.jsx; scoped to `.folio-home.tx`, the class on the Home and ContentSite roots). Faces load from
  Google Fonts in index.html (non-blocking, display=swap): Noto Serif TC 500/600 for headings, Noto
  Sans TC for text, Inter for Latin, figures and labels. The thin PMingLiU fallback no longer shows.
- Scale: display (Latin section word, Inter 300) 116→56; h1 48→32; h2 38→26 (one size for every
  section heading); h3 20→18; card titles 17; lead 17/1.9; body 15/1.85 (articles 16/2); small 13;
  labels Inter 500 12 tracked. Grey text #686d65 (AA). Nothing on the site under 12px except legal.
- New headings or text blocks join an existing role in type.css rather than setting their own size.

## Navigation capsule (v43, 2026-11-06)
- Frosted-glass capsule (light stone tint, fine edge, inner highlight, backdrop blur). Labels 16px
  (15px under 1320px), weight 500, ink #2b302a. One marker only: the ink pill with white text rests on
  the current section and glides to the pointed or focused link (the current label turns back to ink
  meanwhile). The bold-plus-dot current marker and the white hover pill are retired. Rules at the end
  of src/components/site/site.css.

## D and E from the owner's CAD (2026-11-06, by request)
- The owner supplied STEP files and renders (C:\Users\ecolo\Desktop\所有或心美術圖\3D建模使用). D and E
  now use them everywhere: 3D (public/assets/models/cad-D.bin, cad-E.bin), front view and PDF (head-on
  CAD renders front-<id>-<finish>.webp), and the plate outlines/planes in canonical-models.json and
  model-meshes.json (D main runs edge to edge as in the CAD; E's rear outline is the panel minus what
  stands in front of it, E's front outline is the flap face; E height 1870.8 units = 193.4 mm).
- The "2022富邦長春LOGO" and "2025" assemblies in the D file hold no geometry and are not used.
- Pipeline and conventions: tools/cad/README.md (own STEP tessellator, no CAD kernel or outside code).
  OBJ copies for people sit beside the STEP files (公版D.obj, 公版E.obj).
- Checks: every solid closed (0 hole edges); 12-angle and close-up render scans for D and E; ink sits
  0.05–0.1 mm above each CAD plate face; E's default text follows its rear band (-33°) and the flap.
- A, B and C from the owner's CAD too (2026-11-07, by request; 公版A.step, 公版B.step, 公版C.step in the same
  folder). F is not converted yet.
  - Same pipeline (tools/cad): 3D cad-A/B/C.bin, front views front-A-{hw,hk,hm,xw,xk,xm}, front-B-{w,k},
    front-C-{w,k}, plate outlines and planes via tools/cad/applycad.mjs.
  - A: upper wood text area = the column's flat front face above the plate; lower = the CAD plate.
  - B and C: the main plate is the CAD plate, with its rounded corners. B's old placement override is gone.
  - Each file holds several finishes of one shape. One set is used, and wood and stone stay finish choices.
- Materials (owner's notes, 2026-11-07; drawn in src/editor/proceduralMaterials.js):
  - Metal plates never show horizontal hairlines. D (and the other brushed plates) is brushed top to
    bottom; E is anodised aluminium, an even matte grain with no direction.
  - D green stone is lighter grey-green with more flowing gold threads and yellow flecks.
  - E white stone is a white ground with silver-grey marble veins.
  - A, B and C use a drawn black stone. v2 (2026-11-08, owner: the hard cream strokes looked crude) follows
    D/E's black photo: a charcoal ground, soft smoky bands of muted gold flowing down the length, broken into a
    dry-brushed sandy grain. C draws it from lower on the stone (blackGoldStone(860)) because its wide, low
    piece only shows the top fifth of the map. White stone is the drawn marble on A–E.
  - F's green is D's drawn green, as a square crop for the disc.
  - A follows 公版A-1…A-6 (2026-11-08):
    - 北美黃檜 is a pale beige-tan wood; 木橫擔 is dark walnut. Both are drawn with flat-sawn cathedral figure.
    - 水庫淤泥 is a neutral matte grey; its swatch is #999896.
    - Text on walnut defaults to light ink.
  - D and E black keep their photo crops; B and C wood keep theirs.
  - After changing a material, rerun tools/cad/frontgen.mjs for D and E so the baked front views match.
- Old reconstruction meshes for D/E stay in model-meshes.json for the A/D cut tests only.

## Studio opens in its own tab (2026-11-07, by request)
- Every entry to 銘版排版工作室 opens a new tab:
  - links spread `studioTab` (from src/components/site/ui.jsx);
  - home buttons call `openStudio(id)`, which App passes as Home's `onPreview`.
- Covered entries: header button, menu link, footer button and links, home hero, A–F picks, product cards,
  the 公版獎盃 ordering flow, landing actions, and the product-page link.
- Switching models inside the studio stays in that tab (Editor's `onModelChange` still sets the hash).
- New studio links must use `studioTab` too.

## Process as a cycle (v43, 2026-11-08, by request; replaces the v20–v23 film)
- Home `Process` (src/components/Home.jsx; styles "V43 process as a cycle" in home-v10.css).
- Ring: drawn after the logo GIF (public/assets/reo-logo-motion.gif, analysed frame by frame: the ring is
  drawn counter-clockwise from just above the dot). The dot sits ON the ring at three o'clock with an open gap
  of 8° each side; no line touches it. Ring stroke 1 (viewBox units), progress and moving stroke 2, dot r 1.15
  (≈ the logo's dot-to-stroke ratio; the logo's own stroke was too heavy beside photos).
- Quadrant cuts: short light-grey ticks (#c9cbc5) at 12, 9 and 6, beneath the ring, never competing with it.
- Quadrants: counter-clockwise 回收 (top right), 再生 (top left), 成形 (bottom left), 再利用 (bottom right), two
  round step photos each, evenly at 45°. Each phase name and English name sit in the ring box's corner.
- Always shown (owner: the diagram stays put, only lines move). No reveal or fade-in on scroll. A short stroke
  leaves the dot, runs once round the ring and rests (7s loop; the dot swells as it returns). It runs only
  on screen, hides while a step is open, and is off for reduced motion.
- V47 (owner sketch, 2026-11-08): the quadrants are four square blocks behind the ring (2×2, 7% past the
  ring box, 8px white gutters that are the phase cuts; the grey ticks are gone). Filled pale stone
  #ecebe6 (回收, 成形) alternates with white + hairline #dcdbd4 (再生, 再利用), never dark, so the ring,
  photos and names lead; the phase in play deepens one step. Each phase name sits in its block's outer
  corner. A white disc fills the ring, so the blocks frame the circle. Ring box min(70vh,660px,46vw).
- V46 (owner, 2026-11-08): a lit, hovered or chosen photo lifts (scale 1.09, z above its neighbours, soft
  shadow) with a firmer 2.5px outline. Letting go of a step restarts the stroke from the dot and it keeps
  looping. On-screen state lives inside `useCycleFlow` (its own IntersectionObserver), never as a class
  on the stage: React rewrites that className when a step opens or closes. The run is near even speed so
  each photo stays lit about 0.5s. Layers: photos 2, lifted photo 3, centre picture 4.
- V45 (owner, 2026-11-08): the travelling stroke lights each photo it passes (black outline, `is-lit`).
  It is drawn frame by frame by `useCycleFlow` in Home.jsx, not CSS keyframes, so it knows when it is
  under a photo; only the drawn part of the dash counts. Ring radius 40 (`ringR`, and `--r` in CSS for
  the step numbers), so the centre picture is no longer covered; the centre picture is the top layer
  (z-index 3). The ring box keeps 4.5% room above and below for the photos that reach past it.
- V44 (owner, 2026-11-08: photos too small, sides too empty): step photos and the centre
  picture are 23% / 58% of the ring box on desktop, 20% / 50% at ≤1100px (CSS --node / --card). The ring
  sits between two side columns (desktop grid 1fr | ring | 1fr, ring min(76vh,720px,50vw)). Centre at
  rest: 「八道工序」 over 「一個循環」, four characters a line, no comma (no big 08).
  - Side photos are never shrunk side by side: a photo-pair file is split into public/assets/process/
    <id>-a|b.webp (white gutter removed) and the halves stack full width (`pair:true` in processNotes).
  - At rest: left lists the four phases (hover dims the other quadrants, click opens the phase's first
    step); right is a material card (sample photo, 近 30 種廢棄原材, the material summary, link to
    #/read/pages/material-recycled-marble).
  - A chosen step (hover with 110ms intent, focus, tap): the photo grows into a 50% round picture in the
    centre (number, phase, step). The left reads it in full: n / 08, step, line, a longer text, keywords,
    a link to its studio article (previous / next arrows removed by request). The right shows a second photo from that article with
    a caption. Other photos fade under a white veil (never opacity, so the ring does not show through).
  - The fuller texts (`processNotes` in Home.jsx) are condensed from 〈重新定義「廢料」〉〈實驗再生材質〉
    〈強化材質脫氣升級〉〈工廠步驟把關〉 with no new claims. Keep them sourced.
- ≤1100px: the two columns sit under the ring. ≤760px: one column, the first step shown by default, and
  the material card hidden.
- The step list (`sequence`, `phases`) is unchanged. The node buttons carry the full step text for
  screen readers.
- D green v2 (2026-11-08, after 公版D-3…D-6): a sandy grey-green ground with bundles of mustard filaments
  flowing lengthwise (poured marbling), yellow flecks and pores. F shares it.

## Classic names on home (v48, 2026-11-08, by request)
- The home Classic grid (section #classic) shows only each model's photo and its English name, which keeps the
  model letter as its first letter: A APEX, B BOND, C CRYSTAL, D DELTA, E EXCEED, F FRAME (`classicNames` in
  Home.jsx). The Chinese name, spec/price line and 開始排版 buttons are removed there (other pages keep them);
  the photo still opens the studio in a new tab.
- The name grows out of the white letter tab in the photo's corner: the letter in the serif, the rest in serif
  small capitals on the same baseline, so it reads as one word. Motion (CSS only, "V48 classic names" in
  home-v10.css): on entering view the tab opens out from the letter and the letters rise one by one; on
  hover/focus the tab inks and the letters roll over in a wave. Reduced motion shows the name at once.

## Home materials, Big Data print (v49, 2026-11-08, by request)
- Home materials use the same photo as each material's card in the materials library (its page hero; 再生大理石
  is the broken slab pile, no longer the powder), and the materials landing reel uses the same nine. The material
  is named 焚化粒料 in titles and labels (its page title, the MATERIAL index label, home, reel); prose keeps its
  wording.
- Labels have no arrow chip: a large light numeral, a hairline, then the Chinese name over the English name
  from the studio's MATERIAL index (Recycled Marble, Glass, Wooden Crossarm — the old CROSSRAM typo fixed —
  Coffee Grounds, Reservoir Silt, Coal Ash, Sawdust, Wood Veneer Panel, Incineration Aggregates). Phones stack
  numeral over names.
- Brand wall: Big Data's print is the upright 2025 網路人氣標章 plaque shown whole (4000a780…webp, 520px).

## Home link, no studio button in the header, 39 marks (v50, 2026-11-08, by request)
- The header capsule starts with 首頁 (#/; current on home and #/brands). The 排版工作室 button is gone from the
  header (the menu overlay keeps its links). Studio entries that remain: home hero 開始 D 款排版 and the A–F picks,
  the home Classic photos, the menu overlay (公版獎盃 group link + 開始銘版排版), the footer (開始銘版排版 + the
  公版獎盃 column link), the 公版獎盃 landing (開始排版 action + ordering-flow step 01 picks) and each product
  page's 進入 X 款排版工作室 link. All open a new tab.
- Brand wall: one mark per case. 行政院國家永續發展委員會 shared the SDGs trophy with 行政院 and was removed; 39
  marks now (the last row has a gap until more are added). The test checks 39.
- Home material labels: the English line is pure white, 600, 13–15px, lightly tracked, under the serif Chinese.

## 公版獎盃 facts and flow, English model names, 品牌訂製 (v51, 2026-11-09, by request)
- Facts card (landings.jsx standard): Lead time 「3 個工作天」 with 「10 座以上工期另計」 beside it; Price is a
  full-width stone ledger (PriceList), one row per model: letter + English name, dotted leader, NT$ price.
  APEX 北美黃檜 2,500 / 木橫擔 2,800, BOND 2,800, CRYSTAL 2,000, DELTA 2,300, EXCEED 3,000, FRAME 680 (owner's figures).
  Card entries take an optional 4th value: class names for the row (is-wide spans both columns, is-inline).
- Ordering flow is three steps: 選擇款式 / 銘板排版及提供資料 / 手工生產. Step 02's terms (owner's wording) render as
  ruled rows in a white panel with outlined quantity tags (pg-flow-terms). 手工生產: 「製作工期依訂購數量而定。」
- The 六款公版 index shows APEX…FRAME (classicNames, now shared from src/components/site/classics.js).
- 生活設計商品 is renamed 品牌訂製: its own navigation group (6 groups, after 客製化獎盃; header, menu, footer) and
  page at #/explore/products (en 'Brand'), listing lifestyle products only (classic trophies stay on 公版獎盃).
  Non-trophy #/read/products/ pages highlight 品牌訂製 in the header. Content for this page is still to come.

## 品牌訂製 = former 客製化獎盃, 禮贈品訂製, one-line process (v52, 2026-11-09, by request)
- The 客製化獎盃 page moved whole into 品牌訂製 (CustomPage.jsx, en 'Brand'; route kept at #/read/pages/custom so old
  links land). 客製化獎盃 no longer exists as a name in navigation, home section 02, closings or breadcrumbs.
- 禮贈品訂製 (en 'Gifts', #/explore/products, nav id 'gifts') holds everything that is not a trophy, Pinkoi range
  included. Non-trophy #/read/products/ pages highlight it.
- Both pages carry the owner's 一條龍 process (ProcessLine.jsx + process-line.css): a hairline of seven stations
  that draws itself on view; vertical on phones. 品牌訂製: 概念設計、包裝規劃 > 3D 建模 > 開模 > 材質灌製 > 組裝 >
  品檢包裝 > 出貨, with 企業專料 joining 材質灌製 from below (links to the 專料訂製 service). 禮贈品訂製: 需求確認、造型設計、
  包裝規劃 > … > 出貨, no branch. Keep the owner's step wording.
- 公版獎盃: the title sits top-left (.pg-standard .pg-top aligns start); prices are a compact 3 × 2 grid (2 × 3 on phones).

## Steady header, plain prices, 品牌訂製 and 禮贈品訂製 rebuilt (v53, 2026-11-09, by request)
- Header jitter fix: the condensed header returns its lost height as margin-bottom (24px desktop, 32px phones) so the
  page never moves, and condensing has a gap (in above 40px, out below 8px). Keep both if the header changes.
- 公版 price: a plain 3 × 2 list (2 columns on phones), no box: "APEX 款" (bold first letter) above the price; A shows
  "NT$ 2,500 / 2,800" with 北美黃檜 / 木橫擔 under it.
- 品牌訂製 (#/read/pages/custom, category 'custom') and 禮贈品訂製 (#/explore/products) now render through ContentLibrary
  like 公版獎盃: facts card (訂製方式, 包裝, email, phone) → 一條龍 ProcessLine → GuideBand (the 公版 ordering band,
  generalised in landings.jsx) → case index → closing. CustomPage.jsx is gone.
  - 品牌訂製 GuideBand: 專案訂製, 專料訂製, 包裝款式 (packaging options as ruled terms), 3D 建模服務. Cases: 企業獎盃.
  - 禮贈品訂製 GuideBand: 品牌禮贈, 品牌器物, IP 授權與聯名, 場域紀念, each told by one real case (copy from that case).
    Cases: every non-trophy case (生活設計 + IP生活設計). The Pinkoi shop window and old product pages are no longer listed.
  - Case lists run newest first; undated cases and proposals last.

## The process is the image-led band (v54, 2026-11-09, by request) — supersedes the v52/v53 ProcessLine
- ProcessLine is removed. On 品牌訂製 and 禮贈品訂製 the GuideBand (compact mode) holds the owner's 一條龍 steps, one
  item per step, each with its own photo and text condensed from the site's pages (訂製 CUSTOM, 建模 MODELING, 關於,
  journal 實驗再生材質 / 可回收包裝材 / 生產鏈合作循環運送, home process ring); no new claims.
  - 品牌訂製: 01 概念設計・包裝規劃 → 02 3D 建模 → 03 開模 → ＋ 企業專料 (選配, unnumbered, dashed ring and line) →
    04 材質灌製 → 05 組裝 → 06 品檢包裝 → 07 出貨.
  - 禮贈品訂製: 01 需求確認・造型設計・包裝規劃 → 02 3D 建模 → 03 開模 → 04 材質灌製 → 05 組裝 → 06 品檢包裝 → 07 出貨.
- Compact mode: only the active step opens (grid-rows ease); picked by click/tap/keyboard, not hover; auto-advances
  while in view until picked. The 公版 band keeps its open, hover-to-pick behaviour.

## Footer as one block (v55, 2026-11-10, by request)
The footer info row shares the link grid (lead column + six) with no rule between them: the mark in the lead
column, then 公司 / 聯絡 / 服務指南 (two columns each) under the same small headings as the link groups. 統編 sits
under the phone in 聯絡. A hairline inside the gutter, then the centred "© re.O 材質再生 循環設計" closes the page.
v56 (by request): one way of writing the footer text. Every 公司 and 聯絡 line has a two-character grey label
(名稱 地址 時間 來訪 / 信箱 電話 統編) with its value beside it; 服務指南 stays a plain list of links like the groups
above. One text size (14px, as the links above), one row rhythm (12px) and the same heading gap as the link groups.
On phones 公司 and 聯絡 each take the full width.

## Studio v6: one clear workspace (2026-11-11, by request)
All studio capabilities, canonical shapes and exports are unchanged; this is layout only (Editor.jsx, Inspector.jsx,
editor-v4.css "V6" block at the end).
- Left: 01 款式 as 2-column photo cards (catalogue-X.webp, 3:2, letter + English name; 3 columns on phones);
  02 顏色與材質 as 40px swatches, each named underneath, the row naming the part and the current choice.
- Centre: plate and finished product side by side (about 1.75 : 1), both full height and live. This supersedes
  v5's picture in picture (no corner card or swap button). The plate pane is stone, the product pane white with a
  hairline; 正面 / 3D 旋轉 sit at its top right. Phones keep the 排版／成品預覽 switch and show one pane.
- 新增文字 / 上傳圖案 appear ONCE, in the right column (removed from the bar above the plate).
- Right: 04 內容 (add buttons, the list with lock and order) and 05 設定 (label left, one line per control:
  內容, 字體, 大小, 樣式, 顏色, then 進階設定). The column fits the screen; only the list shrinks and scrolls inside.
  Numbering runs 01–05 across the three columns.
- PlateStage padding scales with the pane (8%, 18–56px); the floating toolbar keeps its centring (its pop-in
  animation used to cancel translateX(-50%)). 3D framing leaves more side margin for narrow panes.
- v6.1 (same day, by request): text size reads and steps in whole px (inspector "px", toolbar "129px", ±1px
  at least per press). Colour is 黑色 or 自訂 (picker with its code); default text is black (#000) on plates
  whose ink was dark, light ink stays for dark wood/stone (inkFor in Editor.jsx). All studio text one step
  larger, grey #686d65; right column 330–380px.

## FAQ figures and pictures (v57, 2026-11-11, by request)
Facts: 公版 3 個工作天 (10 座以上工期另計), 設計校稿 3 次, 本島宅配 1–2 天; answers match. Each group's sticky
column carries a photo with a one-line caption; 公版/專案/專料 and the packaging answer have 72px pictures.

## One destination, one place (v58, 2026-11-11, by request)
Navigation (navigation.js) feeds the header menu overlay and the footer; every destination is listed once:
- Group headings link to their landing page, so the lists below never repeat it (no "公版獎盃 A–F", "全部…").
- 公版獎盃: 線上排版工作室. 品牌訂製: 3D 建模與設計 (企業獎盃 cases are on the page). 禮贈品訂製: Pinkoi 線上選購
  (retail, external, new tab; the header Pinkoi pill stays). 企業與IP案例: 合作品牌牆. 材料與工藝: 再生大理石,
  工藝與工作室文章. 關於 re.O: 設計講座與產業報導, 匠子 CHANZ STUDIO (moved from materials).
- 服務指南 (footer info row and menu foot) is the only home of 常見問題 (renamed from 訂製常見問題 / 訂製與服務常見問題),
  運送說明 and 退換貨說明. The FAQ breadcrumb reads 首頁 / 服務指南 / 常見問題.
- Removed duplicates: FAQ under 公版 and 品牌訂製; 聯絡與預約 and 品牌理念 (both the About page; contact is its first
  section and the footer); 品牌與工藝內容 (#/explore/about only re-listed About pages; About's closing now links CHANZ);
  case filters repeated under gifts and cases; 聯絡預約 and Pinkoi in the footer's 服務指南.
- Old routes still resolve. Footer headings are white 15px links with a hover arrow; sub-links 72% white.

## Action icons, light footer (v59, 2026-11-11, by request)
- Landing actions: 公版 = 開始排版・寄信洽詢・來電洽詢・訂製常見問題; 品牌訂製 and 禮贈品訂製 = 寄信洽詢・來電洽詢・
  訂製常見問題. Page buttons may link the FAQ (only the menus list each destination once, v58).
- Buttons that act carry an icon for what they do (ActionIcon / iconFor in ui.jsx: mail, phone, faq, studio pen);
  other buttons keep the arrow.
- Footer: warm stone (#f3f1ec) with ink text and a hairline above; black is kept for one slim closing band:
  "re.O 材質再生 循環設計" signature (Inter re.O + serif), "© <year> 或心國際設計有限公司", 回到頂部 button.
  Supersedes the dark footer and v34's lone centred credit line.
- v59.1: action icons are drawn centred on the 16-unit grid (bbox centre 8,8), render as 14px blocks in their chip
  and do not take the arrows' hover nudge (.rv-icon.is-action). Checked by measuring path bounds against the chip.

## Copy, case figures and covers (v60, 2026-11-16, by request)
- Brand wall note: 「依各專案的委製與合作關係展示；授權設計、代理委製等資訊詳見案例說明。」 (no HOLA).
- 企業專料 / 專料訂製 wording is 「企業有顆粒、粉末化可再利用的廢棄物料」 (band step, materials closing, FAQ, home custom line,
  migrated custom page and derived FAQ). The owner wrote 「粉末話」; read as 「粉末化」.
- 企業與IP案例 summary: `stats` in landings.jsx (合作企業 100+ 家, 企業獎盃 90+ 件作品, 品牌訂製 80+ 件作品) replaces the
  per-group counts; these are the owner's figures, not computed. The filter chips above the index still filter.
- Case covers (case-photos.json) now show the whole piece: 花瓣獎盃 6966ff…, 台達書頁 1769cc…, 網路人氣標章 4000a7…, SUP 獎牌
  a9132c…. The old covers moved into the hover details (480px in public/assets/case-details). case-national-sdgs.webp is
  portrait 1773×2364; it was listed as 1600×1200 and showed cropped (fixed in case-photos, page JSON and content index).

## Nine more covers, whole portrait details (v61, 2026-11-16, by request)
- New covers (case-photos.json): SDGs 鑰匙圈 4e9a26…, 總統盃黑客松 19b630…, 資誠永續影響力獎 007aaa…, 威廉瓊斯盃 5b900e…,
  台達玻璃樹 f9a083…, 山水獎牌 dacec9…, plus three crops in public/assets: case-fubon-champion.webp (富邦長春盃 高爾夫球獎盃,
  the "富邦 高爾夫球獎盃" title card cropped off), case-go-kart.webp (light-ground original research/assets/69f2dedf…,
  the "台達 跑跑卡丁車獎盃" title cropped off), case-top-100-skills.webp (square from research/assets/69fc3a4b…).
  Owner rule: a cover never shows an added client wordmark or title card; the client's name on the product itself stays.
  Replaced covers that duplicated a hover detail moved into the details (480px).
- Article 設計細節 frames are square; a portrait photo there (ratio < 0.85) is now shown whole with the frame's sides
  continuing its edge colours (edgeFill.js, shared with CasePhoto). Fixes the cropped 台達玻璃樹 「玻璃樹幹」 photo.
- /assets/case-*.webp photos were listed at 1600×1200 or 1600×1600 whatever their shape; their real sizes are now
  recorded in case-photos.json, content-index.json and the page JSON, so article frames no longer crop them.

## Covers for 品牌訂製 and 禮贈品訂製 (v62, 2026-11-16, by request)
- 24 covers replaced (case-photos.json), each matched to the owner's screenshot by image comparison against the page,
  research/assets and the owner's art folder. New files in public/assets: case-fubon-junior (art folder 251204/C39EA060…),
  case-delta-50-plaque (research 69f2de2c…, 台達 title cropped off), case-delta-50-senior (art folder 獎盃/GOE_3982.JPG),
  case-songyan-calendar, case-onibus, case-jsl-diffuser (「澗水藍 水墨擴香基座 JSL Craft Diffuser Base」 lettering filled
  from the surrounding background, by request), case-ironman-clock (迪士尼×和樂 title cropped off), case-ads-finial,
  case-marble-pen, case-rsl-tray (RSL瓏山林 title cropped off), case-moosy-stand, case-8-ball, case-bee, case-dice,
  case-wax-seal, case-undefeated, case-wang-jinhua. Dice and undefeated have no original on file: they are cut from the
  owner's screenshots (653px / 574px); replace them when originals arrive.
- Square covers from wide photos: the photo is centred and the frame extends its own top and bottom edge colours,
  blurred and feathered (never a mirrored strip, which pulled ghost copies of the object into the frame).
- T.B. Design 動物雕塑咖啡填壓器 (d9b131…): the sideways rhino photo 20b8bd0… is removed from its gallery.
- Old covers that duplicated a hover detail moved into the details (480px thumbnails).

## Site review: navigation, footer, readability (v63, 2026-11-16, by request)
Audit method: full-page captures of ten pages (desktop 1440, phone 390) plus a script that measured every text node's
size and contrast and every chip icon's centre. Icons were all centred (within 0.75px). Findings fixed here:
- One map of the site (supersedes the v11/v58 overlay on desktop). Header links 首頁 + six groups; a link with sub-pages
  shows a caret and opens a panel on hover or keyboard focus (SubPanel in SiteHeader.jsx; 關於 re.O also lists 服務指南).
  The 選單 button and its sheet (SiteMenu, plain list, no photos) exist only at ≤1100px. Styles: site/header-v6.css.
- Footer (SiteFooter.jsx, site/footer-v6.css; supersedes v55–v59): mark + company facts (name, 統編, address, hours,
  email, phone) on the left, four link columns in header order (訂製服務, 作品與材料, 關於, 服務指南), one slim closing line.
  About 300px tall on desktop instead of 640px. The "讓下一件作品" lead and the black band are gone.
- Wayfinding on detail pages (ContentReader.jsx): the breadcrumb leads with a 「← 返回〈列表〉」 pill; the page ends with
  上一則 / 回到列表 / 下一則 in the list's own order, and 繼續探索 shows the entries after the next one (it used to show the
  same first three on every page, which read as a loop). Breadcrumb text 13.5px.
- Readability (site/refine-v63.css, loaded after type.css): labels and meta 13px in the AA grey; nothing under 12px.
  Step bands (公版 ordering, 品牌訂製, 禮贈品訂製): steps that are not active stay readable (were 3:1), body 15px; the active
  step is marked by its filled ring and ink title. Home process ring: same picture, side text and small labels one step up.
- Case grids (.is-works): four per row from 1280px.
- SEO/GEO, not done here: hash routes (#/…) are one URL to search engines and AI crawlers, which do not run JavaScript.
  The real step is path URLs with prerendered HTML per page, then per-page titles, canonical, sitemap and BreadcrumbList /
  Product data. Waiting on the owner's go-ahead (it changes every URL).

## Path URLs, prerendered pages, D/E/B hero (v64, 2026-11-17, by request)
- Addresses (src/router.js): / · /<old-site path>/ (pages/x, products/x, blog/posts/x, about/x) · /explore/<category>/ ·
  /studio/<A–F>/ · /brands/. Code, navigation.js and page data still NAME routes in the old hash form ('#/read/pages/x');
  src/h.js (the JSX factory, vite.config.js esbuild.jsxFactory) renders any <a href="#/…"> with its real address, and
  router.js turns in-site clicks into pushState. So: keep writing href="#/…" in components; for window.open or
  navigation in code use toPath()/navigate(). Old #/… links are rewritten on arrival. The single-file offline preview
  (file://) keeps hash routing.
- Prerender (tools/prerender.mjs, run by `pnpm build`): headless Chrome opens all 150 routes of dist and saves each as
  dist/<path>/index.html with its own title, description, canonical, og:url and BreadcrumbList (src/seo.js setPageMeta
  takes `trail`); sitemap.xml lists them (needs SITE_URL). dist/404.html is the plain shell (studio and unknown
  addresses). main.jsx loads a route's code and data before React renders, so a prerendered page is not replaced by a
  loading screen. A new page type must call setPageMeta, or the prerenderer waits and reports it as not rendered.
  A local build without SITE_URL uses http://localhost in canonicals. Hosting must serve <path>/index.html (any static
  host does) and, for /studio/, fall back to 404.html or index.html.
- Home hero (Home.jsx Hero, components/hero-v64.css; supersedes v39–v41 D-only): slides D, E, B, one whole-trophy photo
  each. The left column follows the slide (letter + English name, material line, size, price, 3 個工作天, 開始 X 款排版) and
  shows A to E as square photo cards (F, a medal, stays on the 公版 page). Hero site figures (06/64/09) are no longer shown.
- Fact cards (site/facts-v64.css): stone panel, Chinese label first, serif values 600, figures Inter 500. Figures count up
  on first view (site/CountUp.jsx; markup always holds the final text, the prerenderer writes it back). 公版獎盃: 款式 and
  製作時程 left, 線上排版 and the six-row price list right.
- Header panels (navigation.js `menu`, SubPanel): [name, route, note] rows, first row the group's own page; current page
  dotted; 140ms leave delay; panels near the right edge align right. Only the link under the ink pill is white
  (`is-pill`); before, the current label could turn white on the light capsule while a panel was open.
- Lists show everything (no 載入更多; 64 cards at most, photos lazy). Case grid stays four per row, five from 1800px.
- About: founder section (李東陽 Dong, 負責人・設計師; portrait public/assets/founder-dong.webp from the owner's 個人照230829).
  Only sourced facts (TISDC deck, 東森新聞 2019, Golden Pin 2018/2019). A fuller biography waits for the owner's text.

## Hero names, A–F panel, ink footer, material openings (v65, 2026-11-18, by request)
Styles: site/refine-v65.css (loaded last).
- Home hero: the large letter is the name's first letter and the rest follows smaller (Delta as one word; no second
  "D"). Same in the stage tabs and the A to E cards. 製作 reads 「3 個工作天起」.
- 公版獎盃 header panel: 六款公版總覽, 線上排版工作室, then A to F in order, one line each (letter badge, name, price).
  B, D and E are featured: ink badge, bold name and a small 主打 mark (navigation.js menu rows carry {letter, featured}).
- Footer: ink (#1c1e1c) with white text; secondary lines 76% white, headings 74% (AA). Logo inverted. Supersedes the
  stone footer of v63.
- 企業與IP案例 band: five works in one even row (Disney 米奇桌鐘, T.B. Design 填壓器, Marvel 鋼鐵人桌鐘 without the title
  lettering, ComeBikeDay 泥好蛙, 金馬); heading 「讓材料與角色，走進日常。」; the band meets the hero photo (no white strip).
- Material pages (content/MaterialIntro.jsx, material-intro.css; list in site/materials.js): full-width opening with the
  page's own photo, n / 09, name, English name, opening text, a button down to the works. The photo is crushed and
  reborn on a canvas (holds, breaks into fragments, gathers back; about 2.5s; 再看一次 replays). The <img> underneath is
  the real picture for search, prerender and reduced motion. No generated imagery is used.
- Process band titles: 品牌訂製 「從概念設計，到獎座出貨。」, 禮贈品訂製 「從需求確認，到禮品交付。」 (each page's first and last step).

## Featured glint, one effect per material (v66, 2026-11-19, by request)
- 公版 header panel: no 主打 tag. B, D and E keep the ink badge and bold name, and a soft gold light passes across the
  name every 3.6s (off under reduced motion). Badge to name gap 16px.
- Material openings: each material comes apart in its own way (effects table in content/MaterialIntro.jsx): marble slabs
  crack and drop; glass bursts into triangles from one point; crossarm beams slide out row by row; coffee grounds pour
  down; silt runs down in streams; ash lifts and thins; sawdust is blown right as thin shavings; veneer panels turn on
  edge; aggregates tumble down as round pellets. Same engine, same hold / apart / return timing; add a material by
  adding one entry.

## Material opening as a short film (v67, 2026-11-20, by request)
The owner asked for an animation, not an effect on the picture. content/MaterialIntro.jsx now plays four acts (about
5.4s, canvas, replayable): the photo comes apart in the material's own way (v66 effects) and its pieces fade; they
become about 1,900 grains coloured from the photo (900 on phones); the grains stream in and pour into the re.O mark in
the order the logo draws (counter-clockwise from above the dot, gap kept, dot last); the ring sets solid in the
material's own texture, one light runs round it, and the photo returns. Ring right of the text on desktop, above it on
phones. Nothing is generated; colours and texture come from the page's photo. Timings: the T table in the file.

## The formed mark follows the logo (v68, 2026-11-21, by request)
MaterialIntro's ring was measured against public/assets/reo-logo.png: slim ring (band 0.075 R; the logo's own stroke is
0.044 R, kept a little heavier so the material's texture reads), dot radius 0.07 R at 0.98 R, open space of 11° above
and below the dot (the logo has 8.75°; the owner asked for a little more). "re" lights up last, with a glow that
settles. Its shape is not redrawn: public/assets/reo-re-mask.png is cut from the logo (frame 2.198 R wide, centred on
the ring). Film length 6.2s.

## Copy edits: 品牌客製化訂製, packaging at 品檢包裝 (v69, 2026-11-17, by request)
- 品牌訂製 is now written 品牌客製化訂製 everywhere visitors see it (header label and panel, home section label,
  landing title, closing/stat links). Route and category id stay 'custom'. Header still fits at 1150px and up.
- Packaging is no longer split into 全客製化 / 部分客製化 terms at step 01. Step 01 (both 品牌客製化訂製 and 禮贈品訂製)
  leads with understanding the brand's needs and concept design; packaging is only mentioned as part of that discussion.
  The packaging options are one 客製化設計 term on 品檢包裝, ending 「依照預算規劃不同訂製包裝。」 Fact cards: 包裝 = 客製化訂製.
- FAQ: packaging answer 「可以，依照預算規劃不同訂製包裝。」; 材質 adds 「想用品牌自己的材質有什麼限制？」.
- Case landscape-trophy is titled 環境部 環境教育考核獎牌 (was 桃園市政府山水獎牌).

## F withdrawn for now, hero follows the A–E cards (v70, 2026-11-17, by request)
- F (FRAME, the medal) is off the site and the studio "for now". `offered` in src/components/site/classics.js (A–E) is the
  one list read by home, menus, the 公版 page, the ordering band and the studio's model picker. F's data, geometry, masks,
  photos and scene code stay, so it returns by adding 'F' there and undoing the items below.
  - catalogue.js: the three F product pages are filtered out of `pages` (their URLs show 找不到這篇內容), and loadPage
    removes F images, links and names from the old listing pages. prerender.mjs skips them (sitemap too) and writes
    studio shells for A–E only. /studio/F/ opens home. Copy reads 五款 / A、B、C、D、E; prices list five.
  - Home Classic: E and D tall, A and B above, C across both columns (`is-wide`); full row on tablets and phones.
    公版 index five across; step 01 mosaic three over two.
- Home hero: pointing at or focusing an A to E card shows that model in the hero (name, line, size, price, studio
  button, photo); the loop waits and resumes on leave. A and C use their catalogue photos and a line from models.json.
- Phones: the three slide tabs write the full name (DELTA, EXCEED, BOND), as on desktop.

## Studio name, 公版 flow copy, material names on photos (v71, 2026-11-17, by request)
Styles: site/refine-v71.css (site-wide, after refine-v65) and content/library-v71.css (after pages.css).
- One name for the plaque studio: 銘版排版工作室. Changed: header panel row (navigation.js), home A to E line, 公版 fact card
  label (Studio), article button 「以 X 款進入銘版排版工作室」, studio page title 「X 款｜銘版排版工作室」 and its loading text.
  Do not write 線上排版工作室 or 線上排版 for it again.
- 公版 ordering step 02 (landings.jsx flow): 10 座以上 unchanged; 低於 10 座 is one merged row in the owner's words:
  「可以至「銘版排版工作室」自行擺放滿意版型（完成後可下載 .PDF 及 .EPS 檔案），接著再上傳「.PDF 及 .EPS 檔案」及「名單清冊」至
  service@re-o.co，收件後我們會以實際印刷條件協助免費調整。若沒有辦法提供銘板排版範例，仍可以請我們協助設計排版，酌收排版費
  NT$300。」 The studio name and the address are links. The fee is NT$300 (was NT$500; supersedes v39/v51).
- Step 01 picks: 84px circles with a 26px letter (phones 44–56px, one row of five).
- 公版 header panel: badge to name 20px. header-v6.css's `.site-sub a>span` (gap 2px) had outranked `.site-sub-model`, so the
  v65/v66 16px never showed; refine-v71 uses `.site-sub a>span.site-sub-model`.
- 循環材料 page: the reel (MaterialReel, now from site/materials.js) and the 全部循環材料 cards (MaterialEntry in
  ContentLibrary.jsx) name each material on the photo like the home tiles: large Inter numeral, hairline, Chinese over
  English. The reel photos link to their pages. Cards: group chip and the summary (15.5px, two lines at most) under the photo,
  a glass arrow on it. Materials are listed in materials.js order, so the numerals run 01–09 and keep their number when
  filtered. The About page reel keeps its white name tabs.

## Case placement, material page order, home 訂製服務, new flow photos (v72, 2026-11-17, by request)
- catalogue.js `groupOverride`: SDGs 鑰匙圈 and 蘇格登杯墊 list under 禮贈品訂製; 回收玻璃 x 電線杆木橫擔 (new-page-7) under
  品牌客製化訂製. `unlisted`: tb-design-animal-sculpture-coffee-tamper duplicated 動物油土雕塑咖啡填壓器 and leaves every list
  (63 cases; URL still opens).
- Material pages: 材料與工藝 photos first, then Works (the intro button still jumps to the works).
- Home section 02 is 訂製服務 (Custom): 01 品牌客製化訂製 → /pages/custom/, 02 禮贈品訂製 → /explore/products/,
  03 IP生活設計 → cases filtered to IP.
- Flow photos from the owner's folder (public/assets/flow-*.webp): 品牌 3D 建模 = 電表手機座三視圖, 開模 = NIK_6766;
  禮贈品 01 = NIK_6622 sketch, 02 = whole rhino on a 4:3 ground of its own grey, 03 = NIK_6684, 04 = NIK_6761(1),
  05 = 米奇桌鐘 211014_232, 06 = 空總名片架 GOE_1694, 07 = the same tape-and-box photo as 品牌客製化訂製.
- v73: home 訂製服務 photos: 01 日月光獎盃260416/~29.jpg (assets/home-mode-ase.webp), 02 蘇格登杯墊 GOE_1711 (home-mode-singleton.webp).
  Frames 4:3 instead of 3:4 (smaller); each subject checked whole in the centred crop.

## 品牌獎盃訂製, owner photo import, card-sized covers (v74, 2026-11-18, by request)
- 品牌客製化訂製 is now written 品牌獎盃訂製 everywhere (header, panel, home 訂製服務 card 01, landing title, closing and
  stat links). Route and category id stay 'custom'. Supersedes the v69 wording.
- Owner photo folders: C:\Users\ecolo\Desktop\東陽整理照片\客製獎盃 (品牌獎盃訂製 cases) and \品牌禮贈品訂製 (禮贈品訂製 cases);
  each subfolder is one case and the folder names are the owner's correct names.
- tools/cases/import.py + tools/cases/batch-2026-11-18.json: the importer. Per case it adds photos to an existing page
  (appended, so they land in 更多照片) or creates the page, index entry, cover and hover details. Photos become ≤1440px
  WebP named by content hash. Re-running changes nothing. Run with the PIL python:
  `python -I -X utf8 tools/cases/import.py tools/cases/<batch>.json`. To add cases later, write a new batch file.
  The importer's same-shot check (dhash) misses photos the old site stored with a wordmark or a different crop, so
  compare a page's photos by eye after importing; 13 repeats were removed by hand in this batch.
- This batch: 9 new cases (72 listed cases, 150 pages) and about 100 photos added to 36 existing cases.
  New, 品牌獎盃訂製: TORNA獎盃, 客家音符比賽獎杯, 明道獎盃, 台達 電競傳奇巔峰賽獎盃 (folder 台達卡丁車電競獎盃; title from its plaque).
  New, 禮贈品訂製: Victor 樹枝提把包, 克洛 Lucy's 客製戒台, 枝仔冰展覽, 樂玻璃底座, 金門戰地音箱.
  Their text is a first draft written only from what the photos show (inscriptions, plaques, the exhibition label);
  year/material are filled only where a photo shows them. The owner still has to confirm them.
- Pinkoi: cover and page hero = 202361_230601_318.jpg; the chapter 02 photo = IMG_0410.JPG; IMG_0415.JPG in 更多照片.
  亞太: GOE_2903 and GOE_2914 in 更多照片.
- Titles: 「Stussy 8 Ball 八號球造型香氛蠟燭」 and 「Stussy 雙骰子造型香氛蠟燭」 (folder names). Dice and undefeated covers
  and heroes are now the owner's originals (the v62 screenshot cuts are no longer used).
- catalogue.js cardImage(): lists load a 720px copy of each cover (src/data/case-cards.json → public/assets/case-cards,
  written by the importer). All covers together went from 6.4 MB to 1.4 MB. A cover changed by hand needs the importer
  re-run (or its entry removed from case-cards.json) or the list keeps showing the old small copy.

## Case admin at /admin/ (v75, 2026-11-18, by request)
The owner asked for a back office to change photos and text himself, signed in with Google, in the site's own look.
- Screens: src/admin/AdminSite.jsx (+ admin.css, all under `.adm`). Sign-in → case list (tabs 品牌獎盃訂製 / 禮贈品訂製 /
  IP 生活設計 / 已隱藏, search, 新增案例) → editor. The editor's left column is the form (01 基本資料, 02 文字, 03 照片,
  04 列表封面); the right column is the real public page (ContentReader with `draft`) at desktop width, scaled to fit,
  updating as he types. Photo order decides placement and each photo is labelled with where it lands (頁首大圖,
  配第 N 段文字, 細節圖, 更多照片). Route `#/admin` → /admin/ (own chunk; noindex; robots.txt Disallow; prerender writes the
  plain shell there; not in the sitemap, not linked from the site).
- Rules for what a save writes: src/admin/model.mjs (no browser APIs; tests/admin.test.mjs). A case = its page JSON, its
  content-index entry, case-photos (cover), case-details (hover photos), case-cards (720px cover). Photos are resized in
  the browser (src/admin/images.js: ≤1440px WebP, hash-named like the importer; JPEG where the browser cannot write WebP).
  Nothing is ever deleted from the repository by the admin; a removed photo just leaves the page.
- `group` and `hidden` are data now (content-index.json): catalogue.js caseGroup = groupOf (admin/model.mjs; a case
  without `group` is still placed by its title), and hidden cases leave every list (URL still opens). This replaces the
  v72 groupOverride / unlisted tables in code. The admin always writes `group` when it saves a case.
- Two back ends, one rule file (admin-service/rules.mjs: only those content files, images named by their own hash):
  - local: `pnpm dev` → admin-service/dev-plugin.mjs, /__admin routes that read and write the project files. No sign-in;
    127.0.0.1 only, custom header required. Vite reloads the page after a save.
  - online: admin-service/server.mjs (Cloud Run, no dependencies). Verifies the Google ID token (signature, audience,
    expiry, verified e-mail on ALLOWED_EMAILS), accepts requests only from ALLOWED_ORIGINS, and writes one commit through
    the GitHub API; the Pages workflow then publishes. Setup steps: admin-service/README.md.
  - src/admin/config.js holds the service URL and the OAuth client ID (neither is a secret). Empty = the published
    /admin/ says 後台尚未啟用.
  - Deployed 2026-11-18: Cloud Run `reo-site-admin` (project adept-voltage-509816-a6, asia-east1, 0–2 instances, 256Mi),
    own service account reo-site-admin@… that can read only the secret `reo-site-admin-github` (the owner's fine-grained
    token: this repository only, Contents read/write, Actions read; renew before it expires). OAuth client 「re.O 網站後台」,
    origin https://ecologydavid.github.io. ALLOWED_EMAILS = ecologydavid@gmail.com. Add the new origin to the OAuth client
    and ALLOWED_ORIGINS when the site moves to its own domain.
  - Budget: 「re.O 每月預算 NT$100」 on the billing account, alerts at 50/90/100% and forecast 100%, e-mailed to
    ecologydavid@gmail.com (monitoring channel 「re.O 預算提醒」) and the billing admins.
- Tests no longer pin the number of pages or cases (≥ 150 / ≥ 72) and stats.js counts cases from the data, so a case
  added in the admin cannot fail the deploy. Home.jsx no longer imports stats.js (it was unused and would pull the
  catalogue into the home bundle).
- Checked locally in headless Chrome: create a case with three uploads and a square cover, save, reopen, open its public
  page; saving five existing cases unchanged left every data file identical apart from the added `group`.

## Version in the footer, prerender on the builder (v76, 2026-11-18, by request)
- Every page's footer ends the copyright line with the version: 「v76 · 2026.11.18 · 58433f1」 (release · build date in
  Taipei · commit). src/version.js holds `siteVersion`; RAISE IT (v77, v78, …) with every release pushed, matching the
  heading of that release's note here. Date and commit come from vite.config.js (`__BUILD__`; GITHUB_SHA on the builder,
  git locally), so a save from the case admin shows its own commit.
- The footer's studio link reads 銘版排版工作室 (was 線上排版工作室; v71 rule).
- tools/prerender.mjs waits up to 60s for Chrome and starts it a second time before giving up, printing Chrome's own
  messages (the 58433f1 deploy failed because Chrome on GitHub's runner did not answer within the old 20s).
- Local builds from Git Bash: set MSYS_NO_PATHCONV=1, or BASE_PATH=/reO.website/ is rewritten to
  C:/Program Files/Git/reO.website/ and no page renders (the prerender then waits ~8s per page and looks hung).

## Version format v1.0.0 (2026-11-18, by request; supersedes the v76 footer format)
- The footer reads 「v1.0.0 · 2026.11.18」: major.minor.patch, then the build date (Taipei). No commit any more.
  src/version.js `siteVersion` is set by hand and raised with every release: patch for fixes and copy (1.0.1), minor for
  new features or sections (1.1.0), major for a redesign (2.0.0). The date updates by itself on every build, admin saves
  included. The "vNN" headings in this file are the old internal numbering up to v76; this release is 1.0.0.
- Why an admin save takes a few minutes: the site is static. A save is a commit; GitHub's workflow then installs, tests,
  builds and prerenders all ~156 pages (about 2–3 minutes), publishes to gh-pages, and GitHub Pages serves pages with a
  cache of up to 10 minutes, so a browser may need a hard refresh (Ctrl+F5).
## Works links, delivery marks and About (2026-11-23)
The service menus target their own Works sections via `?section=works`. Gift links also select a filter;
the public label IP聯名設計 maps to the stored group IP生活設計 so legacy URLs and case data still work.
The gift menu no longer links to Pinkoi; its standalone header, footer and shipping links remain.
Delivery uses the owner's carrier marks and clear channel icons. About keeps the six origami photos
in a compact stage, and the footer links to the studio's Facebook and Instagram accounts.

## Load weight: fonts, caching, late extras (v1.2.1, 2026-11-25, by request)
The owner reported photos arriving late on ordinary connections. Measured on the live site (headless Chrome, phone,
4 Mbps): the home page's first view was 4.6 MB, of which 2.8 MB was 38 Chinese font files at top priority; photos
(1.2 MB, low priority) queued behind them and finished at about 10 s (24 s at 1.6 Mbps). Photos were not the problem.
- Chinese TEXT now uses the device's face (`--tx-sans` in site/type.css: Inter, PingFang TC, Microsoft JhengHei, …).
  Noto Sans TC is no longer downloaded on the site. HEADINGS stay Noto Serif TC.
- Headings: tools/prerender.mjs collects the characters each page sets in the heading face and asks Google Fonts for a
  font cut to that text (`&text=`, at most 450 characters a request; longer text is split and each part gets its
  unicode-range). The files go to dist/fonts/<hash>.woff2 and the page declares them as "reO Serif", the first name in
  `--tx-serif`, with a preload. About 45 kB a page instead of 1.5 MB. Text not in it falls through to the full
  Noto Serif TC, which index.html adds only after the page has loaded. If Google cannot be reached at build time the
  page is simply left without its subset. A new heading style must keep using `var(--tx-serif)` to be included.
- The plaque studio (/studio/…) loads Noto Sans TC and Noto Serif TC from the start, as before: plate text and the
  editor are unchanged (index.html decides by address).
- index.html's font link is saved by the prerenderer as media="print" again (it used to be saved as "all", which
  made the 170 kB font stylesheet block the first paint of every prerendered page).
- Caching (public/_headers, Cloudflare Pages): /app/ (Vite's hashed files; `build.assetsDir`), /fonts/,
  /content/images/ and /assets/case-previews/ for a year; other /assets/ files for a day, then refreshed in the
  background. Rules must not overlap (Cloudflare joins their values), which is why /assets/ is listed folder by folder
  and its own files by `/assets/:file`. A NEW FOLDER under public/assets needs its own line. HTML and page JSON keep
  the default (always checked), so updates still show at once.
- After the page: Google Analytics' tag (1.2 s after load, 8 s at the latest, or when the visitor leaves) and the
  logo's drawing GIF (hover still plays it at once).
- Result, same test on the new build: first view 1.6 MB (fonts 0.1 MB), photos done at about 3.3 s.
- Not done yet (offered): 720px copies of article photos for phones (srcset); the 3–6 MB originals in public/assets
  that only models.json or nothing refers to.

## Photos named by content, small copies for phones (v1.2.2, 2026-11-25, by request)
Both are done by the build (tools/images.mjs, called from tools/prerender.mjs before any page is rendered; tests/images.test.mjs).
- Names that follow the content: every photo in public/assets (not case-previews, not files over 2.5 MB) is copied to
  /i/assets/<name>.<10-hex hash of its bytes>.<ext>, and every whole "/assets/….ext" address in the built scripts,
  styles, shell and page JSON is pointed at the copy. Replace a photo under the same name and its address changes at
  the next build, so nobody keeps the old one; /i/ is cached for a year (public/_headers). The original stays in
  /assets/ (one-day cache) for the case admin, addresses built in code (`/assets/catalogue-${id}.webp`), absolute
  addresses (og:image) and old links.
  - Source code and data keep writing '/assets/x.webp'. Do not test a photo's address with startsWith('/assets/…')
    or look it up by its file name without allowing for the hash (casePreviews.js strips it; AboutPage uses includes).
- Small copies: an 800px WebP of EVERY photo (content/images and the renamed assets), "<name>-800.webp" under /i/.
  Resized in the prerenderer's Chrome (no image library), about 20 s for 1,700 photos the first time; finished copies
  are kept in .cache/images (git-ignored; actions/cache restores it on GitHub), after which a build resizes only new
  photos. src/components/site/responsive.js `small(image, sizes)` returns srcSet/sizes; wired into article photos
  (lead, chapters, details, gallery, works), library and material cards, the materials reel, flow photos, home tiles,
  hero slides 2–3, Frame and About. On phones `sizes` says 60vw on purpose, so a 3x phone takes the 800px copy
  (about 2x the screen) instead of the 1440px original; on wide screens the true width is given, so large photos get
  the original. Build only (the dev server has no /i/). A new <img> for a content photo should spread small(...).
  If size or quality changes, change SUFFIX in images.mjs and responsive.js together (the addresses are cached).
- Same phone test as before: home first view 1.2 MB of photos → 0.6 MB; a case page's photos roughly a third less.

## Centred classic photos, brand wall order (v1.2.3, 2026-11-25, by request)
- Owner rule: on the home page the piece sits in the MIDDLE of its frame, clear of the edges, never shifted to a side.
  The catalogue photos are 4:3 with the piece off centre (B right, E left and low) or edge to edge (D), which a
  centre crop into a tall or square frame made worse. tools/classic-tiles.py frames the same photos around the piece
  (its box is given by hand in the script) and, where the frame reaches past the photo, continues the photo's own
  edge (background only): public/assets/classic-{B,D,E}-tall.webp (4:5, desktop Classic grid) and
  classic-{B,E}-square.webp (hero A to E cards). Home.jsx `tallPhoto` / `pickPhoto`; the tall photo replaces the 4:3
  one only at ≥1101px (two frames, CSS swaps them), because smaller screens show the 4:3 photo whole.
  A new or replaced classic photo: add its box to the script, run it, check the three places.
- Brand wall (LogoWall.jsx `priority`): the owner's first sixteen, in order: Delta, 日月光, 富邦, 資誠, 行政院, 環境部,
  資策會, 台電, Disney, HOLA, Heineken, Singleton, Uber Eats, 台北金馬影展, 松山文創園區, Pinkoi. The rest follow in
  logo-wall.json order. Phones show the first twelve until expanded.

## Hero stage: E and B centred (v1.2.4, 2026-11-25, by request)
- Same owner rule as v1.2.3, now on the home hero stage: the piece in the middle, never cut. The stage changes shape
  with the window (about 1:1 at 1440×900, 1.5:1 at 1900×900, 2:1 on very wide monitors), so a 4:3 photo with an
  off-centre piece was cropped differently everywhere (B ran off the bottom, E sat low and left).
- E and B slides now use public/assets/hero-{E,B}-wide.webp: a 2.2:1 canvas framed around the piece
  (tools/classic-tiles.py). `object-fit: cover` then fits it by HEIGHT on every desktop stage, so the piece keeps its
  size and place and only backdrop is cut or shown at the sides. Phones (square stage) get hero-{E,B}-square.webp
  through a <picture> source (`phone` on the slide; `.rv-hero-pic{display:contents}`).
- The script's edge extension keeps the photo's edge next to the photo (light blur only: a heavy blur softened the
  backdrop gradient and showed a step on E) and fades it into a blur along the seam farther out, so a shadow that
  crossed the photo's edge (B) dissolves instead of running on as a stripe.
- The D slide is unchanged (not asked); on stages wider than about 1.8:1 its three trophies are cut top and bottom.

## Every classic photo framed for its frame (v1.2.5, 2026-11-25, by request: "handle wherever this can happen")
- The owner's rule (v1.2.3) now holds for all five models in every place they show: src/components/site/classicPhotos.js
  lists, per model, the photo framed around the piece for each frame shape (tall 4:5, square, wide 4:3, hero 2.2:1,
  heroPhone square), all made by tools/classic-tiles.py (25 files, 0.8 MB). Use the entry that matches the frame;
  do not centre-crop a 4:3 catalogue photo into another shape.
  - Home hero stage: D, E, B slides and the A and C previews all use `hero` (+ `heroPhone` on phones via <picture>).
    index.html preloads the D slide in the shape the screen will show (two preload links with `media`).
    The old hero-d-720.webp and per-slide object-position are no longer used.
  - Home hero cards: `square` for all five. Classic grid: `tall` on desktop for A, B, D, E; `wide` for C's wide cell
    and for every model on tablets and phones.
  - 公版 page: the step-01 mosaic uses `wide`, the round picks use `square` (they used product-thumb crops).
  - Not changed: the plaque studio's model cards (protected), the FAQ's 72px thumbnails and the unused MaterialHero.
- Checked on screenshots: hero D/E/B and the A/C previews at 1440, 1900 and 2560 wide and on a phone; the Classic grid
  at 1440, 1024 and 390; the 公版 mosaic and picks at 1440 and 390. A new classic model or photo: add its box to the
  script, run it, add the entry to classicPhotos.js.

## One address per page, share pictures, llms.txt; the old test site is gone (v1.3.0, 2026-11-26, by request)
GEO work after an audit of the live site (report: ../GEO目前V1.pdf). AI answers to "環保獎盃 / 永續獎盃 訂製" named
文洋 and 22STUDIO, never re.O; press and Pinkoi say 匠子 CHANZ STUDIO, and nothing tied that name to re.O.
- Owner's positioning (2026-11-26; use it in copy and data): re.O is the company and the main name (或心國際設計有限公司).
  匠子 CHANZ STUDIO is re.O's own lifestyle brand, sold on Pinkoi (retail, small pieces). The main business is
  company orders (B2B); small orders are taken too; a tighter budget can choose the classic (公版) trophies. Orders
  are agreed by e-mail or telephone, not through a checkout.
- The old test site https://ecologydavid.github.io/reO.website/ is offline: the `gh-pages` branch was deleted
  (it was frozen at v1.0.3, a full copy of the site naming itself the original). The live site is Cloudflare Pages
  from `cloudflare-dist`. The admin service's ALLOWED_ORIGINS is now https://www.re-o.co only. The 2026-10-27
  "GitHub Pages deployment" note above is history.
- One address per page (tools/aliases.mjs, tests/geo.test.mjs): eleven old-site addresses rendered the same page as
  another address (contact and awards = About; /pages/news, /pages/trophy = cases; /pages/material = materials;
  /blog/posts = journal; five /categories/… and /pages/discontinued-item = 禮贈品訂製; /products/摺紙花器 twice).
  The build no longer writes them or lists them in sitemap.xml (141 addresses), writes dist/_redirects (Cloudflare,
  301 to the page that holds the content, awards to /pages/about/#about-awards) and points links in the saved HTML
  straight at that page. The app still opens these route names (navigation.js uses awards to open About at its
  record). A new duplicate goes into the `aliases` table. src/seo.js setPageMeta takes `canonical`: /brands/ names
  the home page, About and the libraries name their one address.
- Share pictures (tools/images.mjs shareCards): a page that passes `image` to setPageMeta (articles: the case cover
  or the page's lead photo; 公版, 品牌獎盃訂製, 禮贈品訂製, cases and materials: one chosen photo) gets
  /og/<hash>.jpg, 1200×630 JPEG, made in the prerenderer's Chrome and kept in .cache/images/og. The photo is fitted
  by height and centred; side bands continue the photo's own edge when the edge is plain (studio backdrops) and
  show the photo enlarged and blurred when the edge is busy. Home, About and the FAQ keep assets/og-image.jpg.
  /og/ is cached for a year (public/_headers). Change `CARD` in images.mjs when the recipe changes.
- /llms.txt (tools/llms.mjs): who re.O is, the 匠子 relation, how to order, services, classic prices, key pages,
  every listed case, materials and articles, written at build time from content-index.json and models.json.
  Only facts that are on the site or were given by the owner. No assistant has promised to read the file.
- Image descriptions: content photos already had them; the 706 empty ones on the live site were deliberate
  (decorative copies, hover prints, logos inside labelled links). Added where a content photo sat inside a labelled
  button: the A to E cards and the eight process steps on home, the 公版 mosaic and round picks, the About record
  prints (each keeps its own description; only the one on show is announced).
- Correction to the audit: BreadcrumbList data was already on 153 of 154 pages (the check missed a script tag with
  an id).
- Still to do, waiting for the owner: structured data for the organisation (匠子 as its brand, IG, FB, contact
  points), the FAQ, the five classic models with prices, cases and articles; new titles and descriptions (about
  14 hand-written pages sent for review, the rest by rule); the Pinkoi button's wording; article dates.

## Two doors in the header, titles and descriptions, structured data (v1.4.0, 2026-11-26, by request)
Second part of the GEO work; the owner approved each item.
- Header (SiteHeader.jsx, header-v6.css): the Pinkoi pill reads 「匠子生活選物」 beside Pinkoi's mark (retail, new
  tab) and a new ink button 「洽詢訂製」 (mailto:service@re-o.co, mail icon) is the header's main action. This is a new
  header button by request; the v50 removal concerned the studio button only. Widths: both labels from 1500px; at
  1440–1499 the links sit closer and the shop drops its arrow chip so its label still fits; 1101–1439 the shop shows
  the mark only (title attribute names it); ≤1240 and phones 洽詢訂製 is its mail icon. Checked at 1920, 1600,
  1560, 1500, 1499, 1440, 1439, 1280, 1150, 1024, 760 and 390. Size rules for the links need `.folio-home .site-links>a`
  (site.css is loaded again later through ui.jsx and would otherwise win).
- site/DoorNote.jsx: 「企業訂製請來信；單件零售請到 Pinkoi 匠子設計館。」 under the buttons on 禮贈品訂製 and under the
  text on the 匠子 page.
- FAQ: home delivery on the main island is 1–3 days (owner: the shipping policy is right; the FAQ said 1–2). The
  v57 note above is superseded on that figure.
- Titles and descriptions (src/content/pageMeta.js, tests/geo.test.mjs): what the page is comes first, 「｜re.O」 last
  (seo.js adds it unless the title already names re.O). Thirteen pages are written by hand and were approved by the
  owner line by line (`written`): home, the six libraries, 品牌獎盃訂製, About, FAQ, shipping, 3D modelling, 匠子.
  Change them only with the owner. Every other page is composed by `articleMeta` from its own fields: cases
  「name｜material｜re.O 案例」 with year, group, client, material, service and the summary; materials with their
  English name; the five classic pages with price and lead time; articles; 匠子 products. `nameOf` reads a work's
  name from the two title shapes (work｜client x re.O, client｜work). Nothing is invented: a case with no data gets
  a short description until the owner fills it in the admin. index.html carries the home title and description.
- Structured data: index.html describes the organisation once (@id …/#org): also written re.o, reO, 或心; brand
  匠子 CHANZ STUDIO with its Pinkoi store; Instagram and Facebook; a sales contact point (e-mail, telephone, hours),
  plus a WebSite node. Pages add their own through setPageMeta `data` (script#reo-data): FAQPage with the answers as
  shown; Product with price in TWD, MadeToOrder, seller re.O for the five classic pages (A as a price range);
  CreativeWork for cases (creator re.O, sourceOrganization = the client, material, year when it is one year);
  Article for the journal (no dates: the owner has not supplied them).
- The second 台達 玻璃樹 address (/pages/new-page-7/) was a refresh page in public/pages; it is now a 301 in the
  redirect file (`merged` in tools/aliases.mjs) and the static page is gone.
- Not done, by the owner's choice so far: the About page identity sentence, a 怎麼下單 block and new FAQ entries,
  rewording the five classic pages' Pinkoi-era ordering steps, article dates.

## Visible introductions, how to order, article dates (v1.4.1, 2026-11-26, by request)
- The owner expected the approved descriptions on the pages themselves, not only in search results. The seven library
  pages now show their `written` description under the title (ContentLibrary; `categoryInfo.intro` is only the
  fallback), and 3D 建模, 匠子 and 運送政策 carry it as their summary (content index and page JSON). Home and the FAQ
  keep their own headline lines; About opens with the identity sentence in the owner's approved wording, followed by
  the earlier line.
- 怎麼下單: one line under the buttons of 公版獎盃, 品牌獎盃訂製 and 禮贈品訂製 (`order` in landings.jsx; e-mail or
  telephone, quote after confirming model/quantity/date, small orders taken, 公版 for a tighter budget) and three
  FAQ entries (怎麼下單？ 可以只訂少量嗎？ 預算有限怎麼選？), which also enter the FAQPage data.
- The five classic product pages (and the three withdrawn F pages) no longer say 「請在下單前私訊提供」 /
  「完成付款」 (Pinkoi-era): they ask for the files by e-mail or telephone and quote before payment. The rest of each
  step is the owner's old wording. A, B and C still say 2～3 次校稿 while D, E and the FAQ say 3 次: not changed,
  waiting for the owner.
- Article dates: `published` on the eleven journal entries (content index and page JSON) is the date each post
  showed on the old site (research/raw/*.html, `<div class="Post-date">`). Shown under the title (發表於 2026.03.18),
  written as Article datePublished and in llms.txt. A new article needs its own `published`.
- Data files are compact JSON (the index ends with a newline; product pages hold `0.0` prices that a JSON round trip
  would rewrite): edit page JSON as text, or check the round trip first.

## Small orders only on 公版, three proof rounds (v1.4.2, 2026-11-26, by request)
- 「少量也接」 is said on 公版獎盃 only; the owner had it removed from the 怎麼下單 line of 品牌獎盃訂製 and 禮贈品訂製.
  The FAQ entry 「可以只訂少量嗎？」 and llms.txt still say small orders are taken, in general terms: the owner has
  not asked to change them.
- Proof rounds are 3 everywhere: the A, B and C product pages and the migrated FAQ source said 2～3.
- Article dates (v1.4.1) are accepted as drafted; the owner will ask if any should change.

## Brand marks to one rule, the FAQ completed and numbered (v1.5.0, 2026-11-26, by request)
- Brand wall: the owner's complaint was that marks showed at very different strengths (some clear, some small and
  cramped) because each source file was fitted by its outer box into one wide strip. Every mark is now a picture made
  by tools/logos.py to ONE rule: background removed (edges un-mixed from it), trimmed to the ink, sized by AREA so a
  square emblem and a long wordmark carry the same weight (width = √(area × ratio)), corrected for how much of its
  box is ink (thin lettering up to 18% larger, solid blocks up to 12% smaller), limited to 68% of the tile's width and
  46% of its height, centred on a transparent 640×512 canvas (the tile's 5:4). Output public/assets/logos/<id>.webp,
  recorded as `mark` in logo-wall.json (`image` stays as the source). LogoWall shows it as an <img> that fills the
  tile (alt = the partner's name); BrandMark.jsx and brandArtwork.js (canvas drawing in the browser) are gone, and
  no CSS sizes a mark. A square mark is 39% of the tile's height (`AREA`).
  A NEW PARTNER: add the entry with `image.src` to logo-wall.json, run `python -I -X utf8 tools/logos.py`, look at
  .cache/logos-sheet.png, commit. The script lists a mark as ENLARGED when its source is smaller than it is drawn
  (none today). TMall's cat is cut by a straight line in the mark itself; that is its design, not a cropped file.
- FAQ (src/content/faq.js is the data; FaqPage.jsx the page): five groups and 22 questions (下單與報價, 公版獎盃,
  品牌獎盃與禮贈品訂製, 製作與配送, 材質), a jump list under the title, and a number on every question (Q01…) that is
  a link to it (/pages/faq/#q-order). Decision on numbering: yes for people (point at "第 7 題", send one answer),
  but outside the question's own words, which stay as a person would ask them in the heading, the FAQPage data and
  llms.txt (that is what search engines and assistants match). `id`s are the addresses and must not change; numbers
  may. New answers only restate the site or the owner; the header comment of faq.js lists each source and what is
  still unanswered (rush orders, payment and invoices, shipping abroad, lead time for custom work).
- Small orders (owner, 2026-11-26, supersedes the v1.4.2 note): taken for classic AND custom work. Custom work
  carries design and mould fees, so a small quantity on a tight budget is steered to the classic trophies; if the
  client accepts the fees it is made. Said this way in the FAQ, llms.txt and the 品牌獎盃訂製 ordering line.

## Twenty more partner marks, marks only (v1.6.0, 2026-11-27, by request)
- The owner listed twenty more partners for the home wall and asked for their public marks only: no case photo, no
  link, no display of the work yet ("先不放實際案例的圖片和連結"). The wall has 59 marks.
- An entry in logo-wall.json WITHOUT `href` is a plain tile (LogoWall.jsx): no link, no hover print, name as the
  picture's description. `works` holds the owner's note of what was made (公版 E, 五轉莫比烏斯環 …); it is not shown.
  When a case goes up: add `href`, `project` and `preview` and the tile behaves like the first 39.
- Sources are the organisations' own sites or Wikimedia Commons (each entry's `image.source`), kept in
  tools/logo-sources/<id>.png (not published; SVGs drawn to PNG 1600px wide in Chrome) and named by `image.file`.
  tools/logos.py reads `file` or `src`, and takes `ink` for a one-colour mark published only in white (Kanari,
  台北愛樂管弦樂團: the same shape in ink). 木田工場's mark is made for dark grounds and has colours, so it keeps its
  file and sits on an ink tile like 木客 (`tone`).
- Who they are, where the name alone was not enough: kanari = Studio Kanari (翔詠設計, studiokanari.com), to be
  confirmed by the owner; 木田工場 = 木田工場有限公司 Muteam (台中, muteam.com.tw); 產基會 = 財團法人台灣產業服務基金會;
  臺北廣播電臺's mark is the station's own (from 聽臺北), not the city government's; 越野跑協會 = TTRA (twttra.com).
  中小企業總會 and 新竹市環保局 were each listed twice (two works) and have one tile each.
- Small sources (the script says ENLARGED): 新竹市環保局 (328px) and 產基會 (365px). Ask for larger files.

## About record reviewed by the owner; 蛋造設計 is a case (v1.6.1, 2026-11-27, by request)
- src/content/record.js (34 entries): IDDI 設計驅動產業創新 is a grant (line 「台灣設計研究院的補助案。」). Source links,
  each page read and matched to the entry: 2026 TISDC 校園循環經濟講座 at 國立臺灣藝術大學 (tisdc.org, 4/14), 永續串造
  (scooptw.com; 中原文創園區, 翻轉鏡, the opening talk), Pinkoi 瘋設祭 2025 (ydn.com.tw; the article is about the fair and
  does not name re.O) and La vie 2020 (wowlavie.com). 理事當選 has no photo of its own: its picture says 示意照片, like
  GQ × Pinkoi's. All older links answered 200 on 2026-11-27.
- 蛋造設計 Danzo Studio's 澳洲墨爾本設計週 show left the record ("移除我們的展覽"): it is contract work, now the case
  /pages/danzo-studio-marble-tray/ (禮贈品訂製 / 生活設計; service 代工製作), made with tools/cases/batch-2026-11-27.json
  from the owner's one photo (蛋造澳洲展.jpg). Its text is a first draft from the photo, to be confirmed by the owner.
- Waiting for the owner's photos (he named them after the entries; they were not on this computer or in Drive):
  2026 TISDC 臺藝大, 永續串造, 三創頒獎典禮, 香港理工大學校內展, 瘋設祭 2025, 台灣設計展 設計 × 料理 × 製造. Until then these
  keep their stand-in photos (示意照片). Put each in public/assets/about-events and use eventPhoto() in record.js
  (the test counts the owner photos).
- tools/cases/import.py writes content-index.json without its closing newline: add it back after a run.

## Classic model pages redesigned; home opens them, not the studio (v1.7.0, 2026-11-27, by request)
- Links: the home hero's A to E cards and the home Classic photos now open each model's own page
  (/products/trophy/ …; `classicPage` in Home.jsx). The studio is entered from that page through one dark button,
  「以 X 款進入銘版排版工作室」 (top and closing band; new tab). From home only the hero button 開始 X 款排版 still
  opens the studio. The hero line reads 「點選款式，查看介紹」. This supersedes the v48/v50 notes that the cards and
  photos open the studio; the 公版 page's step-01 picks and the menus are unchanged.
- The five pages are designed pages (src/content/ClassicPage.jsx + classic-page.css, rendered by ContentReader when
  editorFor(page) names a model): name and short concept beside the photo with price, height, lead time and the
  studio button; 設計概念 beside a photo; 商品參數 as rows beside the dimension drawing; 更多照片; 訂製步驟 (01–03);
  注意事項 (1–4); a closing band with the studio button, e-mail and telephone. Phones: one column, photos full width.
- Where the words live: the page JSON. `summary` = 簡述; section 設計概念 = 詳述 (a paragraph equal to the summary is
  not repeated; 「名稱」：… lines become a named list; a line in “…” is a quotation); section 商品參數 = five rows
  written 「項目：內容」 (材質, 尺寸, 包裝, 包裝尺寸, 淨重), `items` = notes under the table; `images[].kind:'drawing'`
  is the dimension drawing; `metadata.designer` (E: 王翔). The steps and notes are shared and live in ClassicPage.jsx.
  Titles are 「A 款 APEX｜木客微光 × 匠子」 … 「E 款 EXCEED｜The way to PEAK」. Every photo has its own description.
- One way of writing (owner: no circled or boxed figures such as ❶ Ⓐ, tidy and consistent line breaks): a half-width
  space between Chinese and Latin letters or figures; sizes 長 × 寬 × 高 with the unit once; full-width 、／＋（）;
  steps and notes are numbered by the page; a measure, a price option and a range never break inside; running
  text is justified. tests/classic-pages.test.mjs checks the data against these rules.
- Owner's text of 2026-11-27, with these corrections reported to him: 樹酯 → 樹脂 (the site's spelling); D's
  「以的希臘字母」 → 「以希臘字母」 and its twice-pasted paragraph used once; 重量（淨重） is labelled 淨重; D no longer
  lists 1.3 kg with packaging (not in the new text). E's 尺寸 follows his new text (長 5.5 × 寬 10 × 高 19.5 cm).
- The five dimension drawings were saved again without their printed line 「請在下單前私訊提供 客製內容」 (the page
  says 紅色區域為可客製範圍 in text); the old files are deleted.
- Kept from the old pages, reworded only in spacing and punctuation: the three ordering steps, the four notes,
  A's 木橫擔 note (with a link to the material page). metadata.description (the old one-line dump) was removed.

## Classic model pages, second round: nothing twice, pictures beside the specification, colour cards, a photo strip (v1.8.0, 2026-11-27, by request)
The owner's notes on v1.7.0, and what answers each (src/content/ClassicPage.jsx, classic-page.css):
- 「公版獎盃頁面的下方圖案還是歪斜」: the five model cards at the foot of 公版獎盃 (and the 繼續探索 cards on the model
  pages) centre-cropped the 4:3 catalogue photo. They now use the photos framed for their frames (classicPhotos:
  `tall` for the 4:5 desktop row, `wide` for 4:3 frames), as the v1.2.3 rule asks. Entry and ContentCard in
  ContentLibrary.jsx. C's tall tile shows the piece larger than the others (wide piece in a tall frame), whole and centred.
- Nothing said twice: price and lead time sit with the name, on a block tinted after the model's material; the height
  row is gone. The measures are only in 商品規格 (renamed from 商品參數 everywhere, page JSON heading included).
- 商品規格 is three parts, each with its picture beside the words: 尺寸與重量 with the dimension drawing, 材質 with a
  photo (`images[].kind:'material'`), 包裝 with a photo (`kind:'package'`). E has no photo of its box yet: its 包裝
  card is words only until the owner sends one (then mark it `package`).
- 設計概念: the owner's paragraph is cut into short paragraphs at sentence ends (words unchanged; the import script
  checked the joined text is identical). A short first paragraph is set large in the serif. Lines turn only at
  punctuation: each clause is an inline block (`.cp-clause`), also in the opening line. Photo and words share the row
  evenly (6 and 5 columns of 12).
- 訂製步驟: three colour cards (stone, the model's tint, ink) with large figures and a round arrow from each to the
  next; the two things to send are white chips. 注意事項: a stone panel of four white cards, each with a short heading
  that only names its subject (拍攝道具, 手工製作, 非食材器皿, 運送與更換); the sentences are the owner's.
- Photos: every photo opens large and carries a round + mark; hero and concept photos have a caption
  (`images[].caption`, a few words). 作品照片 replaces 更多照片: one strip on ink, edge to edge (ClassicGallery). Arrows,
  mouse drag, swipe and the keyboard move it; the photo in front is counted and named, the others wait dimmed; the one
  in front opens large, another comes forward when chosen. Slides keep their own shape at one height. It holds every
  photo of the piece, those not shown elsewhere on the page first.
- Tints (`tints` in ClassicPage.jsx) are decoration: pale cypress, heat-treated wood, wood on white stone, grey-green
  stone, anodised aluminium. The page still uses the site's stone and ink for everything else.
- The ui-ux-pro-max skill was asked for gallery and step-card guidance and returned no match for either; the layout
  follows the site's own language and the skill's general rules (44px targets, visible focus, reduced motion, no
  hover-only actions, no page-level horizontal scroll: measured 0px on desktop and phone).

## Classic model pages, third round: a printed catalogue, not colour cards (v1.9.0, 2026-11-27, by request)
The owner on v1.8.0: too many colour blocks, tiring to read, and it looked machine-made; he asked for an elegant,
quiet, high-quality page, freer photo sizes and text setting, and no mark on a photo that only opens large.
This supersedes the look of v1.8.0 (tints, the ink photo band, step and note colour cards, chips, the round + mark);
what v1.8.0 settled about content stays. Files: src/content/ClassicPage.jsx, classic-page.css.
- White throughout. Hairlines (#dcdbd4) and space divide; one ink rule opens the specification table and the closing
  line. No fills except the photo frames' own ground. The only dark thing is the studio button.
  tests/classic-pages.test.mjs fails if a tint, a fill or a photo mark comes back.
- Headings: a small English word over the Chinese heading (no rule, no figure).
- Opening: name and short concept in five columns, photo in six with a column of air between; price and lead time
  (and E's designer) as plain label and value rows.
- 設計概念: photo six columns, words five. A short first sentence is set large in the serif and turns at its
  punctuation; the paragraphs are ordinary justified text (16px on 2.15). A sentence with a clause longer than 24
  characters is left to flow, and on phones every clause flows.
- 商品規格: one table of the five rows; 材質 and 包裝 carry a small 4:3 photo at the end of their row
  (images[].kind material / package), and the dimension drawing stands beside the table. E's 包裝 row has no photo yet.
- 作品照片: the strip stays (arrows, mouse drag, swipe, keyboard) but on white, running off the right edge; every slide
  has its number and caption under it and opens large on a click; nothing dims. The arrows step to the next place the
  strip can rest (near the end several slides share the last position).
- 訂製步驟 and 注意事項: heading in a narrow left column, content beside it under one hairline. Steps are three
  columns parted by hairlines; step 01's address and telephone stand on lines of their own. Notes are four rows:
  number, a short heading, the owner's sentence.
- Photos carry no icon. They open large on a click (zoom cursor, a slight enlargement on hover).
- The ui-ux-pro-max skill's design system for this brief: Minimalism and Swiss style, spacious, subtle motion, avoid
  block-based colour. Its fonts and palette were not taken; the site's own type system and ink stay.

## Opening words set as a statement; classic pages: materials row, plainer step 01 (v1.10.0, 2026-11-28, by request)
Owner: the paragraph under the first heading of many pages looked machine-made (small grey text, ragged turns,
stranded words). He showed 公版獎盃, 品牌獎盃訂製, 禮贈品訂製, 企業與IP案例, 循環材料, 關於 re.O and the 建模 article.
- src/components/site/Statement.jsx + statement.css set those words everywhere: landing pages (ContentLibrary),
  About, the FAQ, and the summary beside an article's opening photo (ContentReader). The first sentence is the
  statement (Ming 500, 19 to 22px, ink); the rest is the note (15px reading text, a sentence per line). A line turns
  only after punctuation: a clause holds together when short enough, a longer one holds piece by piece at its 、;
  after a colon the line turns. Lines are evened (text-wrap: balance). All of this only where the column is wide
  enough (a container query on .st, 23.6em of the statement's size); narrower columns and phones flow as ordinary
  text. A first sentence over 80 characters (long migrated summaries) is reading text, not a statement.
- The words are not changed: on landing pages they are still the approved descriptions in pageMeta.js `written`.
  New pages use <Statement text=…/> under the h1; do not put a bare <p> there (tests/statement.test.mjs).
- Articles: the text column starts level with the top of the opening photo (it used to float at its middle); the
  first section follows the statement under a hairline. Numbered lines of the original text ("1. …") stand as rows
  (ContentReader `Prose`, .content-numbered) instead of running into a paragraph; flowParagraphs leaves them alone.
- Classic model pages (A to E): step 01 has no address or number and its two items are set in; step 02 reads
  「設計提供 3 次校稿，超過 3 次修改會酌收排版費。」 (owner's wording; the FAQ still says 超過次數將另計費用);
  step and note sentences turn after punctuation too (Held with .cp-clause). A 循環材料 row under the price lists
  the model's circular materials, linked to their pages (page JSON metadata.circular, names from materials.js):
  A 再生大理石、水庫淤泥、退役木橫擔; B and C 再生大理石、木頭拼板; D and E 再生大理石. B and C's 木頭拼板 is read from
  the owner's 「北美黃檜木拼板」 and waits for his confirmation.
- A name that carries 匠子 also carries re.O: 「木客微光 × 匠子 × re.O」 in the A, B, C page titles, the content index,
  models.json (the studio's product name, which turns after a ×, Editor.jsx) and the home alt text. D and E have no
  such name and are unchanged.
- The ui-ux-pro-max skill was asked for this brief; its UX search returned general rules (line length, line height),
  nothing specific to Chinese display text. The setting above follows the site's own type system.

## Home: a ground per block, a screen per block; About photo under the title; studio enlarges (v1.11.0, 2026-11-28, by request)
Owner: (1) each home block should have its own ground so scrolling shows where a block ends, and as far as possible
a block should be read in one desktop screen; (2) the studio needs a button that enlarges the preview (full screen,
or by folding the side columns); (3) on About, lay the studio photograph under the opening words to save a block.
- src/components/home-fit.css (loaded last by Home.jsx) holds all of (1). Grounds, in page order: hero photograph,
  Process ivory #f5f2ea, Classic white, Custom ink #1f2320 (white type), Materials sand #e8e0d1, partners mist
  #dfe5e2 (marks stay on white tiles), shop stone #efeee9 (its panel white). No two neighbours share a ground
  (tests/home-blocks.test.mjs). This supersedes "white base" (v10) for the home page only.
- One screen, desktop (1101px and wider, 640px and higher): a block is min-height 100svh minus the 72px header, and
  its photographs are sized from that height (--fit, --pad, --disp, --body). The heading is one row: number and name
  above, the display word left, the Chinese heading beside it (a third of the word's size). Classic and Custom keep
  it across the top; Materials and Process stand it in a left rail so the nine tiles and the ring use the full
  height. Process renders its SectionHead inside the ring's left column on desktop (Home.jsx `head`), across the top
  when compact; its side photographs no longer make the block grow when a step is read. Partners: heading on one
  line, 12 marks to a row from 1280px, rows sized to the height left. Measured: every block equals the window
  height at 1366x657, 1280x720, 1536x730, 1440x800, 1900x900 and 1920x1080. Phones and tablets flow as before with
  the new grounds. The white gap before the footer is off on home (the shop block has its own space).
- About: `.pg-top-photo` (pages.css). The photograph fills the opening block under a veil that is heavier on the
  text side; title and statement in white, the contact panel a light sheet with dark type. The separate
  `figure.pg-hero` is gone from About (other landing pages keep theirs).
- Studio (Editor.jsx, editor-v4.css; desktop only): 收合側欄 in the 排版 bar folds the product and settings columns
  (`.st-layout.is-wide`); 全螢幕預覽 on the finished-product preview lays it, front or 3D, over the window
  (`.st-slot-product.is-full`), Esc or 結束全螢幕 returns. 放大成品 stays. Nothing else in the studio changed.
- The ui-ux-pro-max searches for this brief returned only general rules (contrast 4.5:1, line height); the palette
  and the sizing are the site's own.

## Photo grounds on 合作案例 and 循環材料; name tabs on the 公版 model row (v1.12.0, 2026-11-28, by request)
The owner liked two things from v1.11.0 and v48 and asked for them elsewhere.
- Every landing page that has a photograph (`landing.hero` in landings.jsx: 企業與IP案例, 循環材料) lays it under its
  opening words exactly as About does (`.pg-top-photo` + `img.pg-ground`, pages.css): veil heavier on the text side,
  white title and statement, the facts panel a light sheet. The separate `figure.pg-hero` block is gone everywhere.
  A new landing page with a photograph gets this automatically; do not bring the separate block back.
- The 五款公版 row on 公版獎盃 names each model in a tab inside its photograph (ClassicTab, the home Classic tab);
  the number, 「A 款」 and the name with its arrow under the photograph are removed. ClassicTab now lives in
  src/components/site/ClassicTab.jsx with classic-tab.css (context class `.ct-card`); home keeps its own sizes
  through `.rv-product` in home-v10.css.

## Material pages as reference entries (v1.13.0, 2026-11-28, by request)
Owner: the nine material pages opened on a photograph spread so wide it turned soft, then went from a few lines
straight to pictures and felt empty. He asked for more detailed explanation (searched for), careful text setting, a
page that feels like it has depth, and re.O's name on it for search.
- Opening (MaterialIntro.jsx, material-intro.css): a spread on ink. Name and opening words left, the photograph in
  a frame on the right that is never wider than about 1.12 times the file's own width (--nat). The coming-apart
  animation of v65 to v68 plays inside the frame; its ring now sits in the middle of the frame.
- Reading part (MaterialBody.jsx, material-body.css, words in materialNotes.js), in the white-and-hairline language
  of the classic model pages:
    材料檔案      「re.O 的＿＿」: one sentence, then label and value rows (原料來源, 再製方式, 外觀與質感, 做成的作品 …)
    從廢料到材料  the studio's own three steps. They were transcribed from each page's process picture, where the
                  text used to exist only as pixels; the three round photographs are cut from the same picture
                  (public/assets/materials/<slug>-1..3.webp). Wording kept; spacing, full stops and two typos set
                  right. The picture and its phone copy no longer show in the gallery.
    背景知識      questions and answers from public sources, each with numbered source notes and the year.
- Sources: three research passes (2026-11-28) returned facts with verbatim quotes; before use, the key wording of
  each cited page was checked again by fetching it (HTML pages by text, three PDFs with pypdf). Sources that could
  not be opened here were not used (a 監察院 report, a Taipower greennet page, 中時, ministry waste PDFs).
- The studio's own figures inside 從廢料到材料 are shown as the studio's (「以上三個步驟為 re.O 工作室的說明」).
  Research could not support some of them, and they are not repeated in 背景知識. For the owner to review:
    咖啡渣    28.5 億杯 / 130 杯: old media figures attributed to ICO. 環境部 (2025-12): 37 億杯, 11.1 萬噸咖啡渣.
    水庫淤泥  96 座 / 28.4 億噸 / 三分之一 / 石門 300 萬噸: 水利署 (114 年底) 95 座, effective capacity 76.53% of design;
              石門 yearly dredging about 354.8 萬立方公尺 (a volume, not a stock in tonnes).
    煤灰      82.1%: Taipower system 2024, counting cogeneration; national coal share 2025 is 35.3% (能源署).
              「煤灰是全球暖化的焦點原因」 is not what the sources say (ash is a by-product; CO2 is the issue).
    焚化粒料  24 座 / 630 萬 / 100 萬公噸: the RAMS site's own older wording; recent 環境部 figure 83 to 85 萬噸底渣.
    回收玻璃  20-23 萬噸 is the yearly weight of glass containers collected for recycling, not glass discarded;
              1260 度 has no public source (present it as the kiln's own setting if that is what it is).
    再生大理石 46 萬公噸 is a commonly quoted estimate without a year; 回收率不足 25% has no source found.
    木頭拼板  30-50% 彎曲樹根 and 「更耐用」 have no source; stability against warping is supported.
- Search: title 「＿＿ ＿＿｜re.O 循環材料」, description from the page's own 「re.O …」 sentence, Article + FAQPage
  structured data (pageMeta.js materialData), photographs' alt texts name re.O.
- Rules for later edits are at the top of materialNotes.js and enforced by tests/materials.test.mjs: every fact has
  a source that was opened, every quantity its year, and the studio's unsupported figures stay out of 背景知識.

## Material pages: words and photographs set together; the owner's own photographs (v1.14.0, 2026-11-28, by request)
Owner on v1.13.0: redesign the layout of the material pages so text and pictures sit together with quality, and add
photographs from 東陽整理照片\物料照片, except the folder 百分料處理.
- MaterialBody.jsx / material-body.css (words still in materialNotes.js, photographs now in materialPhotos.js):
    re.O 的＿＿    a large photograph over six columns, the statement and the file table over five
    從廢料到材料  heading and 「以下三個步驟為 re.O 工作室的說明」 on one line; three steps, each beside its round photograph
    背景知識      heading and one or two photographs in a left column that stays in view while the answers scroll
    現場紀錄      further photographs in justified rows balanced by shape (only with two or more), captions under
  Every photograph opens large on a click. The loose 材料與工藝 gallery under the text is gone from these pages.
- Imported from the owner's folder (resized to 1800px, WebP, public/assets/materials): 木橫擔 nine photographs
  (beam-*), 煤灰 two (ash-*), 玻璃 two (glass-*). They lead those three pages, and their captions repeat his file
  names (木橫擔料廠, 鎖孔, 定位黏著孔 …). fly-ash step 02's round photograph is now cut from his sharper original.
  Not used: 百分料處理 (his instruction), and 檳榔渣 and 紅磚, which are not among the nine materials on the site
  (new material pages would need his text). The other six pages use the photographs they already had.
- The ui-ux-pro-max style search returned "Editorial Grid / Magazine" (asymmetric grid, figure and caption, white
  space); the layout follows that direction with the site's own type and no pull quotes or drop caps.
