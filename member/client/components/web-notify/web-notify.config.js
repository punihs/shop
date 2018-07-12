/* @ngInject */
function webNotify($http, $log, Session, URLS) {
  const user = Session.read('userinfo');
  if (!Session.isAuthenticated() || !user) return;

  function subscribe(reg, userId) {
    reg.pushManager.subscribe({ userVisibleOnly: true })
    .then(sub => {
      const subIdArray = sub.endpoint.split('/');
      const subId = subIdArray[subIdArray.length - 1];
      return $http
        .post(
          `${URLS.QNOTIFY_SERVER}/subscriptions`,
          { user_id: userId, subscription_id: subId }
        );
    })
    .then(res => Session.create('notify', { subscription: res.data, isSubscribed: true }))
    .catch(err => {
      $log.error(err);
      if (err.status === 409) {
        Session.create('notify', { subscription: err.responseText, isSubscribed: true });
      }
    });
  }

  if ('serviceWorker' in navigator) {
    const notify = Session.read('notify') || {};
    $log.info('Service Worker is supported');

    navigator.serviceWorker
      .register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(reg => {
        if (!notify.isSubscribed) subscribe(reg, user.id);
      })
      .catch(err => $log.error(':^(', err));
  }
}

angular
  .module('uiGenApp')
  .run(webNotify);
