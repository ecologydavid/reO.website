網站部署說明
==========

GitHub Actions 從 main 測試並建置官網，將靜態檔案發佈至 cloudflare-dist。Cloudflare Pages 使用此分支的根目錄。先驗收 pages.dev，再於 Pages 加入 www.re-o.co，將 GoDaddy 的 www CNAME 指向專案的 pages.dev 網址。裸網域以 HTTPS 轉址至 www。保留郵件 DNS 記錄。

## GA4 與台灣訪客

- GA4 資源「re.O觀測」使用台灣時區及新台幣。網站串流「re.O 官網」對應 https://www.re-o.co，評估 ID 為 G-7Y9HMHX23V。部署流程已帶入此公開 ID，可用 GitHub Actions repository variable GA_MEASUREMENT_ID 覆寫。
- 串流的加強型評估需關閉瀏覽器記錄變更的自動網頁瀏覽計數，避免和站內 page_view 重複。若只需要此次量測，可關閉整個加強型評估。GA4 本身會計算網頁位於前景的參與時間。
- 報表使用「網頁和畫面」與「平均參與時間」。站內連結點擊為 internal_link_click，目的路徑為 link_path；滾動深度為 scroll_depth，每頁每次造訪最多依序回報 25、50、75、90。將 link_path 與 percent_scrolled 設為事件範圍自訂維度以便探索。以即時報表或 Tag Assistant 驗證首次進站、站內換頁、返回、頁面滾動及切換到背景。
- 上線前在隱私告知說明 GA4 的使用目的、Cookie、資料保留期限及聯絡方式，依實際服務對象評估同意機制。網站送出的自訂點擊僅含路徑，不含銘版內容、輸入資料、搜尋字串或網址片段。
- 在 Search Console/Core Web Vitals 與 PageSpeed Insights 查看行動版。流量足夠後，以第 75 百分位 LCP ≤ 2.5 秒、INP ≤ 200 毫秒、CLS ≤ 0.1 為驗收目標。GA4 報表另以國家/地區「台灣」與裝置類別分組觀察。
