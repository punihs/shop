class LogoutController {
  /* @ngInject */
  constructor($window, $stateParams, $rootScope, AppAction, AUTH_EVENTS) {
    this.$window = $window;
    this.$stateParams = $stateParams;
    this.$rootScope = $rootScope;
    this.AUTH_EVENTS = AUTH_EVENTS;
    this.AppAction = AppAction;
  }

  $onInit() {
    return this.AppAction
      .logout()
      .then(() => {
        const { location } = this.$window;
        const next = this.$stateParams.continue || '/home';
        location.href = next.slice(0, 1) === '/'
        ? `${location.origin}${next}`
        : next;
        return this.$rootScope.$broadcast(this.AUTH_EVENTS.logoutSuccess);
      }, () => {
        const next = this.$stateParams.continue || '/home';
        location.href = next.slice(0, 1) === '/'
        ? `${location.origin}${next}`
        : next;
        return this.$rootScope.$broadcast(this.AUTH_EVENTS.logoutFailed);
      });
  }
}

export default LogoutController;
