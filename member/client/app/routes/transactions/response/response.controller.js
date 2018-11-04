class TransactionResponseController {
  constructor($http, Page, $uibModal, toaster, $stateParams, CONFIG, $state) {
    this.$http = $http;
    this.Page = Page;
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.$state = $state;
    this.id = this.$stateParams.id;
    this.customerId = this.$stateParams.customer_id;
    this.object_id = this.$stateParams.object_id;
    this.paymentGatewayCashID = 2;
    this.paymentGatewayWireID = 1;
    this.$onInit();
  }

  $onInit() {
    const query = `customer_id=${this.customerId}&object_id=${this.object_id}`;
    this.$http
      .get(`$/api/transactions/${this.id}/response?${query}`)
      .then(({ data: transaction }) => {
        this.transaction = transaction;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
  response() {
    this.$state.go('shipRequest.show', { orderCode: this.transaction.object_id });
  }
}
angular
  .module('uiGenApp')
  .controller('TransactionResponseController', TransactionResponseController);
