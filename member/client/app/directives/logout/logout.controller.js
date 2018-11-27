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
    if (!this.Session.read('oneSignalPlayerId')) {
      return this.$http
        .delete(`/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}`)
        .then(() => this.Auth
          .logout())
        .then(() => this.cleanup(), () => this.cleanup())
        .catch(() => this.cleanup());
    } else {
      return this.Auth
        .logout()
        .then(() => this.cleanup(), () => this.cleanup())
        .catch(() => this.cleanup());
    }
  }

  cleanup() {
    const { ACCOUNTS } = this.URLS;
    const { location } = this.$window;
    location.href = `${ACCOUNTS}/logout`;
  }
}

angular
  .module('uiGenApp')
  .controller('LogoutController', LogoutController);
