// Five groups: the bar links to each landing page; the menu overlay shows every destination on one page.
// Standard (公版) and custom (客製化) trophies are separate groups; deeper filters live on the library pages.
export const navigation=[
 {id:'products',label:'公版獎盃',short:'公版獎盃',en:'Collection',href:'#/explore/standard',match:['#/explore/standard','#/explore/products','#/read/products','#/read/categories'],image:'/assets/catalogue-B.webp',links:[['公版獎盃 A–F','#/explore/standard'],['線上排版工作室','#/preview/B'],['生活設計商品','#/explore/products']]},
 {id:'custom',label:'客製化獎盃',short:'客製化獎盃',en:'Custom',href:'#/read/pages/custom',match:['#/read/pages/custom','#/read/pages/3d-modeling','#/read/pages/faq'],image:'/content/images/61b1b99657d3baca5c.webp',links:[['訂製方式與流程','#/read/pages/custom'],['企業獎盃案例','#/explore/cases?filter=企業獎盃'],['3D 建模與設計','#/read/pages/3d-modeling'],['訂製常見問題','#/read/pages/faq']]},
 {id:'cases',label:'企業與IP案例',short:'合作案例',en:'Works',href:'#/explore/cases',match:['#/explore/cases','#/brands'],image:'/assets/case-ase.webp',links:[['全部合作案例','#/explore/cases'],['IP 授權與聯名','#/explore/cases?filter=IP生活設計'],['品牌禮贈與生活設計','#/explore/cases?filter=生活設計'],['合作品牌牆','#/brands']]},
 {id:'materials',label:'材料與工藝',short:'循環材料',en:'Materials',href:'#/explore/materials',match:['#/explore/materials','#/explore/journal','#/read/pages/material','#/read/pages/glass','#/read/pages/coffee-waste','#/read/pages/wooden-beam','#/read/pages/reservoir-silt','#/read/pages/fly-ash','#/read/pages/wood-','#/read/pages/incineration','#/read/blog','#/read/pages/chanz-studio'],image:'/content/images/4c8f7e6331677eaa2e.webp',links:[['全部循環材料','#/explore/materials'],['再生大理石','#/read/pages/material-recycled-marble'],['工藝與工作室文章','#/explore/journal'],['匠子 CHANZ STUDIO','#/read/pages/chanz-studio']]},
 {id:'about',label:'關於 re.O',short:'關於 re.O',en:'Studio',href:'#/read/pages/about',match:['#/read/pages/about','#/read/pages/awards','#/explore/about','#/read/pages/contact'],image:'/content/images/8adb10dc0ad1b38e8f.webp',links:[['品牌理念與聯絡','#/read/pages/about'],['設計獎項與產業參與','#/read/pages/awards'],['品牌與工藝內容','#/explore/about'],['聯絡與預約','#/read/pages/contact']]}
];
// Retail: the studio's official Pinkoi store (匠子 CHANZ STUDIO). External, opens in a new tab.
export const shopLink=['Pinkoi 線上選購','https://www.pinkoi.com/store/chanzstudio'];
export const supportLinks=[['訂製與服務常見問題','#/read/pages/faq'],['運送說明','#/read/about/delivery-policy'],['退換貨說明','#/read/about/policy']];
export const categoryInfo={
 standard:{label:'公版獎盃',title:'為每份榮耀，找到合適的形狀。',intro:'六款公版設計，結合循環材料與專屬銘版。'},
 products:{label:'生活設計商品',title:'讓設計，走進每一種日常。',intro:'品牌禮贈與生活物件，從材質與使用情境開始挑選。'},
 cases:{label:'企業與IP案例',title:'每件作品，都有它的出發點。',intro:'從企業回收材料、品牌識別，到授權生活設計，閱讀完整的合作故事。'},
 materials:{label:'循環材料',title:'材料的下一站。',intro:'從回收原材的特性出發，探索設計與製造的可能。'},
 journal:{label:'設計與工藝',title:'從試驗，到成形。',intro:'走進工作室，閱讀材料試驗、立體設計與手作製程。'},
 about:{label:'關於 re.O',title:'以設計，延續材料的生命。',intro:'認識或心、匠子，以及作品背後的理念與專業足跡。'},
 support:{label:'服務指南',title:'讓每一步，都更清楚。',intro:'訂製流程、校稿、運送與退換貨，開始合作前的實用資訊。'}
};
export function contentHref(url){try{return '#/read/'+decodeURIComponent(new URL(url,'https://www.re-o.co').pathname.replace(/^\//,''))}catch{return '#/explore/cases'}}
