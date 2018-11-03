class LogoutController {
  constructor(URLS, $window, $cookies, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.$cookies = $cookies;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
  }

  $onInit() {
    // Removing chat user cookie
    this.$cookies.remove('cc_data');
    this.notify = this.Session.read('notify');
    return this.Auth
      .logout()
      .then(() => this.cleanup())
      .catch(() => this.cleanup());
    // return this.$http
    //   .delete(`/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}`)
    //   .then(() => this.Auth
    //     .logout())
    //   .then(() => this.cleanup(), () => this.cleanup())
    //   .catch(() => this.cleanup());
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
