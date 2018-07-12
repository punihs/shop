(() => {
  class TransactionController {
    /*@ngInject*/
    constructor($http, toaster, QuarcService, Auth) {
      this.$http = $http;
      this.toaster = toaster;
      this.QuarcService = QuarcService;
      this.Page = this.QuarcService.Page;
      this.$onInit();
    }

    $onInit() {
      this.Page.setTitle('Transaction PIN - My Account');
      this
        .$http
        .get('/clients/transactionPin')
        .then(({data}) => this.data = data);
    }

    create() {
        this
          .$http
          .post('/clients/transactionPin',this.data).then(() => {
              this.toaster.pop(this.QuarcService.toast('success', 'PIN updated Successfully.'));
          }).catch(() => {
              this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while updating your pin.'));
          });
    }
  }

  angular.module('uiGenApp')
    .controller('TransactionController', TransactionController);
})();
