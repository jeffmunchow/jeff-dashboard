// Cache com timestamp único — muda a cada deploy, força atualização automática
const CACHE = 'jeff-v20260324190250';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.add('/');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Remove todos os caches antigos
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    // Rede primeiro — sempre tenta pegar versão mais recente
    fetch(e.request.clone()).then(function(response) {
      // Salva cópia no cache para uso offline
      if (response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Sem internet: usa o que estava no cache
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Sem conexão. Abra o app quando tiver internet para carregar.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
