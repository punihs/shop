/* global clients:false, var2:false */
// TODO configure for different server (local, staging and live)
const QNOTIFY_SERVER = 'https://qnotify.quezx.com';
const $log = console;

self.addEventListener('push', event => {
  event.waitUntil(self.registration.pushManager
    .getSubscription()
    .then(subscription => {
      const endpointSplit = subscription.endpoint.split('/');
      const endpoint = endpointSplit[endpointSplit.length - 1];
      const def = {
        title: 'Quezx Partner',
        body: 'You have new notifications',
        icon: 'https://app.quezx.com/img/quezx-png-logo.png',
        tag: 'default',
        link: '/notifications',
      };

      // Expect DOMException Error
      return fetch(`${QNOTIFY_SERVER}/api/notifications/fetch/${endpoint}`)
        .then(res => res
          .json()
          .then(payload => {
            const title = payload.title || def.title;
            const body = payload.body || def.body;
            const icon = payload.icon || def.icon;
            const tag = payload.tag || def.tag;
            return self.registration.showNotification(title, { body, icon, tag, data: payload });
          })
          .catch(err => {
            $log.log('Error in notifications ', err);
            return self.registration.showNotification(def.title, def);
          }));
    }));
});

self.addEventListener('notificationclick', event => {
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();
  const url = event.notification.data.link;

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        const clientsCount = windowClients.length;
        for (let i = 0; i < clientsCount; i++) {
          const client = windowClients[i];
          if (client.url === url && 'focus' in client) return client.focus();
        }

        if (clients.openWindow) return clients.openWindow(url);
        return null;
      })
  );
});

