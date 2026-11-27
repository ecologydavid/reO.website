// The photographs placed in a material page's reading part (MaterialBody.jsx), keyed by page slug. v1.14.0.
//   lead   the large photograph beside 「re.O 的＿＿」
//   side   one or two photographs in the left column of 背景知識
//   more   further photographs, shown as rows under 現場紀錄 (only when there are at least two)
// /assets/materials/beam-*, ash-*, glass-* are the owner's own photographs from 東陽整理照片\物料照片 (2026-11-28;
// the folder 百分料處理 is not to be used, by his word). Their captions repeat his file names. The others are the
// photographs already on each material page. A caption is given only where the owner named the picture.
// No imports: tests read this file in Node.
const own = (name, width, height, alt, caption) => ({src: `/assets/materials/${name}.webp`, width, height, alt, caption});
const page = (id, width, height, alt) => ({src: `/content/images/${id}.webp`, width, height, alt});
export const photos = {
  'material-recycled-marble': {
    lead: page('55069d17278e6fd5db', 1440, 961, 're.O 再生大理石：澆注後留在量杯裡的石粉與樹脂'),
    side: [page('dd08e1c8414dba6629', 1224, 816, '研磨後的大理石石粉'), page('93fb871a34fb837085', 1440, 833, '石材破碎與輸送設備')],
    more: []
  },
  glass: {
    lead: own('glass-cart', 1478, 1108, 're.O 回收玻璃：玻璃工廠推車上的瑕疵玻璃', '廠內瑕疵玻璃'),
    side: [own('glass-bins', 1108, 1478, '玻璃工廠熔爐前，鐵槽裡的瑕疵玻璃', '廠內瑕疵玻璃')],
    more: [page('9de705797f36f027b9', 1440, 929, '玻璃工廠的師傅在熔爐前作業'), page('ed151728d63092f9da', 942, 628, '回收後的碎玻璃')]
  },
  'wooden-beam': {
    lead: own('beam-yard', 1800, 1225, 're.O 退役木橫擔：料廠裡成堆的退役木橫擔', '木橫擔料廠'),
    side: [own('beam-holes', 1108, 1478, '切成小塊並鑽好定位黏著孔的木橫擔', '定位黏著孔')],
    more: [
      own('beam-pick', 1108, 1478, '設計師在料廠挑選木橫擔', '設計師在料廠親自挑選'),
      own('beam-stack', 800, 600, '料廠裡堆疊的木橫擔斷面', '木橫擔料廠'),
      own('beam-endgrain', 555, 800, '手上拿著的一截木橫擔斷面', '木橫擔的斷面'),
      own('beam-cut', 600, 800, '工作室裡切斷木橫擔的機具', '木橫擔切斷'),
      own('beam-blocks', 800, 550, '切好的木橫擔木塊', '木橫擔加工'),
      own('beam-bolts', 800, 567, '留有鎖孔的整捆木橫擔', '鎖孔'),
      own('beam-pole', 623, 800, '電線杆上一層層的木橫擔', '電線杆')
    ]
  },
  'coffee-waste': {
    lead: page('9f6d2c1c1474c54714', 1350, 902, '手搖磨豆機裡的咖啡豆'),
    side: [page('da8bdb2127870624a0', 625, 625, '麻布袋與木勺裡的咖啡豆')],
    more: []
  },
  'reservoir-silt': {
    lead: page('dbd6896f293b6fb7a0', 1024, 768, '水庫清淤工程現場的怪手與淤泥'),
    side: [page('a935cf58cdedc5e2b5', 744, 744, '乾裂的淤泥與樂土 Lotos 標誌'), page('b70bbb40c38be684b4', 577, 577, '水庫淤泥的流紋')],
    more: []
  },
  'fly-ash': {
    lead: own('ash-scoop', 1800, 1800, 're.O 煤灰：從槽口舀起的煤灰', '舀起的煤灰'),
    side: [own('ash-truck', 1350, 1800, '在火力發電廠爬上槽車收集煤灰', '到火力發電廠收集煤灰')],
    more: [page('1859b5347b5ee8513e', 1440, 959, '火力發電廠與輸電鐵塔'), page('d3e456d41ddb26460f', 900, 506, '煤灰堆置場')]
  },
  'wood-chips': {
    lead: page('4bab04d17546dee5b8', 1440, 960, '木工工作檯上的機具與木屑'),
    side: [page('0ba429f3992a747e1c', 894, 894, '切削後的木片'), page('0e8472eafbf7887ed0', 1023, 681, '木勺裡的刨花')],
    more: []
  },
  'wood-veneer-panel': {
    lead: page('32155704f91a6ccadf', 1440, 958, '並排的木板'),
    side: [page('06d4f714802532ecb6', 1440, 1440, '短小的木材邊料'), page('309bda204528807f50', 1280, 1037, '堆放的原木')],
    more: []
  },
  'incineration-aggergates': {
    lead: page('9dd02c1e4bb52d0944', 1024, 577, '焚化廠的垃圾貯坑'),
    side: [page('f678216f2e5eb60237', 852, 852, '手中的焚化再生粒料'), page('4404f3442a17cf302b', 720, 480, '廠房內堆置的焚化再生粒料')],
    more: []
  }
};
