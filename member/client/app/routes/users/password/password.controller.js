class PasswordController {
  /* @ngInject*/
  constructor($http, toaster, Page, $stateParams, $cookies, Session) {
    this.$http = $http;
    this.toaster = toaster;
    this.Page = Page;
    this.Session = Session;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$cookies = $cookies;

    return this.$onInit();
  }

  $onInit() {
    this.id = this.$stateParams.id;
    this.submitting = false;
    this.data = [];
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
    this.notify = this.Session.read('notify');
    // - Notification unsubscribe not works
    this.Auth
      .logout()
      .then(() => this.cleanup(), () => this.cleanup());
  }

  changePassword(formPasswordChange) {
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
    return null;
  }
}

angular.module('uiGenApp')
  .controller('PasswordController', PasswordController);

