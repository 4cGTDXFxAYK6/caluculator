// ===============================
//  PWA キャッシュ設定
// ===============================
const CACHE_VERSION = 'v90';
const CACHE_NAME = `calculator-cache-${CACHE_VERSION}`;

const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ===============================
//  インストール（新キャッシュ作成）
// ===============================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// ===============================
//  有効化（古いキャッシュ削除）
// ===============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('calculator-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===============================
//  fetch（キャッシュ優先 + ネット更新）
// ===============================
self.addEventListener('fetch', event => {
  const request = event.request;

  // GETリクエスト以外はスルー
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then(networkResponse => {
          // 同一オリジンのリソースのみキャッシュに追加
          if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // オフライン時：HTMLリクエストならキャッシュのindex.htmlを返す
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
