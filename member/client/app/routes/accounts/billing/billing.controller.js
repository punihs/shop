class BillingController {
  /*@ngInject*/
  constructor($http, toaster, QuarcService, Auth) {
    this.$http = $http;
    this.toaster = toaster;
    this.QuarcService = QuarcService;
    this.Auth = Auth;
    this.Page = this.QuarcService.Page;
    this.Page.setTitle('Billing  Details - My Account');
    this.$onInit();
  }

  $onInit() {
    this
      .$http
      .get('/clients/billing')
      .then(({data}) => this.data = data);
  }

  create() {
      this
        .$http
        .post('/clients/billing',this.data).then(() => {
          this.Auth.setSessionData().then(() => {
            this.toaster.pop(this.QuarcService.toast('success', 'Record updated Successfully.'));
          });
        }).catch(() => {
            this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while updating the record.'));
        });
  }
}
    angular.module('uiGenApp')
      .controller('BillingController', BillingController);
