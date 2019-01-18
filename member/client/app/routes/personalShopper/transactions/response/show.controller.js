class PersonalShopperTransactionResponseController {
  constructor($http, Page, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;

    return this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Payment Success');
    this.packages = [];
    this.getList();
  }

  getList() {
    this.$http
      .get('/packages/personalShopperPackage/paymentSuccess')
      .then(({ data: { packages } }) => {
        this.packages = packages;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('PersonalShopperTransactionResponseController', PersonalShopperTransactionResponseController);
