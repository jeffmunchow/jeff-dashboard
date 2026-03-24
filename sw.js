// Network-first: sempre busca versão nova, usa cache só se offline
self.addEventListener('install', function(e) {
  self.skipWaiting(); // ativa imediatamente, sem esperar aba fechar
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim(); // assume controle de todas as abas abertas
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Sempre tenta buscar da rede primeiro
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Salva cópia fresca no cache para uso offline
      var clone = response.clone();
      caches.open('jeff-v' + Date.now()).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // Só usa cache se estiver offline
      return caches.match(e.request);
    })
  );
});
