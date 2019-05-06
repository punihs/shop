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
    return Auth
      .login({ code: query.code })
      .then(() => Auth
        .setSessionData()
        .then(() => {
          this.user = Session.read('adminUserinfo');

          const location = $window.location;
          // Used for updating session
          location.href = query.state
            ? `${location.origin}${query.state}`
            : $state.href('packages.index', { absolute: true });
        }))
      .catch(() => {
        const location = $window.location;
        location.href = URLS.OAUTH;
      });
  }
}

angular.module('uiGenApp')
  .controller('oAuthCtrl', OAuthCtrl);
