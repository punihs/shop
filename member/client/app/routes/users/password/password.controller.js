class PasswordController {
  /* @ngInject*/
  constructor($http, toaster, Page, $stateParams, Session) {
    this.$http = $http;
    this.toaster = toaster;
    this.Page = Page;
    this.Session = Session;
    this.$http = $http;
    this.$stateParams = $stateParams;

    return this.$onInit();
  }

  $onInit() {
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
    const id = this.Session.read('userinfo').id;
    // return null;
    this
      .$http
      .put(`~/api/users/${id}/changePassword`, data)
      .then(({ data: { status } }) => {
        if (status === 'success') {
          this
            .toaster
            .pop('success', 'Your account password has been changed. Please login to continue.');
          this.logOut();
        }
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
    return null;
  }
}

angular.module('uiGenApp')
  .controller('PasswordController', PasswordController);

