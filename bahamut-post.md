# 【JS腳本】PTT網頁版 自動顯示圖片

## 安裝流程
### step 1：安裝Tampermonkey
從[官網](https://www.tampermonkey.net/)找安裝
或是[Chrome商店](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)安裝
（請務必使用Tampermonkey，其他腳本管理軟體未經測試不保證能執行。）

### step 2：安裝腳本
點擊 https://greasyfork.org/zh-TW/scripts/604628
點安裝腳本 > 安裝

### step3（Chrome使用者）
在網址列輸入chrome://extensions/後按enter，將右上角的開發人員模式打開。
![開發人員模式](https://i.imgur.com/8BLuyO2.png)

---

## 功能敘述
讓PTT網頁版（pttweb.cc）自動顯示原本只會顯示成連結的圖片：
帶參數的推特圖片（pbs.twimg.com/media/...?format=jpg&name=orig）會直接顯示
imgur單張圖片頁（imgur.com/xxxxx）會直接顯示
任何網址以 .jpg / .png / .gif / .webp 結尾的圖片，就算後面帶參數也會顯示
文章內文跟推文都適用

另外也會修復被圖床擋外連的圖片
像是 i.verb.tw 的圖片在pttweb上常常只剩一片空白，裝了之後就能正常顯示

---

## 為什麼有些圖片不會顯示
pttweb只會把「網址以圖片副檔名結尾」的連結轉成圖片，所以帶參數的推特圖片只會顯示成連結。

至於 i.verb.tw 則是有防盜連，只允許從 ptt.cc 嵌入圖片，從pttweb嵌入就會被擋。
不過它沒有擋另一種讀取方式，所以腳本會在圖片載入失敗時改用那種方式重新抓圖。

---

## 後記
歡迎裝我寫的其他腳本
[小屋](https://home.gamer.com.tw/profile/index_creation.php?owner=nathan60107&folder=425332)
https://greasyfork.org/zh-TW/users/223141-貝果
