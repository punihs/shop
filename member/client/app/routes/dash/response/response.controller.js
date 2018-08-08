class PaymentResponse {
  constructor($http, Page, $uibModal, $stateParams, CONFIG, $location, $state, Session) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.shipmentId = 115;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.shipmentId}/request/response`)
      .then(({ data: { shipment }}) => {
        alert(shipment.PaymentGateway.value);
        console.log({ shipment });
        this.shipment = shipment;
      })
      .catch(err => {
        alert(err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('PaymentResponse', PaymentResponse);
