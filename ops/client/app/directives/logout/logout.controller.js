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
    const { QNOTIFY_SERVER, ACCOUNTS } = this.URLS;
    const { location } = this.$window;
    return Promise.resolve(this.notify
      ? this.$http
      .delete(`${QNOTIFY_SERVER}/subscriptions/${this.notify.subscription.subscription_id}`)
      : true)
      .then(() => (location.href = `${ACCOUNTS}/logout`))
      .catch(() => (location.href = `${ACCOUNTS}/logout`));
  }
}

angular
  .module('uiGenApp')
  .controller('LogoutController', LogoutController);
