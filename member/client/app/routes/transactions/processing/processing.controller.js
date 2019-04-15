class TransactionProcessingController {
  constructor($http, Page, toaster, $stateParams,
    $state, URLS, ACCOUNT_DETAILS, $httpParamSerializer) {
    this.$http = $http;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.$state = $state;
    this.URLS = URLS;
    this.account = ACCOUNT_DETAILS;
    this.$httpParamSerializer = $httpParamSerializer;

    this.$onInit();
  }

  $onInit() {
    this.id = this.$stateParams.id;
    this.customerId = this.$stateParams.customer_id;
    this.object_id = this.$stateParams.object_id;
    this.paymentGatewayCashID = 2;
    this.paymentGatewayWireID = 1;

    const queryParams = {
      customer_id: this.customerId,
      object_id: this.object_id,
    };

    const qs = this.$httpParamSerializer(queryParams);
    this.$http
      .get(`$/transactions/${this.id}/response?${qs}`)
      .then(({ data: transaction }) => {
        this.transaction = transaction;
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
  continue() {
    this.$state
      .go('transaction.response',
      {
        object_id: this.transaction.object_id,
        customer_id: this.transaction.customer_id,
        status: this.transaction.status,
        amount: this.transaction.amount,
      });
  }
}
angular
  .module('uiGenApp')
  .controller('TransactionProcessingController', TransactionProcessingController);
