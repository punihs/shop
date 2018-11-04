class ShipRequestTransactionResponseController {
  constructor($http, Page, $uibModal, toaster, $stateParams, CONFIG) {
    this.$http = $http;
    this.Page = Page;
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.orderCode = this.$stateParams.orderCode;
    this.paymentGatewayCashID = 2;
    this.paymentGatewayWireID = 1;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.orderCode}?transactionSuccessPage=true`)
      .then(({ data: { shipment } }) => {
        this.shipment = shipment;
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
  .controller('ShipRequestTransactionResponseController', ShipRequestTransactionResponseController);
