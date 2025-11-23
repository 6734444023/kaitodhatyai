// Service Worker for handling background notifications (Optional custom logic)
self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title || 'แจ้งเตือนใหม่';
    const options = {
        body: data.body || 'มีข้อความใหม่',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
