/**
 * SERVICE WORKER - Agenda Pro Negócios
 * Permite funcionamento offline e instalação como PWA
 */

const CACHE_NAME = 'agenda-pro-v1.0.0';
const STATIC_CACHE = 'agenda-pro-static-v1.0.0';
const DYNAMIC_CACHE = 'agenda-pro-dynamic-v1.0.0';

// Arquivos para cache inicial
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/reset.css',
    './css/variables.css',
    './css/components.css',
    './css/layout.css',
    './css/responsive.css',
    './js/utils/helpers.js',
    './js/utils/storage.js',
    './js/utils/validators.js',
    './js/components/modal.js',
    './js/components/toast.js',
    './js/modules/clientes.js',
    './js/modules/agenda.js',
    './js/modules/servicos.js',
    './js/modules/financeiro.js',
    './js/modules/relatorios.js',
    './js/modules/dashboard.js',
    './js/modules/configuracoes.js',
    './js/modules/whatsapp.js',
    './js/app.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Cacheando arquivos estáticos...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Instalação concluída!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Erro na instalação:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Remove caches antigos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Ativação concluída!');
                return self.clients.claim();
            })
    );
});

// Intercepta requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições que não são GET
    if (request.method !== 'GET') return;

    // Ignora URLs externas (como WhatsApp)
    if (!url.origin.includes(self.location.origin)) return;

    // Estratégia: Cache First para arquivos estáticos
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    } else {
        // Network First para outras requisições
        event.respondWith(networkFirst(request));
    }
});

/**
 * Verifica se é um asset estático
 * @param {string} url - URL da requisição
 * @returns {boolean}
 */
function isStaticAsset(url) {
    const staticExtensions = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.includes(ext));
}

/**
 * Estratégia Cache First
 * Busca no cache primeiro, depois na rede
 * @param {Request} request - Requisição
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        // Cache a resposta para uso futuro
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Erro no Cache First:', error);
        
        // Retorna página offline se disponível
        return caches.match('./index.html');
    }
}

/**
 * Estratégia Network First
 * Busca na rede primeiro, depois no cache
 * @param {Request} request - Requisição
 * @returns {Promise<Response>}
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache a resposta
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Rede indisponível, buscando no cache...');
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        // Retorna página offline
        return caches.match('./index.html');
    }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Background Sync (para futuras implementações)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background Sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        // Sincronizar dados quando online
        event.waitUntil(syncData());
    }
});

/**
 * Sincroniza dados pendentes
 */
async function syncData() {
    // Futuro: sincronizar dados com servidor
    console.log('[SW] Sincronizando dados...');
}

// Push Notifications (para futuras implementações)
self.addEventListener('push', (event) => {
    console.log('[SW] Push recebido:', event);
    
    const options = {
        body: event.data?.text() || 'Nova notificação',
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now()
        },
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Agenda Pro', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

console.log('[SW] Service Worker carregado!');
