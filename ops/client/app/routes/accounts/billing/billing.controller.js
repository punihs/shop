class BillingController {
  /* @ngInject*/
  constructor($http, toaster, Page, Auth) {
    this.$http = $http;
    this.toaster = toaster;
    this.Auth = Auth;
    this.Page = Page;
    this.Page.setTitle('Billing  Details - My Account');
    this.$onInit();
  }

  $onInit() {
    this
      .$http
      .get('/clients/billing')
      .then(({ data }) => {
        this.data = data;
      });
  }

  create() {
    this
      .$http
      .post('/clients/billing', this.data).then(() => {
        this.Auth.setSessionData().then(() => {
          this.toaster.pop('success', 'Record updated Successfully.');
        });
      })
      .catch(() => this
        .toaster
        .pop('error', 'Error occurred while updating the record.'));
  }
}

angular.module('uiGenApp')
  .controller('BillingController', BillingController);
