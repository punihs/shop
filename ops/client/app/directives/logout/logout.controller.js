class LogoutController {
  constructor(URLS, $window, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
  }

  $onInit() {
    this.notify = this.Session.read('notify');

    return this.$http
      .delete(`/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}`)
      .then(() => this.Auth
        .logout())
      .then(() => this.cleanup(), () => this.cleanup())
      .catch(() => this.cleanup());
  }

  cleanup() {
    // localStorage.clear();
    localStorage.removeItem('adminOauth');
    localStorage.removeItem('adminShipment-states');
    localStorage.removeItem('adminStates');
    localStorage.removeItem('adminUserinfo');
    localStorage.removeItem('afterShipCarriers');
    const { WWW, OAUTH_CLIENT_ID } = this.URLS;
    const { location } = this.$window;
    // location.href = `${LOGIN}/logout?continue=/signin?client_id=${OAUTH_CLIENT_ID}`;
    location.href = `${WWW}/logout`;
  }
}

angular
  .module('uiGenApp')
  .controller('LogoutController', LogoutController);
