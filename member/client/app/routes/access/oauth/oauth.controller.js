
class OAuthCtrl {
  /* @ngInject */
  constructor(Auth, $location, $window, $state, URLS, $rootScope, Session, toaster) {
    const query = $location.search();
    if (query.error) {
      this.authErr = {
        error: query.error,
        error_description: query.error_description,
        code: query.code,
      };
      return null;
    }

    if (!query.code) toaster.pop('error', 'Authorization code missing');
    Session.clear(['userinfo', 'oauth', 'states', 'shipment-states']);

    const { location } = $window;

    return Auth
      .login({ code: query.code })
      .then(() => Auth
        .setSessionData()
        .then(() => {
          this.user = Session.read('userinfo');

          // Used for updating session
          if (query.state) {
            location.href = `${location.origin}${query.state}`;
          } else if (query.continue) {
            location.href = `${query.continue}`;
          } else {
            location.href = $state.href('dashboard.index', { absolute: true });
          }
        }))
      .catch(() => { debugger
        location.href = URLS.OAUTH;
      });
  }
}

angular.module('uiGenApp')
  .controller('oAuthCtrl', OAuthCtrl);
