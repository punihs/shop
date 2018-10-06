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
    this.Auth
      .logout()
      .then(() => this.cleanup(), () => this.cleanup());
  }

  cleanup() {
    const { ACCOUNTS } = this.URLS;
    const { location } = this.$window;
    OneSignal.setSubscription(false);
    return  setTimeout(() => (location.href = `${ACCOUNTS}/logout`), 2000)
  }
}

angular
  .module('uiGenApp')
  .controller('LogoutController', LogoutController);
