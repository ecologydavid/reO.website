import React, { useCallback, useEffect, useRef, useState } from 'react';
import models from '../data/models.json';
import SiteHeader from './site/SiteHeader.jsx';
import SiteFooter from './site/SiteFooter.jsx';
import LogoWall from './site/LogoWall.jsx';
import ShopWindow from './site/ShopWindow.jsx';
import { siteStats } from './site/stats.js';
import GoldDust from './GoldDust.jsx';
import { setPageMeta } from '../seo.js';
import { Arrow, ArrowLink, Button, SectionHead, Frame } from './site/ui.jsx';
import './home.css';
import './home-v10.css';

// Recycled-marble process in eight steps. The material page charts three stages (廢棄回收・研磨成粉・
// 比例澆注); the journal articles 重新定義「廢料」, 實驗再生材質, 強化材質脫氣升級 and 工廠步驟把關
// describe the steps in between. Photos come from those same pages.
const sequence = [
  { label: '石材切割', line: '大理石原塊切割後，留下破碎邊角料。', src: '/content/images/28a451782e04bc72f1.webp', alt: '切割機正在切割大理石原塊', width: 1440, height: 960 },
  { label: '廢棄回收', line: '回收邊角料，重新成為材料來源。', src: '/content/images/4c8f7e6331677eaa2e.webp', alt: '回收的大理石加工邊角料', width: 810, height: 1440 },
  { label: '破碎研磨', line: '破碎、粉碎、研磨成統一粉末。', src: '/content/images/f7cf2451cb151f0457.webp', alt: '破碎後的大理石邊料', width: 1440, height: 1440 },
  { label: '比例調配', line: '經材質實驗與比例優化，與樹脂調和。', src: '/content/images/002e36c018ceece1c4.webp', alt: 're.O 工作室的材料調配容器', width: 1440, height: 1080 },
  { label: '真空脫泡', line: '真空除泡，去除氣泡孔洞。', src: '/content/images/70c8dcab73d64c4d81.webp', alt: 're.O 工作室的真空脫氣設備', width: 1440, height: 1080 },
  { label: '灌注成型', line: '以矽膠模具灌注成形。', src: '/content/images/0b9cc353f2982e96ef.webp', alt: '成排的灌注模具', width: 1440, height: 1440 },
  { label: '品質檢驗', line: '逐件挑選排除氣孔、白點、刮痕。', src: '/content/images/eaa0be28bf809c8400.webp', alt: 'B 款獎盃再生大理石構件與木質盃身的表面細節', width: 1317, height: 988 },
  { label: '異材結合', line: '結合各式異材，完成作品。', src: '/content/images/e8b500fc458fa120e4.webp', alt: 'B 款獎盃 木客微光 × 匠子 完成品', width: 1440, height: 1080, top: true }
];
// Four phases carry the idea at a glance (scrap becomes a trophy); each holds two consecutive steps.
const phases = [
  { en: 'Reclaim', name: '回收', note: '邊角料成為原料' },
  { en: 'Refine', name: '同質', note: '研磨成粉，重新調配' },
  { en: 'Reform', name: '成形', note: '灌注成新的石材' },
  { en: 'Reborn', name: '再生', note: '檢驗打磨，成為獎盃' }
];
// Each step read in full (V44 side column): text condensed from the studio article named in `article` (no new
// claims), a few keywords, and a second photo from the same article. A `pair` is a side-by-side pair of photos
// in one file, split into public/assets/process/<id>-a|b.webp so the side column can stack them full width.
const processNotes = [
  { article: '重新定義「廢料」', text: '再生大理石的循環從石材加工開始：大板切割後，剩下的邊角料被回收。切割、研磨時用來冷卻鋸片的水，也帶走細微顆粒形成石粉漿；re.O 正研究它的固液分離與再利用。', points: ['大板', '切割', '剩餘邊角料', '回收'], more: { id: '93f6cd5245d1b2decf', w: 1200, h: 630, caption: '切割後留下的大理石邊角料' } },
  { article: '實驗再生材質', text: '將各種廢棄物回收，或與政府合作收購，經過多次實驗，為它們重新找回價值。re.O 工作室現已有近 30 種不同的廢棄原材。', points: ['回收', '分選', '近 30 種廢棄原材'], more: { id: '8a959cd06cce7ed889', w: 1440, h: 1080, caption: '工作室分類存放的廢棄原材' } },
  { article: '重新定義「廢料」', text: '將原本視作廢棄物的邊角料破碎、粉碎、研磨，再灌以比例樹脂，製作獨有的再生材質。', points: ['破碎', '粉碎', '研磨'], more: { id: '54382647cf832e1ef6', pair: true, caption: '破碎後的石材與粉末' } },
  { article: '實驗再生材質', text: '透過不斷實驗，建立可重複驗證的再製材料配方，讓廢棄物從不穩定的來源，轉為可控的複合材料。氣泡、沈底、固化碎裂、分佈不均，每一道難題跨過後，才成為材質的獨特性。', points: ['材質實驗', '比例優化', '可重複驗證的配方'], more: { id: '62d4e165d65fcd2e3f', w: 1440, h: 1440, caption: '調配中的再生材料' } },
  { article: '強化材質脫氣升級', text: '回收粉末的顆粒與氣孔不同，倒模時容易產生氣泡，讓產品沿著裂隙斷裂。工作室以真空機高壓脫氣；較濃稠的原材，再以真空腔的壓力差讓氣泡上浮破裂。真空機的馬達，是回收的船用馬達。', points: ['高頻振動', '真空腔', '回收船用馬達'], more: { id: '15d9ed8f0e8a40780c', w: 1440, h: 1080, caption: '高壓真空脫氣用的真空機' } },
  { article: '實驗再生材質', text: '設計開模、固化外觀。配方成功與否，最後的關鍵在模具設計，讓後續成品的損耗率降至 3%。', points: ['可重複量產成型', '尺寸、強度、收縮率的穩定'], more: { id: '5c56baec4a1a1dcc1a', pair: true, caption: '模具與材質的成型測試' } },
  { article: '工廠步驟把關', text: '直接前往工廠，在零件塗裝前一一挑出毛刺、白點、指痕或灰塵等不良品。若一份訂單有 500 件商品、每件 5 個零件，就要檢驗 2,500 次。', points: ['毛刺', '白點', '指痕', '灰塵'], more: { id: 'b94278256c0641e7c5', w: 1440, h: 1080, caption: '排列整齊、等待檢驗的零件' } },
  { article: '工廠步驟把關', text: '經過篩選的零件，才會送回 re.O 工作室進行最後加工。設計不因環保標籤而降低品質，從源頭把關，成品才讓客戶與我們都滿意。', points: ['篩選', '最後加工', '完成作品'], more: { id: '25d378e5481c1d60e6', w: 1440, h: 1080, caption: '篩選後送回工作室的零件' } }
];
const pad = n => String(n).padStart(2, '0');
// The hero features the D model alone (by request E stepped down): three real photographs of D, from
// the three colours together to the gift box, under one headline. Every slide keeps its alt text (hidden
// slides are aria-hidden, so screen readers hear only the active one while crawlers still index all three).
// Positions keep every trophy clear of the headline column. Each panel haze is a 160px copy of its photo, so it costs next to nothing.
const slideMs = 5000;
const img = id => '/content/images/' + id + '.webp';
const heroSlides = [
  { n: '01', name: '白／黑／綠 三色', src: img('0ec85ee98fb1103204'), haze: '/assets/hero-haze-D-trio.webp', position: '41% 58%', alt: 'D 款公版獎盃，白、黑、綠三色再生大理石並列' },
  { n: '02', name: '將榮譽賦予份量', src: img('aadb3001769fa976a7'), haze: '/assets/hero-haze-D-hand.webp', position: '62% 55%', alt: '手持 D 款公版獎盃，呈現實際大小' },
  { n: '03', name: '黑卡浪紙盒包裝', src: img('8c9018e7d0d0ec8c4b'), haze: '/assets/hero-haze-D-box.webp', position: '45% 55%', alt: 'D 款公版獎盃收入黑卡浪紙盒' }
];
function Hero({ onPreview }) {
  const [active, setActive] = useState(0), [paused, setPaused] = useState(false), [away, setAway] = useState(false), hero = useRef(null);
  // Off screen the slow zoom and the progress bar pause, so the hero costs nothing while you read on.
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting)); observer.observe(hero.current); return () => observer.disconnect() }, []);
  // Endless loop, 5s per slide. With motion the progress bar drives the change (so pausing freezes
  // it exactly); under reduced motion a plain timer does. The pause button satisfies WCAG 2.2.2.
  const next = useCallback(() => setActive(a => (a + 1) % heroSlides.length), []), still = useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { if (paused || away || !still.current) return; const timer = setTimeout(next, slideMs); return () => clearTimeout(timer) }, [active, paused, away, next]);
  return <section className={`rv-hero${paused ? ' is-paused' : ''}${away ? ' is-away' : ''}`} ref={hero} aria-labelledby="rv-hero-title" aria-roledescription="輪播">
    <GoldDust gust={active} running={!paused} />
    {/* A frosted column carries the headline; the featured trophy stays clear beside it. */}
    <div className="rv-hero-panel">
      {heroSlides.map((s, i) => <img key={s.n} className={`rv-hero-haze${i === active ? ' is-active' : ''}`} src={s.haze} alt="" aria-hidden="true" />)}
      <p className="rv-hero-kicker"><span>re.O</span>循環設計</p>
      <div className="rv-hero-copy">
        <h1 id="rv-hero-title"><span><span>再生大理石，</span></span><span><span>成就高雅的榮譽。</span></span></h1>
        <p>D 款公版獎盃・大理石邊料回收再生。</p>
        <div className="rv-hero-actions"><Button href="#classic" variant="light">探索公版獎盃</Button><Button onClick={() => onPreview('D')} variant="glass">開始 D 款排版</Button></div>
        <div className="rv-hero-picks"><p><span>A–F</span>選一款開始排版</p><ul>{models.map(m => <li key={m.id}><button onClick={() => onPreview(m.id)} aria-label={`開始 ${m.id} 款 ${m.name} 排版`}><img src={`/assets/product-thumb-${m.id}.webp`} alt="" width="360" height="270" /><span>{m.id}</span></button></li>)}</ul></div>
      </div>
      <ul className="rv-hero-stats">{siteStats.map(([n, label, href]) => <li key={label}><a href={href}><strong>{n}</strong><span>{label}</span></a></li>)}</ul>
    </div>
    <div className="rv-hero-stage">
      {heroSlides.map((s, i) => <img key={s.n} className={`rv-hero-photo${i === active ? ' is-active' : ''}`} src={s.src} alt={s.alt} aria-hidden={i !== active || undefined} width="1440" height="1080" style={{ objectPosition: s.position }} fetchPriority={i ? undefined : 'high'} />)}
      <div className="rv-hero-tabs" role="group" aria-label="D 款公版獎盃">{heroSlides.map((s, i) => <button key={s.n} aria-pressed={i === active} onClick={() => setActive(i)}><span className="rv-hero-bar">{i === active && <i key={active} onAnimationEnd={next} />}</span><strong>{s.n}</strong><span>{s.name}</span></button>)}<button className="rv-hero-toggle" onClick={() => setPaused(p => !p)} aria-label={paused ? '播放輪播' : '暫停輪播'}><svg viewBox="0 0 16 16" aria-hidden="true"><path d={paused ? 'M5 3.5v9l7.5-4.5z' : 'M5 3.5v9M11 3.5v9'} fill={paused ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
    </div>
  </section>;
}
// V43 process as a cycle (owner, 2026-11-08): the eight steps sit on one ring drawn after the re.O logo GIF.
// The dot sits on the ring at three o'clock with an open gap of about 8° each side (no line touches it), and
// the ring runs counter-clockwise from just above the dot, as the GIF draws it. Four quadrants, read
// counter-clockwise, are the four phases (回收 top right, 再生 top left, 成形 bottom left, 再利用 bottom right),
// two photos in each, each phase named in its corner; the quadrant cuts are light grey ticks.
// The diagram is always shown; only the line moves (a stroke runs once round from the dot, then rests), and it
// pauses off screen.
// V44 (owner, 2026-11-08): larger step photos, and the ring sits between two side columns so the section is
// not one lone circle. At rest the left lists the four phases and the right introduces the material. Pointing
// at (or focusing, or tapping) a photo grows it in the centre; the left then reads that step in full (from
// the studio article it comes from, with a link to it), and the right shows a second
// photo from the same article. Tablets put the two columns under the ring; phones stack them.
// ringR must match --r in home-v10.css (the step numbers are placed in CSS from the photo size).
const ringR = 40, nodeD = 23, gap = 8, flowMs = 7000, flowRun = .7, flowDash = .14;
// Angles here are clockwise from twelve (onRing); the steps run counter-clockwise from the dot at 90°.
const stepAngle = i => 67.5 - 45 * i;
const ringPath = `M${[50 + ringR * Math.sin((90 - gap) * Math.PI / 180), 50 - ringR * Math.cos((90 - gap) * Math.PI / 180)].join(' ')}A${ringR} ${ringR} 0 1 0 ${[50 + ringR * Math.sin((90 + gap) * Math.PI / 180), 50 - ringR * Math.cos((90 + gap) * Math.PI / 180)].join(' ')}`;
const onRing = (deg, r = ringR) => { const t = deg * Math.PI / 180; return [50 + r * Math.sin(t), 50 - r * Math.cos(t)] };
const crop = s => s.top ? { objectPosition: '50% 12%' } : undefined;
// Mostly even speed (a little easing at each end), so every photo stays lit about as long as the next.
const flowEase = x => .6 * x + .4 * (1 - Math.cos(Math.PI * x)) / 2;
// V45 (owner, 2026-11-08): the stroke that runs round the ring lights each photo as it passes under it, so
// it is drawn here frame by frame (a CSS animation cannot tell the photos when it reaches them). It runs only
// on screen, hides while a step is open, and stays off for reduced motion.
function useCycleFlow(stage, flow, dot, nodes) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const span = 360 - 2 * gap, half = Math.asin(nodeD / 2 / ringR) * 180 / Math.PI / span, centres = sequence.map((_, i) => (90 - gap - stepAngle(i)) / span);
    // On screen is kept here, not as a class: React rewrites the stage's className whenever a step opens or
    // closes, which would wipe a class added from outside and freeze the loop.
    let raf = 0, last = performance.now(), elapsed = 0, lit = -1, live = false, held = false;
    const observer = new IntersectionObserver(([entry]) => { live = entry.isIntersecting }); observer.observe(stage.current);
    const light = i => { if (i === lit) return; nodes.current[lit]?.classList.remove('is-lit'); nodes.current[i]?.classList.add('is-lit'); lit = i };
    const frame = now => {
      raf = requestAnimationFrame(frame); const dt = now - last; last = now;
      const el = stage.current; if (!el || !live || document.hidden) return;
      if (el.classList.contains('has-active')) { light(-1); held = true; return }
      // Let go of a step: the stroke sets off from the dot again straight away, and keeps looping.
      if (held) { held = false; elapsed = 0 }
      elapsed += Math.min(dt, 100); const t = elapsed % flowMs / flowMs, p = t < flowRun ? flowEase(t / flowRun) : 1, tail = (1 + flowDash) * p - flowDash, head = tail + flowDash;
      flow.current.style.strokeDashoffset = -tail;
      // Only the drawn part counts: the dash waits off the path before and after its run.
      const from = Math.max(tail, 0), to = Math.min(head, 1); let pick = -1; if (to - from > .01) centres.forEach((c, i) => { if (to > c - half && from < c + half) pick = i }); light(pick);
      const b = (t - .66) / .14; dot.current.style.transform = b > 0 && b < 1 ? `scale(${1 + .6 * Math.sin(Math.PI * b)})` : '';
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); light(-1) };
  }, []);
}
function Process() {
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 760px)').matches);
  useEffect(() => { const query = matchMedia('(max-width: 760px)'), change = () => setCompact(query.matches); query.addEventListener('change', change); return () => query.removeEventListener('change', change) }, []);
  const [active, setActive] = useState(null), [phaseHover, setPhaseHover] = useState(null), stage = useRef(null), intent = useRef(0), flow = useRef(null), dot = useRef(null), nodes = useRef([]), shown = active ?? (compact ? 0 : null);
  useCycleFlow(stage, flow, dot, nodes);
  useEffect(() => () => clearTimeout(intent.current), []);
  // A short hover intent, so sweeping the pointer across the ring to the side text does not flick through steps.
  const point = i => { clearTimeout(intent.current); if (!compact) intent.current = setTimeout(() => setActive(i), 110) };
  const step = shown == null ? null : sequence[shown], note = shown == null ? null : processNotes[shown], lit = shown != null ? shown >> 1 : phaseHover;
  return <section className="rv-section rv-process" id="process" aria-labelledby="rv-process-title">
    <div className="rv-gutter"><SectionHead index="00" label="再生工藝" en="Process" id="rv-process-title" title={<>從邊料開始，<br />讓榮耀成形。</>} /></div>
    <div className="rv-gutter">
      <div className={`rv-cycle${shown != null ? ' has-active' : ''}${lit != null ? ' has-lit' : ''}`} ref={stage} onMouseLeave={() => { clearTimeout(intent.current); if (!compact) setActive(null) }} onBlur={e => { if (!compact && !e.currentTarget.contains(e.relatedTarget)) setActive(null) }} onKeyDown={e => { if (e.key === 'Escape') setActive(null) }}>
        <div className="rv-cycle-side is-left">
          <div className="rv-cycle-layer rv-cycle-index" aria-hidden={shown != null || undefined}>
            <p className="rv-cycle-kicker">四個階段・從圓點出發，逆時針</p>
            <ol>{phases.map((p, q) => <li key={p.en}><button type="button" tabIndex={shown != null ? -1 : undefined} className={phaseHover === q ? 'is-on' : undefined} onMouseEnter={() => setPhaseHover(q)} onMouseLeave={() => setPhaseHover(null)} onClick={() => setActive(q * 2)}>
              <span className="rv-cycle-range">{pad(q * 2 + 1)}–{pad(q * 2 + 2)}</span>
              <span className="rv-cycle-name"><strong>{p.name}</strong><em>{p.en}</em></span>
              <span className="rv-cycle-steps-of">{sequence[q * 2].label}・{sequence[q * 2 + 1].label}</span>
            </button></li>)}</ol>
          </div>
          {note && <div className="rv-cycle-layer rv-cycle-detail" key={shown} aria-live="polite">
            <p className="rv-cycle-count"><b>{pad(shown + 1)}</b><span>/ 08</span><i>{phases[shown >> 1].name}・{phases[shown >> 1].en}</i></p>
            <h3>{step.label}</h3>
            <p className="rv-cycle-lead">{step.line}</p>
            <p className="rv-cycle-text">{note.text}</p>
            <ul className="rv-cycle-points">{note.points.map(p => <li key={p}>{p}</li>)}</ul>
            <div className="rv-cycle-nav">
              <ArrowLink href={`#/read/blog/posts/${note.article}`}>閱讀〈{note.article}〉</ArrowLink>
            </div>
          </div>}
        </div>
        <div className="rv-cycle-ring">
          {/* V47: the quadrants as four blocks; their gutters are the cuts between phases. */}
          <div className="rv-cycle-tiles" aria-hidden="true">{phases.map((p, q) => <div key={p.en} className={`rv-cycle-tile is-q${q}${lit === q ? ' is-current' : ''}`}><p className="rv-cycle-phase"><strong>{p.name}</strong><em>{p.en}</em></p></div>)}</div>
          <div className="rv-cycle-disc" aria-hidden="true" />
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path className="rv-cycle-track" d={ringPath} />
            <path className="rv-cycle-flow" ref={flow} d={ringPath} pathLength="1" />
            <path className="rv-cycle-progress" d={ringPath} pathLength={360 - 2 * gap} style={{ strokeDasharray: `${shown == null ? 0 : 90 - gap - stepAngle(shown)} 400`, opacity: shown == null ? 0 : 1 }} />
            <circle className="rv-cycle-dot" ref={dot} cx={50 + ringR} cy="50" r="1.15" />
          </svg>
          <div className="rv-cycle-intro" aria-hidden={shown != null || undefined}><strong>八道工序<br />一個循環</strong><p className="rv-cycle-how"><span className="is-pointer">將游標移到圖片上，看每一步</span><span className="is-touch">點選圖片，看每一步</span></p></div>
          {sequence.map((s, i) => {
            const t = stepAngle(i) * Math.PI / 180;
            return <figure key={s.label} className={`rv-cycle-card${shown === i ? ' is-open' : ''}`} aria-hidden="true" style={{ '--ux': Math.sin(t) * ringR, '--uy': -Math.cos(t) * ringR }}>
              <img src={s.src} alt="" width={s.width} height={s.height} loading="lazy" style={crop(s)} />
              {!compact && <figcaption><span>{pad(i + 1)}・{phases[i >> 1].name}</span><strong>{s.label}</strong></figcaption>}
            </figure>
          })}
          <ol className="rv-cycle-steps" aria-label="再生大理石製程，八道工序">{sequence.map((s, i) => {
            const [x, y] = onRing(stepAngle(i)), t = stepAngle(i) * Math.PI / 180;
            return <li key={s.label} style={{ '--dx': Math.sin(t), '--dy': -Math.cos(t) }} className={shown == null && phaseHover != null && i >> 1 !== phaseHover ? 'is-dim' : undefined}>
              <button type="button" ref={n => { nodes.current[i] = n }} className={`rv-cycle-node${shown === i ? ' is-active' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} aria-pressed={shown === i} aria-label={`${pad(i + 1)} ${phases[i >> 1].name}・${s.label}：${s.line}`}
                onMouseEnter={() => point(i)} onMouseLeave={() => clearTimeout(intent.current)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
                <img src={s.src} alt="" width={s.width} height={s.height} loading="lazy" style={crop(s)} />
              </button>
              <span className="rv-cycle-no" aria-hidden="true">{pad(i + 1)}</span>
            </li>
          })}</ol>
        </div>
        <div className="rv-cycle-side is-right">
          <figure className="rv-cycle-layer rv-cycle-material" aria-hidden={shown != null || undefined}>
            <img src={img('55069d17278e6fd5db')} alt="再生大理石的材質樣本" width="1440" height="961" loading="lazy" />
            <figcaption>
              <p className="rv-cycle-figure"><strong><small>近</small>30</strong><span>種廢棄原材，<br />re.O 工作室現有</span></p>
              <p className="rv-cycle-text">將大理石邊料研磨為粉末，再與樹脂結合，重新應用於獎盃、器物與品牌作品。</p>
              <ArrowLink href="#/read/pages/material-recycled-marble">認識再生大理石</ArrowLink>
            </figcaption>
          </figure>
          {note && <figure className="rv-cycle-layer rv-cycle-more" key={'more' + shown}>
            {(note.more.pair ? ['a', 'b'].map(k => ({ src: `/assets/process/${note.more.id}-${k}.webp`, w: 696, h: 521 })) : [{ src: img(note.more.id), w: note.more.w, h: note.more.h }]).map((p, k) => <img key={p.src} src={p.src} alt={k ? '' : note.more.caption} width={p.w} height={p.h} loading="lazy" />)}
            <figcaption><span>{note.more.caption}</span><small>出自〈{note.article}〉</small></figcaption>
          </figure>}
        </div>
      </div>
      <p className="rv-process-source">依 re.O 材料頁與工作室文章〈實驗再生材質〉〈重新定義「廢料」〉〈強化材質脫氣升級〉〈工廠步驟把關〉整理</p>
    </div>
  </section>;
}
const materials = [
  ['再生大理石', 'material-recycled-marble', '/assets/material-powder.jpg'],
  ['回收玻璃', 'glass', '/assets/material-glass.jpg'],
  ['退役木橫擔', 'wooden-beam', '/assets/material-wood.jpg'],
  ['咖啡渣', 'coffee-waste', '/content/images/16b62643e8869dd106.webp'],
  ['水庫淤泥', 'reservoir-silt', '/content/images/b22b4e7305e255f890.webp'],
  ['煤灰', 'fly-ash', '/content/images/790b5fdc0f89df0d7f.webp'],
  ['木屑', 'wood-chips', '/content/images/95bd8644e4a1dcf166.webp'],
  ['木頭拼板', 'wood-veneer-panel', '/content/images/a602a0b334820cff7d.webp'],
  ['焚化再生粒料', 'incineration-aggergates', '/content/images/e862a0c81a178eedc0.webp']
];
// Custom trophies are their own block, apart from the A–F catalogue. Copy follows the 訂製 CUSTOM page.
const customModes = [
  { n: '01', title: '專案訂製', line: '以品牌語彙，設計獨有的外觀。', src: '/content/images/ccf5762abffbaf5ef7.webp', alt: 'Oni Bus Coffee 品牌咖啡托盤，專案訂製案例' },
  { n: '02', title: '專料訂製', line: '以品牌的可再利用廢料，製作專屬材質。', src: '/content/images/61b1b99657d3baca5c.webp', alt: '總統盃黑客松獎盃，以焚化再生粒料製作的專料訂製案例' },
  { n: '03', title: '訂製包裝', line: '外盒、內襯到品牌標識，一併訂製。', src: '/content/images/a39bc07b4f4aa850e6.webp', alt: '黑色訂製外盒與內襯，裝載客製獎座', className: 'is-left' }
];
// D and E are the models the studio promotes; they lead the classic at a larger size.
const featured = ['E', 'D'];
// One spec line per model from models.json: type, height (or diameter) and price. Each item keeps
// together when the line wraps.
const specOf = m => { const d = m.dimensions_mm, size = Array.isArray(d) ? `高 ${d[2]} mm` : `直徑 ${d.diameter} mm`; return [m.kind, size, `NT$${m.price.replace('～', '–')}`] };
// The home page keeps the essentials (hero, process, the A–F classic, custom trophies, materials,
// partners, shop). Selected works live on the custom page, IP collaborations on the cases page, and
// the studio, craft and awards on the About page.
export default function Home({ onPreview, section }) {
  const root = useRef(null);
  useEffect(() => setPageMeta(), []);
  // A route that names a section (#/brands) opens the home page at it, after the hash change has scrolled to the top.
  useEffect(() => { if (section) requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView()) }, [section]);
  useEffect(() => { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }), { threshold: .04 }); root.current.querySelectorAll('[data-reveal]').forEach(e => observer.observe(e)); return () => observer.disconnect() }, []);
  return <div className="folio-home tx rv-home" ref={root}>
    <a className="folio-skip" href="#classic">跳至公版系列</a>
    <SiteHeader />
    <main>
      <Hero onPreview={onPreview} />
      <Process />

      <section className="rv-section rv-gutter" id="classic" aria-labelledby="rv-classic-title">
        <SectionHead index="01" label="公版獎盃" en="Classic" id="rv-classic-title" title={<>為榮耀，<br />找到合適的樣貌。</>} />
        <div className="rv-products">{[...models].sort((a, b) => featured.indexOf(b.id) - featured.indexOf(a.id)).map(m => <article className={`rv-product${featured.includes(m.id) ? ' is-feature' : ''}`} key={m.id} data-reveal>
          <button className="rv-product-photo" onClick={() => onPreview(m.id)} aria-label={`開始 ${m.id} 款 ${m.name} 銘版排版`}><Frame src={`/assets/catalogue-${m.id}.webp`} alt={`${m.id} 款 ${m.name}實品`} width="1200" height="900" /><span className="rv-tab" aria-hidden="true">{m.id}</span></button>
          <div className="rv-spec"><div><h3><span className="sr-only">{m.id} 款 </span>{m.name}</h3><p>{specOf(m).map(t => <span key={t}>{t}</span>)}</p></div><button className="rv-start" onClick={() => onPreview(m.id)} aria-label={`開始 ${m.id} 款排版`}><span className="rv-start-text">開始排版</span><Arrow /></button></div>
        </article>)}</div>
      </section>

      <section className="rv-section rv-gutter" id="custom" aria-labelledby="rv-custom-title">
        <SectionHead index="02" label="客製化獎盃" en="Custom" id="rv-custom-title" title={<>為品牌，<br />訂製專屬的榮耀。</>} />
        <ol className="rv-modes">{customModes.map(m => <li key={m.n} data-reveal><a href="#/read/pages/custom"><Frame src={m.src} alt={m.alt} width="1440" height="1440" className={m.className} /><span className="rv-mode-label"><em>{m.n}</em><strong>{m.title}</strong><Arrow /></span><span className="rv-mode-line">{m.line}</span></a></li>)}</ol>
      </section>

      <section className="rv-section rv-materials" id="materials" aria-labelledby="rv-materials-title">
        <div className="rv-gutter">
          <SectionHead index="03" label="循環材料" en="Materials" id="rv-materials-title" title={<>材料的下一站。</>} link={['全部循環材料', '#/explore/materials']} />
          <ul className="rv-swatches">{materials.map(([name, slug, src], i) => <li key={slug} data-reveal><a href={`#/read/pages/${slug}`}><Frame src={src} alt={`${name}原材料`} /><span className="rv-swatch-name"><em>{String(i + 1).padStart(2, '0')}</em><strong>{name}</strong><Arrow /></span></a></li>)}</ul>
        </div>
      </section>

      <LogoWall />

      <ShopWindow />
    </main>
    <SiteFooter />
  </div>;
}
