// 離線快取：只快取本站靜態檔案，絕不快取密碼查詢結果。
const CACHE = 'iphone-guard-v1';
const ASSETS = [
  './', 'index.html', 'css/style.css', 'js/app.js', 'js/checklist-data.js',
  'js/link-check.js', 'js/password-check.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // 網路優先，離線時退回快取
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))),
  );
});
