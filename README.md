# PTT網頁版 自動顯示圖片

讓 PTT 網頁版（`https://www.pttweb.cc`）自動顯示原本只會顯示成連結的圖片，並修復被圖床擋外連而顯示不出來的圖片。本專案為 userscript，主要原始碼為本 repo 的 `PttwebImageFix.user.js`。

**功能**
- 自動顯示 pttweb 原本不會展開的圖片連結，文章內文與推文都適用：
  - **Twitter / X 圖片：** `pbs.twimg.com/media/...`，包含帶 `?format=jpg&name=orig` 參數的網址。
  - **imgur 單張圖片頁：** `imgur.com/ID` 會轉成 `i.imgur.com/ID.jpg` 顯示（相簿 `/a/`、`/gallery/` 不處理）。
  - **任何網域：** 網址路徑以 `.jpg`、`.png`、`.gif`、`.webp`、`.avif`、`.bmp` 結尾的連結，即使後面帶有 `?` 參數也會顯示。
- 修復被圖床擋外連的圖片（例如 `i.verb.tw`）：圖片載入失敗時，改用 `fetch` 取得圖片後再顯示。pttweb 原本就有產生的圖片也適用。
- pttweb 已經顯示的圖片不會重複顯示；在站內切換文章也會持續生效。

**為什麼有些圖片不會顯示**
- **沒有展開：** pttweb 只會把「網址以圖片副檔名結尾」的連結轉成圖片，像 `pbs.twimg.com/media/XXXX?format=jpg&name=orig` 這種帶參數的網址就只會顯示成連結。
- **被擋外連：** 部分圖床會依 `Referer` 判斷是否允許嵌入圖片。以 `i.verb.tw` 為例，只有從 `ptt.cc` 嵌入的圖片能正常載入，從 pttweb 嵌入（不論有沒有送 `Referer`）都會回傳 503。不過它沒有限制 `fetch` 請求，所以腳本可以改用 `fetch` 取得圖片。

**自訂**
- 若某個網域的圖片連結沒有副檔名、但其實是圖片，可以把網域加到 `PttwebImageFix.user.js` 開頭的 `EXTRA_IMAGE_HOSTS` 陣列，例如 `['img.example.com']`，該網域（含子網域）的連結都會嘗試顯示成圖片。

**注意事項**
- 圖片載入失敗、改用 `fetch` 也失敗時，腳本自己加入的圖片會移除，只保留原本的連結。
- 若圖床之後連 `fetch` 也一起擋下，被擋的圖片會維持原本的連結，無法顯示。
- 本腳本依賴 pttweb 的頁面結構（`.e7-richcontent`、`a.externalHref`、`a.externalHrefRecommend` 等），網站改版後可能失效。

**快速開發流程（Chrome + Tampermonkey）**
1. 確認腳本原始碼為本 repo 的 `PttwebImageFix.user.js`（Windows 範例路徑：`C:\path\to\PttwebImageFix\PttwebImageFix.user.js`）。
2. 開啟 Chrome，若尚未安裝 Tampermonkey 請先安裝。
3. 允許 Tampermonkey 存取本機檔案：開啟 `chrome://extensions/`，找到 Tampermonkey，點選「詳細資料」，開啟「允許存取檔案網址」。
4. 在 Tampermonkey 新增腳本（控制台 → 新增腳本），貼上下方的 header，並將 `@require` 的本機路徑改為你自己的絕對路徑。
5. 儲存腳本。由於 `@require` 指向 `file:///` 網址，每次載入目標頁面時 Tampermonkey 都會從磁碟讀取 `PttwebImageFix.user.js`，因此在外部修改檔案後重新整理 pttweb 頁面即可看到變更。

**Userscript header（貼到 Tampermonkey，並將 `file:///...` 改為你自己的絕對路徑）**

```js
// ==UserScript==
// @name         PTT網頁版 自動顯示圖片
// @description  讓 pttweb.cc 自動顯示原本不會被展開的圖片連結（如帶參數的 pbs.twimg.com、imgur 短網址），並修復被圖床擋外連的圖片（如 i.verb.tw）
// @namespace    nathan60107
// @version      0.0.0
// @author       nathan60107(貝果)
// @match        https://www.pttweb.cc/*
// @icon         https://www.pttweb.cc/favicon.ico
// @grant        none
// @run-at       document-idle
// @noframes
// @require      file:///C:/path/to/PttwebImageFix/PttwebImageFix.user.js
// ==/UserScript==
```
