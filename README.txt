re.O 循環設計網站樣例

入口：首頁 /，編輯器 /#/preview/B（A–F 可切換）。
React + Vite；所有排版在瀏覽器本機處理，沒有訂單或付款後端。
正式官網尚未替換。本專案的 Sites 身分記錄於 .openai/hosting.json。

已包含
- 首頁、公版 A–F 型錄、材料故事、公司特色與聯絡方式。
- 六型號與各自客製面；A/D/E 雙區、B/C 單區、F 三種輪廓。
- 多文字框、黑體/明體、字級、粗體、對齊、顏色、旋轉。
- PNG/JPG/WebP 圖案、拖曳、縮放、複製/刪除、圖層順序。
- 銘版特寫、方向鍵移動、復原/重做、瀏覽器草稿。
- PDF 產品整體預覽 + 各銘版特寫；超出範圍會提示並停用匯出。

資料來源與限制
- 官網研究資料在上層 research/。
- 產品照片及官方紅色客製範圍線稿保存於 public/assets/。
- F 款使用 ImageGen 移除原範例字樣的底圖，保留外形與裝飾；
  原始照片與官方線稿同時保留，供後續校準。
- src/data/geometry.js 為依照片與線稿建立的視覺定位。
  未取得製作原檔，因此不可用於加工、公差或毫米尺寸保證。
- 樣例每型號先採一張實際照片；尚未開放全部材質/顏色變體。
- PDF 是預覽確認稿，以圖像保持中文字與畫面一致，不是向量製作稿。
- 草稿僅存於當前瀏覽器。圖案不會傳送至公司或第三方。

設計
design/hero.png、collection.png、materials.png、editor.png 為 ImageGen 概念。
design/DESIGN.txt 為色彩、字級、間距、文案及有意差異的紀錄。
實作維持暖白/石墨黑/橄欖綠、開放式產品型錄及三欄編輯器。
保留真實商品名稱與官網照片，不沿用概念圖自行命名的 A–D 名稱。

開發指令
pnpm install
pnpm dev
pnpm test
pnpm build

Windows 隨附執行環境無全域 npm 時，可直接執行 bundled pnpm.mjs。
依賴安裝的 esbuild 執行權限已明確列於 pnpm-workspace.yaml。
