// ATM용돈박스: 4가지 화면을 폰에 저장해 인터넷 없이도 열리게 함
const V = 'yongdon-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
['box', 'machine', 'party', 'vault'].forEach(p => FILES.push(p + '/', p + '/index.html', p + '/manifest.webmanifest', p + '/icon-180.png', p + '/icon-192.png', p + '/icon-512.png'));
const FONT_CSS = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Nanum+Gothic+Coding:wght@700&display=swap',
  'https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700;900&family=Nanum+Gothic+Coding:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;900&family=Nanum+Gothic+Coding:wght@700&display=swap',
  'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(FILES);
    // 글꼴도 미리 저장(실패해도 설치는 계속)
    for (const u of FONT_CSS) {
      try {
        const r = await fetch(u, { mode: 'cors' }); if (!r.ok) continue;
        const css = await r.clone().text(); await c.put(u, r);
        const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
        await Promise.all(urls.map(async f => { try { const fr = await fetch(f, { mode: 'cors' }); if (fr.ok) await c.put(f, fr); } catch (e) { } }));
      } catch (e) { }
    }
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
