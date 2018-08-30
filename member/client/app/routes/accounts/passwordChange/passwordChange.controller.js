

class passwordChangeController {
  /* @ngInject*/
  constructor($http, toaster, Page, $stateParams, $cookies, Session) {
    this.$http = $http;
    this.toaster = toaster;
    this.Page = Page;
    this.Session = Session;
    // this.$window = $window;
    // this.Auth = Auth;
    this.data = [];
    this.submitting = false;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$cookies = $cookies;
    this.$onInit();
    this.id = this.$stateParams.id;
  }

  $onInit() {

  }

  validateForm(form) {
    this.$stateParams.autofocus = '';
    Object.keys(form).filter(x => !x.startsWith('$')).forEach((f) => {
      if (form[f] && form[f].$invalid) {
        if (!this.$stateParams.autofocus) this.$stateParams.autofocus = f;
        form[f].$setDirty();
      }
    });
    return form.$valid;
  }

  logOut() {
    // Removing chat user cookie
    this.$cookies.remove('cc_data');
    this.notify = this.Session.read('notify');
    this.Auth
      .logout()
      .then(() => this.cleanup(), () => this.cleanup());
  }

  ChangePassword(formPasswordChange) {
    this.clickChange = true;
    const data = Object.assign({ }, this.data);
    const form = this.validateForm(formPasswordChange);
    if (!form) return (this.submitting = false);
    // return null;
    this
      .$http
      .put(`/users/${this.id}/changePassword`, data)
      .then(() => {
        this
          .toaster
          .pop('success', 'Password changed successfully');
        this.logOut();
      })
      .catch((err) => {
        this
          .toaster
          .pop('success', err.data.message);
      });
  }
  //
  // reset(formPasswordChange) {
  //   this.data = {};
  //   this.Store.model = '';
  //   formPasswordChange.$setPristine();
  // }
  //
  // cleanup() {
  //   const { QNOTIFY_SERVER, ACCOUNTS } = this.URLS;
  //   const { location } = this.$window;
  //   return Promise.resolve(this.notify
  //     ? this.$http
  //       .delete(`${QNOTIFY_SERVER}/subscriptions/${this.notify.subscription.subscription_id}`)
  //     : true)
  //     .then(() => (location.href = `${ACCOUNTS}/logout`))
  //     .catch(() => (location.href = `${ACCOUNTS}/logout`));
  // }

}

angular.module('uiGenApp')
  .controller('passwordChangeController', passwordChangeController);

