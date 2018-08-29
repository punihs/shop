class PaymentAxis {
  constructor($http, Page, $uibModal, toaster, $location) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.$location = $location;
    this.encrypted = this.$location.search().encrypted;
    this.vpcMerchantId = this.$location.search().vpcMerchantId;
    console.log('encrypted', this.encrypted);
    this.$onInit();
  }

  $onInit() {

  }
}
angular
  .module('uiGenApp')
  .controller('PaymentAxis', PaymentAxis);
