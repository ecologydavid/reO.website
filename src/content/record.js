// 「設計講座與產業報導」 on the About page: awards, industry roles, exhibitions, talks and press in one
// record, shown newest first. To add an item, append one object here; nothing else needs to change.
//   kind   one of `kinds` below (it also feeds the filter chips and their counts)
//   sort   the latest year the item covers (2024／2025 → 2025, "2020 起" → 2020; 0 = date unknown, listed last)
//   year   the year as shown; omit when unknown
//   outlet the organiser, outlet or award (may be empty), title the item itself, line one optional sentence
//   href   the source page (opens in a new tab); only add press with a checked source
//   img    an id under /content/images, or src a full path; w/h its size; pos an optional object-position
//   generic true when the photo is a re.O event or studio photo standing in for the item, not taken at it
//          (the print then says 示意照片)
// Sources: press titles and dates were checked against each linked page (2026-11-05); awards, roles,
// exhibitions and talks follow the migrated 設計獎項 and 匠子 CHANZ STUDIO 「展覽、課程與分享」 pages.
// Photos are re.O's own or broadcast stills the studio already published; never copy from outlets.
export const kinds=['設計獲獎','產業參與','展覽活動','講座課程','媒體報導'];
const talk={img:'f65edf6278bdfbe0f3',w:1440,h:960,alt:'re.O 設計師於講座台上分享',generic:true};
const talkRoom={img:'43162f7130e236511a',w:1440,h:960,alt:'講座現場，投影匠子 CHANZ STUDIO 簡報',generic:true};
const stage={img:'5bb3ecaa6297b8d143',w:1440,h:960,alt:'re.O 設計師於台上介紹再生材質作品',generic:true};
const course={img:'1e76631ad33b0e37de',w:1440,h:960,alt:'體驗課學員合影',generic:true};
const booth={img:'81b531ab83c6d4d03d',w:1440,h:960,alt:'re.O 展位陳列再生大理石作品',generic:true};
const booth2={img:'3f79e8aa9566350803',w:960,h:640,alt:'展場陳列的再生材質作品',generic:true};
const exhibit={img:'4b1fa35a3b39da694e',w:1440,h:960,alt:'展覽中的再生材質作品陳列',generic:true};
const exhibit2={img:'f1fd1f15fcaa19f284',w:1440,h:960,alt:'展覽現場的再生材質展品',generic:true};
const market={img:'6c2db28be50ffccac4',w:810,h:540,alt:'市集展位上的再生大理石商品',generic:true};
export const record=[
 {kind:'產業參與',sort:2026,year:'2026',outlet:'台灣設計研究院',title:'IDDI 設計驅動產業創新',img:'9b745fd07fe62bf79c',w:1440,h:960,alt:'re.O 再生材質樣品與作品陳列'},
 {kind:'講座課程',sort:2026,year:'2026',outlet:'TISDC',title:'校園循環經濟講座：國立臺灣藝術大學',...talk},
 {kind:'展覽活動',sort:2026,year:'2026',outlet:'桃園設計庫特展',title:'永續串造',...exhibit},
 {kind:'展覽活動',sort:2026,year:'2026',outlet:'台北好購',title:'三創頒獎典禮',...booth2},
 {kind:'產業參與',sort:2025,year:'2024／2025',outlet:'台北市工業發展協會',title:'理事當選',img:'3db017044951b51110',w:1440,h:833,alt:'石材碎料沿輸送帶送往加工'},
 {kind:'講座課程',sort:2025,year:'2025',outlet:'APPLE',title:'永續設計分享會',...stage},
 {kind:'展覽活動',sort:2025,year:'2025',outlet:'香港理工大學',title:'校內展',...exhibit2},
 {kind:'展覽活動',sort:2025,year:'2025',outlet:'新北市循環設計展',title:'異百貨',...exhibit},
 {kind:'講座課程',sort:2025,year:'2025',outlet:'TISDC',title:'校園推廣暨循環經濟講座',...talkRoom},
 {kind:'展覽活動',sort:2025,year:'2025',outlet:'Pinkoi',title:'瘋設祭',...market},
 {kind:'設計獲獎',sort:2024,year:'2024',outlet:'台北市亮點企業',title:'潛力企業獎',img:'f0a876f5e7a9ec0fe9',w:1440,h:960,alt:'台北市亮點企業潛力企業獎頒獎，或心國際設計有限公司'},
 {kind:'展覽活動',sort:2024,year:'2024',outlet:'',title:'新北設計週',...booth},
 {kind:'媒體報導',sort:2023,year:'2023',outlet:'alive 商業周刊',title:'四大工藝家為 Restaurant A 創作有故事的食器',line:'與設計師許向罕以永續大理石，為香檳吧設計餐盤。',href:'https://alive.businessweekly.com.tw/single/Index/ARTL006002367',img:'e39512226aa1eb8e1c',w:1440,h:720,pos:'0 50%',alt:'Restaurant A 香檳區地貌餐盤，以再生大理石製作'},
 {kind:'展覽活動',sort:2023,year:'2023',outlet:'台灣設計展',title:'設計 × 料理 × 製造',img:'e39512226aa1eb8e1c',w:1440,h:720,pos:'0 50%',alt:'Restaurant A 香檳區地貌餐盤，以再生大理石製作',generic:true},
 {kind:'媒體報導',sort:2021,year:'2021',outlet:'SHOPLINE',title:'給大理石廢料重生的機會，也創造自己人生的機會',line:'創辦人專訪：從大理石廢料走出自己的品牌。',href:'https://stories.shopline.tw/chanzstudio-interview/',img:'20c3cb403bd92efa80',w:1440,h:1080,alt:'大理石邊角料研磨成粉的材質研發'},
 {kind:'媒體報導',sort:2020,year:'2020',outlet:'自由時報',title:'消費控・友愛地球｜匠子 CHANZ STUDIO 建材再生',line:'大理石、煤灰、紙漿、紅磚的再生應用。',href:'https://ent.ltn.com.tw/news/paper/1413645/',img:'790b5fdc0f89df0d7f',w:1440,h:1080,alt:'煤灰原材料'},
 {kind:'媒體報導',sort:2020,year:'2020',outlet:'La vie',title:'岩石蠟燭、大理石萬用筒！5 款台灣設計的再生居家配件',line:'推薦台灣再生設計品牌。',src:'/assets/press-lavie-coasters.webp',w:1080,h:1080,alt:'再生大理石杯墊與燭台，黑、白、粉三色'},
 {kind:'產業參與',sort:2020,year:'2020 起',outlet:'社會創新平台',title:'或心國際設計有限公司',line:'以設計整合廢棄物回收與品牌商品，如咖啡渣店內餐盤。',href:'https://si.taiwan.gov.tw/Home/Org?Fid=646',src:'/assets/press-si-material-cubes.webp',w:1067,h:1600,alt:'各種再生材質試片方塊，附金屬名牌'},
 {kind:'展覽活動',sort:2020,year:'2020',outlet:'',title:'後工_生活',...exhibit2},
 {kind:'設計獲獎',sort:2019,year:'2019',outlet:'金點設計獎',title:'摺紙花器花瓶組',img:'5239c1559eb6e8363c',w:1440,h:1080,alt:'再生大理石摺紙花器，插著乾燥花枝'},
 {kind:'設計獲獎',sort:2019,year:'2019',outlet:'千里馬創業競賽',title:'文創設計銀獎',img:'2c1d4b9ce66ee5b79a',w:1440,h:960,alt:'匠子 CHANZ STUDIO 品牌展示空間',generic:true},
 {kind:'展覽活動',sort:2019,year:'2019',outlet:'',title:'NY NOW',...booth2},
 {kind:'講座課程',sort:2019,year:'2019',outlet:'台電',title:'體驗課程',...course},
 {kind:'講座課程',sort:2019,year:'2019',outlet:'Pinkoi',title:'體驗課',...course},
 {kind:'媒體報導',sort:2019,year:'2019',outlet:'東森新聞',title:'復刻天然石紋 環保藝術「再生」商機',line:'網路平台興起的設計師。',href:'https://news.ebc.net.tw/News/living/173159',img:'4d583523776e0af614',w:1440,h:720,alt:'東森新聞報導畫面，設計師李東陽於工作室'},
 {kind:'媒體報導',sort:2019,year:'2019',outlet:'The Femin',title:'沉穩石紋堆砌出的一方天地',line:'台灣品牌 Chanz studio 以再生大理石塑造創意家飾。',href:'https://thefemin.com/2019/01/chanz-studio-brand/',src:'/assets/press-femin-desk.webp',w:770,h:461,alt:'匠子 CHANZ studio 再生大理石文具收納'},
 {kind:'設計獲獎',sort:2018,year:'2018',outlet:'金點設計獎',title:'積木文具收納組',img:'6b4b9c911d975c8a87',w:1080,h:1440,pos:'50% 72%',alt:'金點獎得獎商品，摺紙花器與積木文具組'},
 {kind:'講座課程',sort:2018,year:'2018',outlet:'GQ × Pinkoi',title:'BUSINESS FORUM 設計場：看台灣設計如何走向國際市場',line:'與 Pinkoi、Alto 分享設計品牌的海外經營。',href:'https://www.accupass.com/event/1811131015405616959940',img:'8adb10dc0ad1b38e8f',w:1440,h:960,alt:'職人手中灑落的再生材料粉末',generic:true},
 {kind:'展覽活動',sort:2017,year:'2017',outlet:'',title:'泰國清邁',...booth},
 {kind:'講座課程',sort:2017,year:'2017',outlet:'小賣所',title:'通路分享',...talkRoom},
 // Broadcasts whose air dates are not on record close the list.
 {kind:'媒體報導',sort:0,outlet:'三立 iNEWS',title:'邊角料獲新生 再生大理石打造循環經濟',line:'將再生大理石打造循環設計。',img:'7b8d09cc95edd385ae',w:1440,h:720,alt:'三立 iNEWS 報導畫面'},
 {kind:'媒體報導',sort:0,outlet:'TVBS',title:'以再生大理石為材質的居家擺件',img:'5f8549a5155d8ad5a8',w:870,h:435,alt:'TVBS 報導畫面，設計師於工作室製作'}
].sort((x,y)=>y.sort-x.sort);
