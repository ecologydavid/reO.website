// Six groups: the bar links to each landing page; the menu overlay shows every destination on one page.
// Standard (公版) and custom (客製化) trophies are separate groups; deeper filters live on the library pages.
// v52 (owner, 2026-11-09): 客製化獎盃 is renamed 品牌訂製 (same page and links); 禮贈品訂製 (formerly 生活設計商品)
// follows it with everything that is not a trophy.
// v58 (owner, 2026-11-11): one destination, one place. Every link below leads somewhere no other link leads.
// - 訂製常見問題 sat under 公版, 品牌訂製 and 服務指南: it is now in 服務指南 only.
// - 聯絡與預約 (#/read/pages/contact) and 品牌理念 are the same About page, and 獎項 is a section of it: About lists the page and
//   its record once each. 品牌與工藝內容 (#/explore/about) only re-listed those About pages, so it leaves the menus.
// - 企業獎盃 cases live on 品牌訂製; 品牌禮贈 and IP cases on 禮贈品訂製: the case filters are not repeated in the menus.
// - Pinkoi (retail) belongs with 禮贈品訂製; 匠子 CHANZ STUDIO with About (it is the studio, not a material).
// - Each group's heading is the link to its landing page, so the list under it does not repeat that page.
// Old routes still open (contact, awards, explore/about, the case filters); they are just not listed twice.
// Retail: the studio's official Pinkoi store (匠子 CHANZ STUDIO). External, opens in a new tab. Listed once, under 禮贈品訂製
// (the header's Pinkoi pill is the shop button, v29).
export const shopLink = ['Pinkoi 線上選購', 'https://www.pinkoi.com/store/chanzstudio'];
export const isExternal = href => /^https?:/.test(href);
// v64: `menu` is what a header link's panel shows on desktop: [name, route, one-line note]. The first row is the
// group's own page, so the panel also works where there is no hover. `links` still feeds the footer and the phone menu.
export const navigation = [
    { id: 'products', menu: [['五款公版總覽', '#/explore/standard', '款式、價格與訂購流程'], ['銘版排版工作室', '#/preview/D', '選款式，即時預覽銘版'], ['APEX', '#/read/products/trophy', 'NT$ 2,500 起', { letter: 'A' }], ['BOND', '#/read/products/trophy-1', 'NT$ 2,800', { letter: 'B', featured: true }], ['CRYSTAL', '#/read/products/trophy-1-1', 'NT$ 2,000', { letter: 'C' }], ['DELTA', '#/read/products/trophy-2025-1', 'NT$ 2,300', { letter: 'D', featured: true }], ['EXCEED', '#/read/products/the-way-to-peak-standard-trophy', 'NT$ 3,000', { letter: 'E', featured: true }]], label: '公版獎盃', short: '公版獎盃', en: 'Classic', href: '#/explore/standard', match: ['#/explore/standard', '#/read/products', '#/read/categories'], image: '/assets/catalogue-B.webp', links: [['線上排版工作室', '#/preview/B']] },
    { id: 'custom', menu: [['品牌客製化訂製流程', '#/read/pages/custom', '從概念設計到出貨，七個步驟'], ['3D 建模與設計', '#/read/pages/3d-modeling', '拆件、模流與細節優化'], ['企業獎盃案例', '#/explore/cases?filter=企業獎盃', '歷年訂製作品']], label: '品牌客製化訂製', short: '品牌客製化訂製', en: 'Brand', href: '#/read/pages/custom', match: ['#/read/pages/custom', '#/read/pages/3d-modeling'], image: '/content/images/61b1b99657d3baca5c.webp', links: [['3D 建模與設計', '#/read/pages/3d-modeling']] },
    { id: 'gifts', menu: [['禮贈品訂製流程', '#/explore/products', '品牌禮贈、器物與 IP 聯名'], ['IP 聯名案例', '#/explore/cases?filter=IP生活設計', 'Disney、Marvel 等授權設計'], shopLink.concat('匠子 CHANZ STUDIO 官方設計館')], label: '禮贈品訂製', short: '禮贈品訂製', en: 'Gifts', href: '#/explore/products', match: ['#/explore/products'], image: '/content/images/5239c1559eb6e8363c.webp', links: [shopLink] },
    { id: 'cases', menu: [['全部合作案例', '#/explore/cases', '企業獎盃、品牌禮贈與 IP 聯名'], ['合作品牌牆', '#/brands', '依委製與合作關係展示']], label: '企業與IP案例', short: '合作案例', en: 'Works', href: '#/explore/cases', match: ['#/explore/cases'], image: '/assets/case-ase.webp', links: [['合作品牌牆', '#/brands']] },
    { id: 'materials', menu: [['九種循環材料', '#/explore/materials', '從回收原材到可用的材質'], ['再生大理石', '#/read/pages/material-recycled-marble', '石材邊料研磨再生'], ['工藝與工作室文章', '#/explore/journal', '材料試驗與製程紀錄']], label: '材料與工藝', short: '循環材料', en: 'Materials', href: '#/explore/materials', match: ['#/explore/materials', '#/explore/journal', '#/read/pages/material', '#/read/pages/glass', '#/read/pages/coffee-waste', '#/read/pages/wooden-beam', '#/read/pages/reservoir-silt', '#/read/pages/fly-ash', '#/read/pages/wood-', '#/read/pages/incineration', '#/read/blog'], image: '/content/images/4c8f7e6331677eaa2e.webp', links: [['再生大理石', '#/read/pages/material-recycled-marble'], ['工藝與工作室文章', '#/explore/journal']] },
    { id: 'about', menu: [['品牌與創辦人', '#/read/pages/about', '理念、聯絡方式與工作室'], ['設計講座與產業報導', '#/read/pages/awards', '獲獎、展覽與媒體紀錄'], ['匠子 CHANZ STUDIO', '#/read/pages/chanz-studio', '同一個工作室的設計品牌']], label: '關於 re.O', short: '關於 re.O', en: 'Studio', href: '#/read/pages/about', match: ['#/read/pages/about', '#/read/pages/awards', '#/explore/about', '#/read/pages/contact', '#/read/pages/chanz-studio'], image: '/content/images/8adb10dc0ad1b38e8f.webp', links: [['設計講座與產業報導', '#/read/pages/awards'], ['匠子 CHANZ STUDIO', '#/read/pages/chanz-studio']] }
];
// 服務指南: the only home of the FAQ and the two policies.
export const supportLinks = [['常見問題', '#/read/pages/faq'], ['運送說明', '#/read/about/delivery-policy'], ['退換貨說明', '#/read/about/policy']];
export const categoryInfo = {
    standard: { label: '公版獎盃', title: '為榮耀，找到合適的樣貌。', intro: '五款公版設計，結合循環材料與專屬銘版。' },
    custom: { label: '品牌客製化訂製', title: '為品牌，訂製專屬的榮耀。', intro: '從品牌專屬設計到專屬材質，兩種方式訂製你的榮耀。' },
    products: { label: '禮贈品訂製', title: '讓設計，走進每一種日常。', intro: '品牌禮贈與生活物件，從材質與使用情境開始挑選。' },
    cases: { label: '企業與IP案例', title: '每件作品，都有它的出發點。', intro: '從企業回收材料、品牌識別，到授權生活設計，閱讀完整的合作故事。' },
    materials: { label: '循環材料', title: '材料的下一站。', intro: '從回收原材的特性出發，探索設計與製造的可能。' },
    journal: { label: '設計與工藝', title: '從試驗，到成形。', intro: '走進工作室，閱讀材料試驗、立體設計與手作製程。' },
    about: { label: '關於 re.O', title: '以設計，延續材料的生命。', intro: '認識或心、匠子，以及作品背後的理念與專業足跡。' },
    support: { label: '服務指南', title: '讓每一步，都更清楚。', intro: '訂製流程、校稿、運送與退換貨，開始合作前的實用資訊。' }
};
export function contentHref(url) { try { return '#/read/' + decodeURIComponent(new URL(url, 'https://www.re-o.co').pathname.replace(/^\//, '')) } catch { return '#/explore/cases' } }
