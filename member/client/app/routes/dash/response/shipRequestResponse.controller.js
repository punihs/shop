class ShipRequestResponse {
  constructor($http, Page, $uibModal, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.shipmentId = 115;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.shipmentId}/request/shipRequestResponse`)
      .then(({ data: { shipment } }) => {
        console.log(shipment);
        this.shipment = shipment;
      })
      .catch(err => {
        this
          .toaster
          .pop('danger', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('ShipRequestResponse', ShipRequestResponse);
