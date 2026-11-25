// The FAQ's questions and answers (v1.5.0, by request: complete the FAQ, decide on numbering).
// Plain data, no JSX: the page (FaqPage.jsx), its FAQPage structured data and llms.txt (tools/llms.mjs) all read it.
//
// Every answer states only what the site already says or what the owner has told us:
//   - owner, 2026-11-26: orders are agreed by e-mail or telephone; small orders are taken for custom work too, but
//     custom work carries design and mould fees, so a small quantity on a tight budget is steered to the classic
//     trophies; whatever the client accepts can be made. Home delivery on the main island takes 1 to 3 days.
//     Proof rounds: 3.
//   - 公版獎盃 page: five models and their prices, 3 working days, 10 or more quoted separately, the layout rules
//     for 10 pieces and over / under 10 (free adjustment of the client's own layout; a fee for layout help).
//   - 品牌獎盃訂製 page: the seven steps; 企業專料; packaging. 禮贈品訂製 page: the four kinds of work.
//   - classic product pages: files to prepare; the seven-day exchange for damage in transit.
//   - About and footer: hours, visits by appointment, address. Materials page: the nine materials.
// Not answered here because the owner has not said: rush orders, payment and invoices, shipping abroad, lead time
// for custom work. Add them when he does.
//
// Numbering (decision, 2026-11-26): each question shows a running number (Q01…) so a customer and the studio can
// point at "第 7 題" on the telephone, and the number is a link to that question (/pages/faq/#q-order), so one answer
// can be sent to a client. The number is NOT part of the question text: the heading, the structured data and
// llms.txt carry the question as a person would ask it, which is what search engines and assistants match on.
// `id` is the address and must never change once published; the number may, as questions are added.
//
// `rich` names an answer the page draws with pictures (FaqPage.jsx); `a` is always the full answer in words.
const img = id => `/content/images/${id}.webp`;
export const groups = [
  {id: 'order', en: 'Ordering', title: '下單與報價', photo: [img('78a844104cdc098c56'), '設計師手繪與量測模型草圖', '從公版款式，到品牌專屬設計', '50% 50%'], items: [
    {id: 'ways', q: '公版、專案、專料訂製有什麼不同？', rich: 'ways', a: '公版：從現有款式挑選，提供文字與數量即可。專案：依品牌需求，討論造型、尺寸與材質。專料：提供品牌的可再利用廢料，評估後製作專屬材質。'},
    {id: 'order', q: '怎麼下單？', a: '來信 service@re-o.co 或來電 +886-2-8966-5369，告訴我們款式或需求、數量與希望的交期，確認後報價。'},
    {id: 'small', q: '可以只訂少量嗎？', a: '可以，公版和客製都接少量訂單。客製會有設計與開模費用，數量少、預算有限時，我們會建議選公版獎盃；費用可以接受的話，少量客製一樣能做。'},
    {id: 'budget', q: '預算有限怎麼選？', a: '可以選公版獎盃：五款 NT$2,000 至 3,000，加上專屬銘版，不需要設計與開模費用。需要專屬造型或材質時，再選品牌獎盃訂製。'},
    {id: 'visit', q: '可以到工作室洽談嗎？', a: '可以，來訪請事先來電預約。服務時間為週一至週五 10:30–18:00，地址是新北市板橋區實踐路93巷43弄1號1樓。'}
  ]},
  {id: 'classic', en: 'Classic', title: '公版獎盃', photo: ['/assets/classic-D-wide.webp', 'D 款 DELTA 再生大理石公版獎盃', '五款公版，加上專屬銘版', '50% 50%'], items: [
    {id: 'models', q: '公版獎盃有哪些款式與價格？', a: '五款：A 款 APEX NT$2,500（北美黃檜）／NT$2,800（木橫擔）、B 款 BOND NT$2,800、C 款 CRYSTAL NT$2,000、D 款 DELTA NT$2,300、E 款 EXCEED NT$3,000。'},
    {id: 'prepare', q: '公版獎盃需要準備什麼？', a: '請提供 LOGO 的 AI 檔與獎盃文字。下單前，歡迎先與我們確認內容。'},
    {id: 'layout', q: '銘版可以自己排版嗎？', a: '可以。在銘版排版工作室選款式、排好文字與 LOGO，下載 PDF 與 EPS 檔寄到 service@re-o.co，我們會依實際印刷條件免費調整。10 座以上可以請我們免費設計排版；低於 10 座請我們設計排版，會酌收排版費。'},
    {id: 'proof', q: '可以先看設計稿再付款嗎？', a: '公版訂製於付款後開始繪製設計圖，含 3 次校稿；超過次數將另計費用。'}
  ]},
  {id: 'custom', en: 'Custom', title: '品牌獎盃與禮贈品訂製', photo: ['/assets/home-mode-ase.webp', '日月光 ASE 傑出供應商獎盃與黑色訂製禮盒', '從概念設計，到獎座出貨', '50% 50%'], items: [
    {id: 'process', q: '訂製獎盃的流程是什麼？', a: '七個步驟：概念設計與包裝規劃、3D 建模、開模、材質灌製、組裝、品檢包裝、出貨。企業有自己的可再利用廢料時，可以在材質灌製前加入，製作專屬材質。'},
    {id: 'fees', q: '訂製會有哪些費用？', a: '訂製除了製作費，還有設計與開模費用。我們在確認造型、數量與交期後一併報價。'},
    {id: 'own-waste', q: '可以用品牌的廢料做專屬材料嗎？', a: '可以。請先提供顆粒、粉末化可再利用的廢棄物料，我們評估可行性後，進行材質測試與設計。'},
    {id: 'packaging', q: '包裝可以客製嗎？', rich: 'packaging', a: '可以，依照預算規劃不同訂製包裝。'},
    {id: 'gifts', q: '禮贈品可以訂製哪些品項？', a: '品牌禮贈品、品牌器物、IP 授權與聯名商品，以及場域紀念品，都從材質與使用情境開始設計。'},
    {id: 'retail', q: '個人想買單件的生活器物，要去哪裡？', a: '請到 Pinkoi 的匠子 CHANZ STUDIO 設計館。匠子是 re.O 的自有生活品牌，販售再生大理石生活器物。'}
  ]},
  {id: 'delivery', en: 'Delivery', title: '製作與配送', photo: [img('9c539bc9ebc1b804f7'), '以膠帶封箱出貨', '包裝出貨，皆由 re.O 把關', '50% 50%'], items: [
    {id: 'lead-time', q: '製作需要多久？', a: '公版約 3 個工作天，10 座以上工期另計；現貨約 2～3 個工作天寄出。實際交期請與我們確認。'},
    {id: 'shipping', q: '有哪些配送方式？', a: '台灣本島順豐宅配約 1～3 天；外島以郵局寄送；7-11、全家超商取貨約 3～4 天。節慶或訂單較多時可能延遲。'},
    {id: 'damage', q: '收到時有損壞怎麼辦？', a: '運送途中如遇嚴重瑕疵或損壞，請保留完整包裝，於七日內與我們聯絡，更換同款商品。'}
  ]},
  {id: 'material', en: 'Material', title: '材質', photo: [img('0ec85ee98fb1103204'), 'D 款公版獎盃，白、黑、綠三色再生大理石並列', '每一件的石紋，都不一樣', '41% 58%'], items: [
    {id: 'marble', q: '再生大理石是什麼？', a: '將大理石邊料研磨為粉末，再與樹脂結合，重新應用於獎盃、器物與品牌作品。'},
    {id: 'materials', q: '有哪些再生材質可以選？', a: '九種：再生大理石、回收玻璃、退役木橫擔、咖啡渣、水庫淤泥、煤灰、木屑、木頭拼板與焚化粒料。'},
    {id: 'pattern', q: '每件再生石材的紋理都一樣嗎？', a: '不一樣。石紋在灌注時自然流動，每件都獨一無二；手工製作也可能留有細微的模線或研磨痕跡。'},
    {id: 'own-material', q: '想用品牌自己的材質有什麼限制？', a: '需要是乾燥後的顆粒或粉末化狀物料。'}
  ]}
];
// Every question in page order, with its running number: [{n: '01', group, id, q, a, rich}, …].
export const questions = groups.flatMap(g => g.items.map(item => ({...item, group: g.id}))).map((item, i) => ({...item, n: String(i + 1).padStart(2, '0')}));
