// ==UserScript==
// @name         PTT網頁版 自動顯示圖片
// @description  讓 pttweb.cc 自動顯示原本不會被展開的圖片連結（如帶參數的 pbs.twimg.com、imgur 短網址），並修復被圖床擋外連的圖片（如 i.verb.tw）
// @namespace    nathan60107
// @version      1.0
// @author       nathan60107(貝果)
// @match        https://www.pttweb.cc/*
// @icon         https://www.pttweb.cc/favicon.ico
// @grant        none
// @run-at       document-idle
// @noframes
// @license      MIT
// @supportURL   https://github.com/nathan60107/PttwebImageFix/issues
// ==/UserScript==

(function () {
  'use strict';

  // 想額外強制當成圖片的網域（連結沒有副檔名也會嘗試顯示），例如 'img.example.com'
  const EXTRA_IMAGE_HOSTS = [];

  const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp)$/i;
  const MARK = 'pwiSrc'; // dataset key on our inserted wrappers

  /** 把連結轉成可直接顯示的圖片網址；不是圖片就回傳 null */
  function toImageUrl(href) {
    let u;
    try { u = new URL(href); } catch { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.toLowerCase();
    const path = u.pathname;

    // Twitter/X 圖片：pbs.twimg.com/media/ID?format=jpg&name=orig
    if (host === 'pbs.twimg.com' && path.startsWith('/media/')) {
      if (IMAGE_EXT.test(path)) return u.href;
      if (!u.searchParams.has('format')) u.searchParams.set('format', 'jpg');
      if (!u.searchParams.has('name')) u.searchParams.set('name', 'large');
      return u.href;
    }

    // imgur 單張圖片頁：imgur.com/ID → i.imgur.com/ID.jpg（相簿 /a/、/gallery/ 不處理）
    if ((host === 'imgur.com' || host === 'i.imgur.com' || host === 'm.imgur.com')) {
      const m = path.match(/^\/([A-Za-z0-9]{5,8})(\.[a-z0-9]+)?$/);
      if (m) return `https://i.imgur.com/${m[1]}${m[2] && IMAGE_EXT.test(m[2]) ? m[2] : '.jpg'}`;
      return null;
    }

    // 任何網域：路徑以圖片副檔名結尾（含帶 query string 的情況）
    if (IMAGE_EXT.test(path)) return u.href;

    if (EXTRA_IMAGE_HOSTS.some(h => host === h || host.endsWith('.' + h))) return u.href;

    return null;
  }

  /** 用「網域 + 檔名(不含副檔名)」判斷 pttweb 是否已經顯示過同一張圖 */
  function imageKey(src) {
    try {
      const u = new URL(src, location.href);
      const host = u.hostname.replace(/^(i|m)\.imgur\.com$/, 'imgur.com');
      return host + u.pathname.replace(/\.[a-z0-9]+$/i, '');
    } catch { return src; }
  }

  function makeImage(src, href) {
    const wrap = document.createElement('div');
    wrap.className = 'e7-richcontent my-2';
    wrap.dataset[MARK] = href;
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.style.maxWidth = '100%';
    img.src = src;
    wrap.appendChild(img);
    return wrap;
  }

  // 部分圖床（如 i.verb.tw）會擋 <img> 外連（回 503），但允許 CORS fetch。
  // 圖片載入失敗時改用 fetch 取得 blob 再顯示；仍失敗的話，我們自己插的圖就移除。
  const retried = new WeakSet();
  async function retryViaFetch(img) {
    if (retried.has(img)) return;
    retried.add(img);
    const src = img.currentSrc || img.src;
    if (!/^https?:/.test(src)) return;
    try {
      const res = await fetch(src, { referrerPolicy: 'no-referrer', credentials: 'omit' });
      if (!res.ok) throw new Error(res.status);
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error(blob.type);
      img.src = URL.createObjectURL(blob);
    } catch {
      img.closest('[data-pwi-src]')?.remove();
    }
  }

  document.addEventListener('error', e => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.closest('.e7-richcontent')) retryViaFetch(img);
  }, true);

  function retryBrokenImages() {
    document.querySelectorAll('.e7-richcontent img').forEach(img => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) retryViaFetch(img);
    });
  }

  // 我們插入的圖片 → 來源連結；用來在 SPA 換頁、Vue 重繪後清掉過期的圖
  const inserted = new Map();

  function scan() {
    // 清掉來源連結已消失或已換內容的圖
    for (const [wrap, a] of inserted) {
      if (!a.isConnected || a.href !== wrap.dataset[MARK] || !wrap.isConnected) {
        wrap.remove();
        inserted.delete(wrap);
      }
    }

    const shown = new Set();
    document.querySelectorAll('.e7-richcontent img').forEach(img => {
      if (!img.closest('[data-pwi-src]')) shown.add(imageKey(img.getAttribute('src') || ''));
    });
    const ours = new Set([...inserted.values()]);

    // 推文的圖片要插在整列推文之後，同一列多張要保持順序
    const lastInRow = new Map();

    document.querySelectorAll('a.externalHref, a.externalHrefRecommend').forEach(a => {
      if (ours.has(a)) {
        const row = a.closest('.e7-container');
        if (row) for (const [w, src] of inserted) if (src === a) lastInRow.set(row, w);
        return;
      }
      const src = toImageUrl(a.href);
      if (!src || shown.has(imageKey(src))) return;

      const wrap = makeImage(src, a.href);
      if (a.classList.contains('externalHrefRecommend')) {
        const row = a.closest('.e7-container');
        if (!row) return;
        (lastInRow.get(row) || row).after(wrap);
        lastInRow.set(row, wrap);
      } else {
        (a.parentElement || a).after(wrap);
      }
      inserted.set(wrap, a);
      shown.add(imageKey(src));
    });

    retryBrokenImages();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; scan(); }, 300);
  }

  new MutationObserver(muts => {
    // 忽略只由我們自己插入/移除圖片造成的變動
    const relevant = muts.some(m =>
      [...m.addedNodes, ...m.removedNodes].some(n => !(n.dataset && n.dataset[MARK])));
    if (relevant) schedule();
  }).observe(document.body, { childList: true, subtree: true });

  schedule();
})();
