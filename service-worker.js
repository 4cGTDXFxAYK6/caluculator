// ★ バージョン付きキャッシュ名
const CACHE_VERSION = 'v3';
const CACHE_NAME = `calculator-cache-${CACHE_VERSION}`;

// ★ キャッシュしたいファイル一覧（必要に応じて追加）
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// install：初回 or 更新時に呼ばれる
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 重要ファイルを事前キャッシュ
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  // 新しい SW をすぐ有効化したい場合
  self.skipWaiting();
});

// activate：古いキャッシュの掃除など
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

  // すぐにクライアントをこの SW 管理下に
  self.clients.claim();
});

// fetch：リクエストごとの応答戦略
self.addEventListener('fetch', event => {
  const request = event.request;

  // ここでは基本的に「Cache First」戦略を採用
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // ★ キャッシュがあればそれを即返す（オフラインでも速い）
        return cachedResponse;
      }

      // ★ キャッシュにない場合はネットワークから取得
      return fetch(request)
        .then(networkResponse => {
          // 同一オリジンの GET リクエストだけキャッシュに保存
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
          // 完全オフラインで、かつキャッシュにもない場合のフォールバック
          // 今回は特に代替ページを返さず、そのまま失敗させる
          // 必要ならここで「オフライン用ページ」を返すこともできる
        });
    })
  );
});