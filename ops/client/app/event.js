angular.module('uiGenApp')
  .run((
    $rootScope, Auth, authService, AUTH_EVENTS, Session, $state, $window, URLS, User, $uibModal
  ) => {
    // In Future: assign to variable to destroy during the $destroy event
    const location = $window.location;
    $rootScope.$on('$stateChangeStart', (event, next) => {
      if (!Session.isAuthenticated() && (next.name.split('.')[0] !== 'access')) {
        event.preventDefault();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        Object.assign($window.location, { href: `${URLS.OAUTH}&state=${location.pathname}` });
        return null;
      }

      if (Session.isAuthenticated() && User.adminUserinfo && User.adminUserinfo.isBlocked
          && (next.name !== User.adminUserinfo.whatBlocked[0].state)) {
        event.preventDefault();
        return $state.go(User.adminUserinfo.whatBlocked[0].state);
      }

      if (Session.isAuthenticated() && (next.name === 'access.oauth')) {
        event.preventDefault();
        return $state.go('orders.index');
      }

      return $rootScope.$broadcast('show-announcement', next);
    });

    $rootScope.$on(AUTH_EVENTS.loginSuccess, (event, data) => {
      angular.noop(event);
      return angular.noop(data);
    });

    return $rootScope.$on(AUTH_EVENTS.loginRequired, () => {
      if (Session.isAuthenticated()) {
        // Refresh token autimatically if token expires
        Auth.refreshToken().then(
          () => {
            authService.loginConfirmed('success', argConfig => {
              const config = argConfig;
              config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
              return config;
            });
          },
          err => (err.status === 400) && $uibModal.open({
            animation: true,
            templateUrl: 'app/directives/reauth/reauth.html',
            controller() {
              Session.destroy();
              const vm = this;
              vm.href = `${URLS.OAUTH}&state=${location.pathname}`;
            },
            controllerAs: 'ReAuth',
            backdrop: 'static',
          })
        );
      }
    });
  });
