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
    this.user = this.Session.read('userinfo');

    let onsignal = Promise.resolve();
    if (this.Session.read('oneSignalPlayerId')) {
      onsignal = this.$http
        .delete(`#/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}?user_id=${this.user.id}`);
    }

    return onsignal
      .then(() => {
        return Promise.resolve();
        return this.Auth
          .logout()
          .then(() => this.cleanup(), () => this.cleanup())
      })
      .catch(() => this.cleanup());
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
