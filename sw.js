// ATM용돈박스: 4가지 화면(약 2MB)을 폰에 저장해 인터넷 없이도 열리게 함. 글꼴은 화면을 열 때 자동 저장.
const V = 'yongdon-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
['box', 'machine', 'party', 'vault'].forEach(p => FILES.push(p + '/', p + '/index.html', p + '/manifest.webmanifest', p + '/icon-180.png', p + '/icon-192.png', p + '/icon-512.png'));
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    // 화면은 인터넷이 되면 최신, 안 되면 저장본
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || caches.match('./'))));
  } else {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(m => m || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })));
  }
});
