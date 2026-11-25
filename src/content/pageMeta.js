// Titles, descriptions and structured data for search engines and AI assistants (v1.4.0, by request after the GEO audit).
// Nothing here is shown in the page body: a title is the browser tab and the headline of a search result, a
// description is the grey text under it (and what assistants quote most), structured data is read by machines only.
//
// The audit (2026-11-25) found every title starting "re.O｜" with nothing about material, use or place, and
// descriptions with a median of 37 characters (83 of 154 pages under 40, some just the product's name).
// Rules now:
//   - the words that say what the page is come first, the brand last (src/seo.js adds 「｜re.O」 unless the title
//     already names re.O);
//   - a description says what it is, of what, for whom, and, on service pages, how to order;
//   - only facts that are on the page or were given by the owner. No new claims.
// Owner's positioning (2026-11-26): re.O is the company and the main name; 匠子 CHANZ STUDIO is its own lifestyle
// brand (retail, on Pinkoi); the main work is company orders, small orders are taken too, a tighter budget can choose
// the classic trophies; orders are agreed by e-mail or telephone.
//
// No imports: tests read this file in Node (tests/geo.test.mjs).

export const org = '#org';   // the organisation's node in index.html's structured data; src/seo.js completes the address

// ── Written by hand and approved by the owner (2026-11-26), keyed by route name ──
export const written = {
  '#/': {
    title: 're.O｜再生大理石企業獎盃・品牌禮贈品訂製',
    description: 're.O（或心國際設計）在新北板橋，以大理石邊料等再生材質，為企業、機關與賽事設計製作獎盃與禮贈品。公版獎盃 NT$2,000 起、3 個工作天起；訂製請來信 service@re-o.co 或來電 02-8966-5369。'
  },
  '#/explore/standard': {
    title: '公版獎盃｜再生大理石企業獎盃 NT$2,000 起・3 個工作天',
    description: '五款再生材質公版獎盃（A 至 E 款），NT$2,000 至 3,000，3 個工作天起製作，10 座以上工期另計。可先在銘版排版工作室排好文字與 LOGO、下載確認稿，再來信或來電下單，少量也接。'
  },
  '#/read/pages/custom': {
    title: '品牌獎盃訂製｜企業專屬造型與再生材質獎座',
    description: '為企業、機關與賽事訂製專屬獎盃：依品牌語彙設計造型，也可用企業自己的可再利用廢料製成專屬材質。概念設計、3D 建模、開模、灌製到包裝出貨由 re.O 完成。來信或來電洽詢報價。'
  },
  '#/explore/products': {
    title: '禮贈品訂製｜再生材質企業禮品與 IP 聯名商品',
    description: '以再生大理石、咖啡渣、水庫淤泥等循環材料，訂製品牌禮贈品、器物、IP 授權聯名與場域紀念品。從需求確認、造型設計到包裝交付，來信或來電洽詢。'
  },
  '#/explore/cases': {
    title: '合作案例｜台達、日月光、富邦等企業獎盃與 IP 聯名',
    description: 're.O 設計製作的企業獎盃、品牌禮贈品與 IP 聯名作品，合作對象包括台達、日月光、富邦、資誠、行政院等。每件案例說明客戶、年份、材質與設計理念。'
  },
  '#/explore/materials': {
    title: '循環材料｜再生大理石、回收玻璃、咖啡渣等九種',
    description: 're.O 使用的九種循環材料：再生大理石、回收玻璃、退役木橫擔、咖啡渣、水庫淤泥、煤灰、木屑、木頭拼板、焚化粒料。每種材料的來源、質感與做成的作品。'
  },
  '#/explore/journal': {
    title: '設計與工藝｜再生材質實驗與製程紀錄',
    description: 're.O 工作室的材料試驗與製程文章：再生大理石的回收與灌製、真空脫泡、雷射切割銘板、可回收包裝與循環運送。'
  },
  '#/explore/support': {
    title: '服務指南｜訂製常見問題與運送說明',
    description: '與 re.O 合作前的實用資訊：訂製方式、交期、校稿次數、配送方式與運送政策。'
  },
  '#/read/pages/about': {
    title: '關於 re.O｜或心國際設計・創辦人李東陽｜新北板橋',
    description: 're.O（或心國際設計有限公司）由設計師李東陽創辦，工作室在新北市板橋區，以再生材質為企業設計製作獎盃與禮贈品，作品曾獲金點設計獎（2018、2019）。聯絡方式、獲獎、展覽與媒體報導。'
  },
  '#/read/pages/faq': {
    title: '訂製常見問題｜交期、校稿、配送與材質',
    description: '公版、專案與專料訂製有什麼不同？公版約 3 個工作天、含 3 次校稿。也說明配送方式、包裝客製，以及如何用企業自己的廢料製作專屬材質。'
  },
  '#/read/about/delivery-policy': {
    title: '運送政策｜宅配、超商取貨與出貨時間',
    description: 're.O 的配送方式：台灣本島順豐宅配、外島郵局寄送、7-11 與全家超商取貨（約 3 至 4 天）。現貨下單後約 2 至 3 個工作天寄出，週一至週五出貨。'
  },
  '#/read/pages/3d-modeling': {
    title: '3D 建模與設計｜量產拆件、模流與細節優化',
    description: 're.O 的 3D 建模服務：協助完成可量產的數位模型，包含矽膠模具的拆件與結構規劃、模流方向與脫模建議、細節優化與製作可行性分析。'
  },
  '#/read/pages/chanz-studio': {
    title: '匠子 CHANZ STUDIO｜re.O 的再生大理石生活品牌',
    description: '匠子 CHANZ STUDIO 是 re.O 的自有生活品牌，把回收大理石研磨再製成翻轉鏡、摺紙花器、置物盤、杯墊等生活器物，在 Pinkoi 販售。歷年展覽、課程與分享。'
  }
};

