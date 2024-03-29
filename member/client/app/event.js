angular.module('uiGenApp')
  .run((
    $rootScope, Auth, authService, AUTH_EVENTS, Session,
    $state, $window, URLS, User, $uibModal, $location) => {
    // In Future: assign to variable to destroy during the $destroy event
    const location = $window.location;
    if (!Session.isAuthenticated() && $location.search().otp) {
      const continueURL = $location.absUrl().split('?')[0];
      const { otp } = $location.search();
      location.href = `${URLS.PARCEL}/api/users/authorise?otp=${otp}&continue=${continueURL}`;
      return location.href;
    }

    $rootScope.$on('$stateChangeStart', (event, next) => {
      // if (!Session.isAuthenticated() && next.name !== 'access.oauth') {
      //   const continueURL = $location.absUrl().split('?')[0];
      //   location.href = `${URLS.LOGIN}/customer/login?continue=${continueURL}`;
      //   return location.href;
      // }

      if (!Session.isAuthenticated() && (next.name.split('.')[0] !== 'access')) {
        event.preventDefault();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        Object.assign($window.location, { href: `${URLS.OAUTH}&state=${location.pathname}` });
        return null;
      }

      if (Session.isAuthenticated() && User.userinfo && User.userinfo.isBlocked
          && (next.name !== User.userinfo.whatBlocked[0].state)) {
        event.preventDefault();
        return $state.go(User.userinfo.whatBlocked[0].state);
      }
      if (Session.isAuthenticated() && (next.name === 'access.oauth')) {
        // return $state.go('packages.index');
        return $state.go('packages.index');
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
