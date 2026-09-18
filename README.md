# 甘特圖排程系統 (Gantt Chart Scheduler)

具備專案分列呈現、正常工時（08:00 - 18:00）與加班時段（18:00 - 22:00）、30 分鐘微調吸附的現代化甘特圖排程 Web 應用程式。

---

## 🚀 部署至 Render 步驟指南

本專案為高效能的 **Vite + React SPA 應用程式**，部署到 [Render](https://render.com) 建議使用 **Static Site (靜態網站)** 方案，**完全免費、具備全球 CDN 加速且無伺服器休眠等待問題**。

### 步驟 1：匯出專案程式碼
1. 在 Google AI Studio 右上角點擊選單，選擇 **Export to GitHub**（推送到你的 GitHub 儲存庫）或 **Download ZIP**。
2. 若下載 ZIP，解壓縮後將專案推送（git push）至你的 GitHub / GitLab 帳號中。

---

### 步驟 2：在 Render 建立服務（兩種方式任選其一）

#### 方式 A：透過 Render Blueprint 自動建立（最推薦，1 鍵完成）
專案根目錄已內建 `render.yaml` 設定檔：
1. 登入 [Render Dashboard](https://dashboard.render.com/)。
2. 點擊右上角 **New +** ➔ 選擇 **Blueprint**。
3. 連結剛剛匯出的 GitHub 儲存庫。
4. Render 會自動讀取 `render.yaml`，直接點擊 **Apply** 即可自動完成建置並上線！

---

#### 方式 B：手動建立 Static Site
1. 登入 [Render Dashboard](https://dashboard.render.com/)。
2. 點擊右上角 **New +** ➔ 選擇 **Static Site**。
3. 連接含有本專案程式碼的 GitHub 儲存庫。
4. 填寫部署設定參數：
   - **Name**: `gantt-chart-scheduler`（或自訂名稱）
   - **Branch**: `main`
   - **Root Directory**: （留空即可）
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`
5. 設定 SPA 路由重新導向（Redirects/Rewrites）：
   - 在專案頁面點擊 **Redirects/Rewrites** ➔ **Add Rule**
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. 點擊 **Create Static Site**，等待約 1 分鐘即可取得專屬公開網址（例如 `https://gantt-chart-scheduler.onrender.com`）！

---

## 🛠 本地開發指令

```bash
# 安裝相依套件
npm install

# 啟動本地開發伺服器
npm run dev

# 專案建置打包
npm run build
```
