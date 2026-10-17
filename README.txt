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

直接雙擊的本機 HTML 預覽（2026-10-17）
專案上層的 reO-本機預覽.html 為完整單檔離線版本，可用 Chrome 或 Edge 開啟。
程式、樣式、全部圖片與144筆內容均已內嵌，無需 Node、Vite 或網路連線。
保留站內導覽、搜尋、品牌牆、A–F 編輯、3D、圖案上傳、草稿及 PDF 匯出。
檔案約135 MB，草稿只存於開啟這個檔案的瀏覽器，與 localhost 草稿分開。
此檔為匯出時的快照；網站修改後執行 pnpm build:offline 重新產生。
匯出器為 scripts/build-offline-preview.mjs；只調整匯出版本的路徑與資料載入，
不修改正式網站的編輯器、幾何、樣式或資料，也不影響線上部署。

Windows 隨附執行環境無全域 npm 時，可直接執行 bundled pnpm.mjs。
依賴安裝的 esbuild 執行權限已明確列於 pnpm-workspace.yaml。

2026-10-16 視覺改版：首頁採 Panasonic Archi Design 參考的冷灰、輕黑體、留白與大幅實拍照片。正式 logo 為官網原圖。新版規格與概念位於 design/DESIGN-V2.txt 及 *-v2.png。編輯器維持既有設計；核心保留要求已記錄於 AGENTS.md。修正復原/重做的快照擷取時機，避免重做遺失圖層。
