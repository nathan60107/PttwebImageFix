讓 PTT 網頁版（pttweb.cc）自動顯示原本只會顯示成連結的圖片，並修復被圖床擋外連而顯示不出來的圖片。

## 使用方式
安裝腳本後，打開 pttweb.cc 的任一篇文章即可，不需要任何設定。

## 功能
- **自動顯示沒被展開的圖片連結**（文章內文與推文都適用）：
  - Twitter / X 圖片：`pbs.twimg.com/media/...`，包含帶 `?format=jpg&name=orig` 參數的網址。
  - imgur 單張圖片頁：`imgur.com/ID` 會轉成圖片顯示（相簿不處理）。
  - 任何網域：網址以 `.jpg`、`.png`、`.gif`、`.webp` 等圖片副檔名結尾的連結，即使後面帶有參數也會顯示。
- **修復被擋外連的圖片**：部分圖床（例如 `i.verb.tw`）會擋掉從 pttweb 嵌入的圖片，腳本會在圖片載入失敗時改用其他方式重新取得並顯示。
- pttweb 已經顯示的圖片不會重複顯示；在站內切換文章也會持續生效。

## 自訂
若某個網域的圖片連結沒有副檔名、但其實是圖片，可以在腳本開頭的 `EXTRA_IMAGE_HOSTS` 陣列加入該網域，例如 `['img.example.com']`。

## 注意事項
- **無法取得的圖片會維持連結**：圖片重新取得也失敗時，會保留原本的連結，不會顯示破圖。
- **網站改版可能失效**：本腳本依賴 pttweb 的頁面結構，網站改版或圖床調整防盜連規則後可能失效，遇到問題歡迎回報。

## 原始碼與問題回報
- GitHub：https://github.com/nathan60107/PttwebImageFix
- 問題回報：https://github.com/nathan60107/PttwebImageFix/issues
