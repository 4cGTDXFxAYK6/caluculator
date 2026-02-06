// ===============================
//  PWA キャッシュ設定
// ===============================
const CACHE_VERSION = 'v18';   // ← 更新時は数字を上げる
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
  self.skipWaiting(); // ← 新しい SW を即座に有効化
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
  self.clients.claim(); // ← ページを即座に新 SW の管理下に
});

// ===============================
//  更新があったら自動リロード
// ===============================
self.addEventListener('controllerchange', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.navigate(client.url));
  });
});

// ===============================
//  fetch（キャッシュ優先 + ネット更新）
// ===============================
self.addEventListener('fetch', event => {
  const request = event.request;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // キャッシュがあれば即返す
      if (cachedResponse) return cachedResponse;

      // ネットから取得してキャッシュに保存
      return fetch(request)
        .then(networkResponse => {
          if (
            request.method === 'GET' &&
            request.url.startsWith(self.location.origin)
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // オフライン時のフォールバック（必要なら追加）
        });
    })
  );

});














