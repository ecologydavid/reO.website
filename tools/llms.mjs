// llms.txt (v1.3.0, by request): a plain-text introduction to the site for AI assistants, at /llms.txt.
// The format follows llmstxt.org: a title, a short summary, then sections of links with one line each.
// It is written by the build from the same data the pages use (content index, models), so it cannot go stale.
// Honest scope: this is a young convention; no large assistant has promised to read it. It costs nothing to keep.
//
// Every statement here is on the site or was given by the owner (2026-11-26): re.O is the company name and the main
// name; 匠子 CHANZ STUDIO is its own lifestyle brand, sold on Pinkoi; the main work is company orders, small orders are
// taken too, the classic trophies suit a tighter budget, and orders are agreed by e-mail or telephone.
import {isAlias} from './aliases.mjs';

const names = {A: 'APEX', B: 'BOND', C: 'CRYSTAL', D: 'DELTA', E: 'EXCEED'};
const toPath = name => { let p = name.slice(2).split('?')[0]; if (p.startsWith('read/')) p = p.slice(5); p = p.replace(/\/+$/, ''); return p ? p + '/' : ''; };
const one = text => String(text || '').replace(/\s+/g, ' ').trim();
const clip = (text, n = 90) => { text = one(text); return text.length > n ? text.slice(0, n - 1) + '…' : text; };

export function llmsText({site, index, models}) {
  const url = route => `${site}/${toPath(route)}`;
  const pages = index.pages.filter(p => !p.hidden && !isAlias(toPath(p.path)) && !/^#\/read\/products\/f款/i.test(decodeURIComponent(p.path)));
  const link = (p, note) => `- [${one(p.title).replace(/｜/g, ' ')}](${url(p.path)})${note ? '：' + note : ''}`;
  const caseNote = p => { const m = p.metadata || {}; return [m.client && '客戶 ' + m.client, m.year, m.material, m.service].filter(Boolean).map(one).join('・') || clip(p.summary); };
  const cases = pages.filter(p => p.category === 'cases');
  const materials = pages.filter(p => p.category === 'materials');
  const journal = pages.filter(p => p.category === 'journal');
  const classic = models.filter(m => names[m.id]);
  const size = m => Array.isArray(m.dimensions_mm) ? `高 ${Math.max(...m.dimensions_mm) / 10} cm` : '';
  return `# re.O

> re.O（或心國際設計有限公司）以再生材質為企業、機關與賽事設計製作獎盃與禮贈品，工作室在台灣新北市板橋區。以再生材質開發為起點，整合品牌語彙、立體建模、排版、灌模與工作室組裝。

## 關於 re.O

- 名稱：re.O（也寫作 re.o、reO、或心）。公司全名：或心國際設計有限公司，統一編號 83502057。
- 負責人・設計師：李東陽（Dong）。
- 匠子 CHANZ STUDIO 是 re.O 的自有生活品牌，在 Pinkoi 販售再生大理石生活器物：https://www.pinkoi.com/store/chanzstudio
- 地址：220 新北市板橋區實踐路93巷43弄1號1樓（來訪請事先預約）。服務時間：週一至週五 10:30–18:00。
- Instagram：https://www.instagram.com/re.o_upcycle/　Facebook：https://www.facebook.com/re.O.upcycle/

## 如何洽詢與下單

- 企業訂製、公版獎盃與少量訂單，都以來信或來電洽詢，確認款式、數量與交期後報價。
- 電子郵件：service@re-o.co　電話：+886-2-8966-5369
- 主要承接企業、機關與賽事的訂單，少量訂單也接。預算有限時可選公版獎盃。
- 生活器物的零售在 Pinkoi 匠子 CHANZ STUDIO 設計館。

## 服務

- [公版獎盃](${url('#/explore/standard')})：五款現成造型，加上專屬銘版。製作 3 個工作天起，10 座以上工期另計。可先在銘版排版工作室自行排版並下載確認稿。
- [品牌獎盃訂製](${url('#/read/pages/custom')})：依品牌需求設計專屬造型（專案訂製），企業有顆粒、粉末化可再利用的廢棄物料時，也可評估製作專屬材質（專料訂製）。
- [禮贈品訂製](${url('#/explore/products')})：品牌禮贈品、器物、IP 聯名與場域紀念品。
- [循環材料](${url('#/explore/materials')})：再生大理石、回收玻璃、退役木橫擔、咖啡渣、水庫淤泥等九種材料。

## 公版獎盃價格（新台幣）

${classic.map(m => `- [${m.id} 款 ${names[m.id]}](${site}/products/${m.slug}/)：NT$ ${one(m.price)}。${[size(m), one(m.material)].filter(Boolean).join('，')}。`).join('\n')}

## 主要頁面

- [首頁](${site}/)
- [企業與IP案例](${url('#/explore/cases')})：全部合作案例。
- [關於 re.O](${url('#/read/pages/about')})：聯絡方式、創辦人、設計獲獎、展覽、講座與媒體報導。
- [匠子 CHANZ STUDIO](${url('#/read/pages/chanz-studio')})：自有生活品牌與歷年展覽、課程。
- [3D 建模與設計](${url('#/read/pages/3d-modeling')})
- [常見問題](${url('#/read/pages/faq')})：訂製方式、交期、校稿、配送與材質。
- [運送政策](${url('#/read/about/delivery-policy')})

## 合作案例（re.O 設計製作）

${cases.map(p => link(p, caseNote(p))).join('\n')}

## 循環材料

${materials.map(p => link(p, clip(p.summary))).join('\n')}

## 工藝與研究文章

${journal.map(p => link(p, (p.published ? p.published + '　' : '') + clip(p.summary))).join('\n')}
`;
}
