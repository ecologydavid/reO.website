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
