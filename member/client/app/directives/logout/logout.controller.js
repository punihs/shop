class LogoutController {
  constructor(URLS, $window, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
  }

  // $onInit() {
  //   debugger;
  //   this.notify = this.Session.read('notify');
  //   this.user = this.Session.read('userinfo');
  //
  //   let onsignal = Promise.resolve();
  //   if (this.Session.read('oneSignalPlayerId')) {
  //     onsignal = this.$http
  //       .delete(`#/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}?user_id=${this.user.id}`);
  //   }
  //
  //   return onsignal
  //     .then(() => {
  //       return Promise.resolve();
  //       return this.Auth
  //         .logout()
  //         .then(() => this.cleanup(), () => this.cleanup())
  //     })
  //     .catch(() => this.cleanup());
  // }

  $onInit() {
    this.notify = this.Session.read('notify');
    if (!this.Session.read('oneSignalPlayerId')) {
      return this.$http
        .delete(`/notificationSubscriptions/${this.Session.read('oneSignalPlayerId')}`)
        .then(() => this.Auth
          .logout())
        .then(() => this.cleanup(), () => this.cleanup())
        .catch(() => this.cleanup());
    }

    return this.Auth
      .logout()
      .then(() => this.cleanup(), () => this.cleanup())
      .catch(() => this.cleanup());
  }

  cleanup() {
    // localStorage.clear();
    localStorage.removeItem('oauth');
    localStorage.removeItem('userinfo');
    localStorage.removeItem('states');
    localStorage.removeItem('shipment-states');
    const { WWW, OAUTH_CLIENT_ID } = this.URLS;
    const { location } = this.$window;
    location.href = `${WWW}/logout`;
    // location.href = `${LOGIN}/logout?continue=/signin?client_id=${OAUTH_CLIENT_ID}`;
  }
}

angular
  .module('uiGenApp')
  .controller('LogoutController', LogoutController);
