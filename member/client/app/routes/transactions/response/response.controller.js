class TransactionResponseController {
  constructor($http, Page, $uibModal, toaster, $stateParams, CONFIG, $state, $httpParamSerializer) {
    this.$http = $http;
    this.Page = Page;
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.$httpParamSerializer = $httpParamSerializer;
    this.$state = $state;
    this.id = this.$stateParams.id;
    this.customerId = this.$stateParams.customer_id;
    this.object_id = this.$stateParams.object_id;
    this.paymentGatewayCashID = 2;
    this.paymentGatewayWireID = 1;
    this.paymentGatewayWallet = 6;
    this.$onInit();
  }

  $onInit() {
    const query = `customer_id=${this.customerId}&object_id=${this.object_id}`;
    this.$http
      .get(`$/api/transactions/${this.id}/response?${query}`)
      .then(({ data: transaction }) => {
        this.transaction = transaction;
        if (this.transaction.payment_gateway_id === this.paymentGatewayCashID ||
          this.transaction.payment_gateway_id === this.paymentGatewayWireID ||
          this.transaction.payment_gateway_id === this.paymentGatewayWallet) {
          const queryParams = {
            id: this.$stateParams.object_id,
            uid: this.$stateParams.customer_id,
            message: this.$stateParams.message,
            amount: this.$stateParams.amount,
            status: 6,
            paymentStatus: 'Success',
            transaction_id: this.$stateParams.id,
          };
          const qs = this.$httpParamSerializer(queryParams);

          this.$http
            .get(`/shipments/${this.$stateParams.object_id}/response?${qs}`);
        }
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
