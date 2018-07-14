(() => {
  class TransactionController {
    /* @ngInject*/
    constructor($http, toaster, Page) {
      this.$http = $http;
      this.toaster = toaster;
      this.Page = Page;
      this.$onInit();
    }

    $onInit() {
      this.Page.setTitle('Transaction PIN - My Account');
      this
        .$http
        .get('/clients/transactionPin')
        .then(({ data }) => {
          this.data = data;
        });
    }

    create() {
      this
        .$http
        .post('/clients/transactionPin', this.data).then(() => {
          this.toaster.pop('success', 'PIN updated Successfully.');
        })
        .catch(() => this
          .toaster
          .pop('error', 'Error occurred while updating your pin.'));
    }
  }

  angular.module('uiGenApp')
    .controller('TransactionController', TransactionController);
})();
