# re.O 案例後台服務

網站的 `/admin/` 頁面本身不含任何密碼或金鑰。所有會改到網站的動作都經過這個小服務：

1. 管理者在 `/admin/` 用 Google 登入，頁面把 Google 簽發的登入憑證附在每個請求上。
2. 服務驗證憑證的簽章、確認憑證是發給這個網站的、確認信箱在允許名單內。
3. 只允許寫入案例內容（`rules.mjs` 列出的檔案），一次儲存就是 GitHub 上的一個 commit。
4. 網站原本的自動部署流程接手，重新建置並上線（約 3 至 5 分鐘）。

每次儲存都是一個 commit，任何修改都能從歷史紀錄還原。

## 檔案

| 檔案 | 用途 |
|---|---|
| `server.mjs` | 服務本體：Google 登入驗證、讀檔、寫入 commit、查詢上線進度 |
| `rules.mjs` | 允許讀寫哪些檔案、大小上限（本機開發伺服器也用同一份） |
| `dev-plugin.mjs` | 本機 `pnpm dev` 時的後端，直接寫入專案檔案，不需要登入 |
| `Dockerfile` | Cloud Run 用 |

## 設定值

| 名稱 | 內容 |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth 用戶端 ID（網頁應用程式） |
| `ALLOWED_EMAILS` | 可以編輯的 Google 帳號，逗號分隔 |
| `GITHUB_TOKEN` | 只限這一個儲存庫的 fine-grained token：Contents 讀寫、Actions 唯讀 |
| `GITHUB_REPO` | `ecologydavid/reO.website` |
| `GITHUB_BRANCH` | `main`（預設） |
| `ALLOWED_ORIGINS` | 後台頁面的來源，例如 `https://ecologydavid.github.io` |

## 啟用步驟

1. **Google OAuth 用戶端**：Google Cloud Console → API 和服務 → 憑證 → 建立 OAuth 用戶端 ID（網頁應用程式）。
   「已授權的 JavaScript 來源」填網站的來源（`https://ecologydavid.github.io`，之後換正式網域時再加一筆）。
   不需要用戶端密鑰，也不需要重新導向 URI。
2. **GitHub token**：GitHub → Settings → Developer settings → Fine-grained tokens。
   Repository access 只選 `reO.website`；Permissions 選 Contents: Read and write、Actions: Read-only。
3. **部署到 Cloud Run**（在這個資料夾執行；token 放 Secret Manager，不寫在指令裡）：

   ```sh
   printf '%s' "<token>" | gcloud secrets create reo-site-admin-github --data-file=- --project <project>
   gcloud run deploy reo-site-admin --source . --project <project> --region asia-east1 \
     --allow-unauthenticated --max-instances 2 --memory 256Mi \
     --set-env-vars "GOOGLE_CLIENT_ID=<client id>,ALLOWED_EMAILS=<email>,GITHUB_REPO=ecologydavid/reO.website,ALLOWED_ORIGINS=https://ecologydavid.github.io" \
     --set-secrets "GITHUB_TOKEN=reo-site-admin-github:latest"
   ```

   `--allow-unauthenticated` 指的是 Cloud Run 這一層不擋；登入檢查在服務自己裡面（每個請求都驗證 Google 憑證）。
4. **告訴網站服務在哪裡**：把 Cloud Run 給的網址和用戶端 ID 填進 `src/admin/config.js`，推上線。

## 換正式網域時

- OAuth 用戶端的「已授權的 JavaScript 來源」加上新網域。
- `ALLOWED_ORIGINS` 加上新網域（`gcloud run services update reo-site-admin --update-env-vars ...`）。

## 停用

把 `src/admin/config.js` 的兩個值清空並上線，`/admin/` 就會顯示「後台尚未啟用」。
要立刻擋掉所有寫入，刪除 Cloud Run 服務或撤銷 GitHub token 即可。
