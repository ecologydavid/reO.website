export const navigation=[
 {id:'products',label:'公版與訂製',intro:'從公版排版，到專屬造型開發。',links:[['公版獎盃 A–F','#/explore/standard'],['全部設計商品','#/explore/products'],['客製設計服務','#/read/pages/custom'],['3D 建模與設計','#/read/pages/3d-modeling']]},
 {id:'cases',label:'企業與IP案例',intro:'從品牌故事，走進作品細節。',links:[['全部合作案例','#/explore/cases'],['企業獎盃','#/explore/cases?filter=企業獎盃'],['品牌禮贈與生活設計','#/explore/cases?filter=生活設計'],['合作品牌牆','#/brands']]},
 {id:'materials',label:'循環材料',intro:'從回收原材的特性，探索設計的可能。',links:[['全部循環材料','#/explore/materials'],['再生大理石','#/read/pages/material-recycled-marble'],['回收玻璃與咖啡渣','#/explore/materials?filter=生活回收'],['再生木材','#/explore/materials?filter=木材與纖維'],['產業副產物','#/explore/materials?filter=產業副產物']]},
 {id:'journal',label:'設計與工藝',intro:'材料試驗、設計開發與職人日常。',links:[['工藝與工作室文章','#/explore/journal'],['材料研發','#/read/pages/material-recycled-marble'],['設計建模','#/read/pages/3d-modeling'],['匠子 CHANZ STUDIO','#/read/pages/chanz-studio']]},
 {id:'about',label:'關於 re.O',intro:'讓被忽略的材料，重新進入生活。',links:[['品牌理念','#/read/pages/about'],['設計獎項與產業參與','#/read/pages/awards'],['品牌與工藝內容','#/explore/about'],['聯絡與預約','#/read/pages/contact']]},
 {id:'support',label:'服務指南',intro:'從訂製、校稿到收件，了解每一步。',links:[['訂製與服務常見問題','#/read/pages/faq'],['訂製流程','#/read/pages/custom'],['運送說明','#/read/about/delivery-policy'],['退換貨說明','#/read/about/policy']]}
];
export const categoryInfo={
 standard:{label:'公版系列',title:'為每份榮耀，找到合適的形狀。',intro:'六款公版設計，結合循環材料與專屬銘版。'},
 products:{label:'公版與訂製',title:'讓設計，走進每一種日常。',intro:'公版獎盃、品牌禮贈與生活物件，從材質與使用情境開始挑選。'},
 cases:{label:'企業與IP案例',title:'每件作品，都有它的出發點。',intro:'從企業回收材料、品牌識別，到授權生活設計，閱讀完整的合作故事。'},
 materials:{label:'循環材料',title:'材料的下一站。',intro:'從回收原材的特性出發，探索設計與製造的可能。'},
 journal:{label:'設計與工藝',title:'從試驗，到成形。',intro:'走進工作室，閱讀材料試驗、立體設計與手作製程。'},
 about:{label:'關於 re.O',title:'以設計，延續材料的生命。',intro:'認識或心、匠子，以及作品背後的理念與專業足跡。'},
 support:{label:'服務指南',title:'讓每一步，都更清楚。',intro:'訂製流程、校稿、運送與退換貨，開始合作前的實用資訊。'}
};
export function contentHref(url){try{return '#/read/'+decodeURIComponent(new URL(url,'https://www.re-o.co').pathname.replace(/^\//,''))}catch{return '#/explore/cases'}}
