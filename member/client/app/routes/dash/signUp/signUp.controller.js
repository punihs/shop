class SignUpController {
  constructor($http, Page, $uibModal, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.data = {};
  }

  signup() {
    this.$http
      .post('/users/public/register', this.data)
      .then(({ data: { data } }) => {
        this
          .toaster
          .pop('success', data);
      })
      .catch((err) => {
        this
          .toaster
          .pop('danger', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('SignUpController', SignUpController);
