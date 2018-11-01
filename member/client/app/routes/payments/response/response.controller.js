class PaymentResponse {
  constructor($http, Page, $uibModal, toaster, $stateParams, CONFIG) {
    this.$http = $http;
    this.Page = Page;
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.shipmentId = this.$stateParams.shipmentId;
    this.paymentGatewayCashID = this.CONFIG.PAYMENT_GATEWAY.CASH;
    this.paymentGatewayWireID = this.CONFIG.PAYMENT_GATEWAY.WIRE;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.shipmentId}/request/response`)
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
  .controller('PaymentResponse', PaymentResponse);