const one = text => String(text || '').replace(/\s+/g, ' ').trim();
const stop = text => { text = one(text).replace(/[，、；：,;:s]+$/, ''); return !text || /[。！？!?…]$/.test(text) ? text : text + '。'; };
// A work's name from a migrated title. Two shapes exist:
//   「台達 玻璃樹模範獎盃｜Delta x re.O」, 「Uber Eats 商家合作夥伴獎｜快點行銷委製」: the work, then who it was made with → the work;
//   「行政院國家永續發展委員會｜國家永續發展獎獎盃」, 「HOLA × Disney｜米奇再生大理石桌鐘」: the client, then the work → both.
export const nameOf = page => { const parts = String(page.title || '').split('｜').map(one).filter(Boolean); return parts.length > 1 && /re.[OＯoｏ]|委製$/.test(parts.slice(1).join(' ')) ? parts[0] : parts.join(' '); };

// ── Everything else, by rule, from the fields the page already has ──
// classic: {id, name, price} for the five classic product pages (name APEX…, price '2,300' or '2,500～2,800').
// material: [name, English name] for the nine material pages.
export function articleMeta(page, {classic, material} = {}) {
  const hand = written[page.path];
  if (hand) return hand;
  const name = nameOf(page), summary = one(page.summary), m = page.metadata || {};
  const said = summary && summary !== name && summary !== one(page.title) ? stop(summary) : '';
  if (classic) return {
    title: `${classic.id} 款 ${classic.name} 公版獎盃｜NT$ ${classic.price}・3 個工作天起`,
    description: `${classic.id} 款 ${classic.name} 公版獎盃，NT$ ${classic.price}，3 個工作天起製作，10 座以上工期另計。可在銘版排版工作室編排文字與 LOGO，再來信或來電下單。${/：.*：/.test(said) ? '' : said}`
  };
  if (material) return {
    title: `${material[0]} ${material[1]}｜循環材料`,
    description: `${material[0]}（${material[1]}）是 re.O 的九種循環材料之一。${said}`
  };
  if (page.category === 'cases') {
    const stuff = one(m.material).replace(/[、,，]\s*/g, '・');
    const withStuff = `${name}｜${stuff}｜re.O 案例`;
    const facts = [m.client && `客戶：${one(m.client)}`, m.material && `材質：${one(m.material)}`, m.service && `服務：${one(m.service)}`].filter(Boolean).join('；');
    return {
      title: stuff && withStuff.length <= 34 ? withStuff : `${name}｜re.O 案例`,
      description: `${name}${m.year ? `（${one(m.year)}）` : ''}，re.O ${one(page.subcategory) || '合作'}案例。${facts ? facts + '。' : ''}${said}`
    };
  }
  if (page.category === 'journal') return {title: `${name}｜re.O 設計與工藝`, description: said ? `re.O 工作室文章〈${name}〉：${said}` : `re.O 工作室文章〈${name}〉。`};
  if (page.category === 'products') return {title: `${name}｜匠子 CHANZ STUDIO`, description: `${name}，匠子 CHANZ STUDIO（re.O 的自有生活品牌）的生活器物。${said}`};
  return {title: one(page.title).replace(/｜/g, ' '), description: said || `${name}｜re.O`};
}

// ── Structured data (schema.org), one object per page where the page states the facts itself ──
// Addresses are completed by src/seo.js: `image` and `url` values starting with '/' get the site address, and
// {'@id': org} points at the organisation described once in index.html.
const year = text => /^\d{4}$/.test(one(text)) ? one(text) : undefined;
export function articleData(page, {classic, image} = {}) {
  const name = nameOf(page), summary = one(page.summary) || undefined, picture = image?.src;
  if (classic) {
    const numbers = String(classic.price).match(/[\d,]+/g).map(n => Number(n.replace(/,/g, '')));
    return {'@type': 'Product', name: `${classic.id} 款 ${classic.name} 公版獎盃`, description: summary, image: picture, material: classic.material, brand: {'@type': 'Brand', name: 're.O'},
      // Made to order and agreed by e-mail or telephone: the offer names the price and the seller, no checkout.
      offers: numbers.length > 1
        ? {'@type': 'AggregateOffer', priceCurrency: 'TWD', lowPrice: Math.min(...numbers), highPrice: Math.max(...numbers), offerCount: numbers.length, availability: 'https://schema.org/MadeToOrder', seller: {'@id': org}}
        : {'@type': 'Offer', priceCurrency: 'TWD', price: numbers[0], availability: 'https://schema.org/MadeToOrder', seller: {'@id': org}}};
  }
  const m = page.metadata || {};
  if (page.category === 'cases') return {'@type': 'CreativeWork', name, description: summary, image: picture, creator: {'@id': org},
    // sourceOrganization: "the organization on whose behalf the creator was working", i.e. the client.
    sourceOrganization: m.client ? {'@type': 'Organization', name: one(m.client)} : undefined,
    material: one(m.material) || undefined, dateCreated: year(m.year), genre: one(page.subcategory) || undefined};
  if (page.category === 'journal') return {'@type': 'Article', headline: name, description: summary, image: picture, author: {'@id': org}, publisher: {'@id': org}};
  return null;
}
// Questions and answers exactly as the FAQ page shows them: [[question, answer text], …].
export const faqData = pairs => ({'@type': 'FAQPage', mainEntity: pairs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
