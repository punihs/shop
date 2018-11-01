class TransactionResponseController {
  constructor($http, Page, $uibModal, toaster, $stateParams, CONFIG) {
    this.$http = $http;
    this.Page = Page;
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.id = this.$stateParams.id;
    this.paymentGatewayCashID = 2;
    this.paymentGatewayWireID = 1;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.id}/request/response`)
      .then(({ data: { shipment } }) => {
        this.shipment = shipment;
      })
      .catch(err => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('TransactionResponseController', TransactionResponseController);
