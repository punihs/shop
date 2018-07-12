
angular.module('uiGenApp')
  .controller('oAuthCtrl', function (Auth, $location, $cookies, $window, $state, URLS, $rootScope, Session) {
    const vm = this;
    const query = $location.search();
    if (query.error) {
      vm.authErr = {
        error: query.error,
        error_description: query.error_description,
        code: query.code,
      };
      return;
    }

    if (query.code) {
      return Auth
        .login({ code: query.code })
        .then(() => Auth
          .setSessionData()
          .then(() => {
            vm.user = Session.read('userinfo');
            $cookies.put('cc_data', vm.user.id, {
              expires: 'Thu, 01 Jan 2099 00:00:01 GMT',
            });

            const location = $window.location;
            // Used for updating session
            location.href = query.state
              ? `${location.origin}${query.state}`
              : $state.href('dashboard', { absolute: true });
          }))
        .catch(() => {
          const location = $window.location;
          location.href = URLS.OAUTH;
        });
    }
  });
