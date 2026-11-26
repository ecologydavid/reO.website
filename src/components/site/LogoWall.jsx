import React, { useCallback, useEffect, useRef, useState } from 'react';
import logos from '../../data/logo-wall.json';
import { SiteArrow } from './SiteHeader.jsx';
import './brand-wall.css';
// The owner's order for the first sixteen (2026-11-25, numbered by hand on a screenshot); the rest follow as listed.
const priority = ['delta', 'ase', 'fubon', 'pwc', 'executive-yuan', 'moenv', 'iii', 'taipower', 'disney', 'hola', 'heineken', 'singleton', 'uber-eats', 'golden-horse', 'songshan', 'pinkoi'];
const ordered = [...logos].sort((a, b) => { const x = priority.indexOf(a.id), y = priority.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) });
// 木客's and 木田工場's marks are drawn for dark grounds, so their tiles are ink. (DCC's black and white inks print as
// one dark shape; that is made in the file itself now.)
const tone = { muke: 'is-dark', muteam: 'is-dark' };
// v1.5.0 (owner, 2026-11-26): every mark is a picture made by tools/logos.py to ONE rule (background off, trimmed,
// sized by area, centred on a canvas of the tile's shape). The tile shows that canvas whole; nothing here or in the
// stylesheet sizes a mark. A new partner: add it to logo-wall.json and run the script.

// Partner marks in their own colours on white tiles over a warm ground. Pointing at a mark brings it
// forward (the others step back) and a small print of the work follows the cursor: the photo, the
// project and the partner. Keyboard focus shows the same print beside the tile; touch goes straight
// to the case.
// The wall lives on the home page only, every mark in the markup with its name (the picture's description) and its
// project as text.
// Phones show four rows and open the rest in place.
// v1.6.0 (owner, 2026-11-27): twenty partners were added as marks only, "先不放實際案例的圖片和連結". An entry without
// `href` is a plain tile: no link, no print, no dimming of the others. Give it `href`, `project` and `preview` when its
// case goes up and it behaves like the rest. (`works` in the data is the owner's note of what was made; not shown yet.)
export default function LogoWall() {
    const card = useRef(null), motion = useRef({ x: 0, y: 0, tx: 0, ty: 0, r: 0, frame: 0, on: false, still: false, loaded: false });
    const [active, setActive] = useState(null), [shown, setShown] = useState(null), [open, setOpen] = useState(false);
    useEffect(() => { const m = motion.current; m.still = matchMedia('(prefers-reduced-motion: reduce)').matches; return () => cancelAnimationFrame(m.frame) }, []);
    // The print eases towards the pointer and leans a little with its speed.
    const loop = useCallback(() => {
        const m = motion.current, el = card.current; if (!el) { m.frame = 0; return }
        const k = m.still ? 1 : .2, dx = (m.tx - m.x) * k, dy = (m.ty - m.y) * k; m.x += dx; m.y += dy;
        m.r += (Math.max(-5, Math.min(5, dx * .4)) - m.r) * .2; if (m.still) m.r = 0;
        el.style.transform = `translate3d(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px,0) rotate(${m.r.toFixed(2)}deg)`;
        m.frame = m.on || Math.abs(dx) + Math.abs(dy) + Math.abs(m.r) > .2 ? requestAnimationFrame(loop) : 0;
    }, []);
    // Beside the point (right of it, or left near the screen edge), kept inside the window.
    const aim = useCallback((x, y, jump) => {
        const m = motion.current, el = card.current; if (!el) return;
        const w = el.offsetWidth, h = el.offsetHeight, gap = 28;
        m.tx = x + gap + w > innerWidth - 16 ? x - gap - w : x + gap; m.ty = Math.max(16, Math.min(innerHeight - h - 16, y - h * .4));
        if (jump) { m.x = m.tx; m.y = m.ty; m.r = 0 }
        if (!m.frame) m.frame = requestAnimationFrame(loop);
    }, [loop]);
    const show = useCallback((logo, x, y) => {
        const m = motion.current, first = !m.on; m.on = true; setActive(logo.id); setShown(logo);
        // Prints are small (520px WebP); fetch them all once the wall is first pointed at.
        if (!m.loaded) { m.loaded = true; logos.forEach(l => { if (l.preview) new Image().src = l.preview.src }) }
        requestAnimationFrame(() => aim(x, y, first));
    }, [aim]);
    const hide = useCallback(() => { motion.current.on = false; setActive(null) }, []);
    const mouse = e => e.pointerType === 'mouse';
    return <section className={`site-brand-wall brand-ledger folio-gutter${open ? ' is-open' : ''}`} id="brands">
        <div className="folio-section-heading"><h2>與品牌共創，<br /><span style={{ whiteSpace: 'nowrap' }}>值得留下的作品。</span></h2><p>企業委製、品牌合作與授權設計案例。</p></div>
        <div className="site-logo-grid" onPointerMove={e => { if (mouse(e) && motion.current.on) aim(e.clientX, e.clientY) }} onPointerLeave={e => { if (mouse(e)) hide() }}>
            {ordered.map(logo => <article className={`site-logo-cell brand-card ${tone[logo.id] || ''}${active === logo.id ? ' is-active' : ''}`} key={logo.id}>
                {!logo.href ? <span className="brand-card-link"><img className="brand-mark" src={logo.mark.src} alt={logo.name} width={logo.mark.width} height={logo.mark.height} loading="lazy" decoding="async" /></span> : <a className="brand-card-link" href={logo.href}
                    onPointerEnter={e => { if (mouse(e)) show(logo, e.clientX, e.clientY) }}
                    onFocus={e => { if (!e.currentTarget.matches(':focus-visible')) return; const b = e.currentTarget.getBoundingClientRect(); show(logo, b.right - 12, b.top + b.height / 2) }}
                    onBlur={hide}>
                    <img className="brand-mark" src={logo.mark.src} alt={logo.name} width={logo.mark.width} height={logo.mark.height} loading="lazy" decoding="async" /><span className="sr-only">：{logo.project?.split('｜')[0] || '合作案例'}</span>
                </a>}
            </article>)}
        </div>
        <figure className={`brand-preview${active ? ' is-on' : ''}`} ref={card} aria-hidden="true">
            {shown && <>{shown.preview && <img src={shown.preview.src} alt="" width={shown.preview.width} height={shown.preview.height} />}<figcaption><em>{shown.name}</em><strong>{shown.project?.split('｜')[0] || shown.name}</strong></figcaption></>}
        </figure>
        <div className="site-brand-bottom"><p>依各專案的委製與合作關係展示；授權設計、代理委製等資訊詳見案例說明。</p><div className="site-brand-links"><button type="button" className="folio-link site-brand-more" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '收合品牌' : `顯示全部 ${logos.length} 個品牌`}<SiteArrow /></button><a className="folio-link" href="#/explore/cases">探索全部合作案例<SiteArrow /></a></div></div>
    </section>
}
