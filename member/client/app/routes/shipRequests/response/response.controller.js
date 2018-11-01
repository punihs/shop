class ShipRequestResponse {
  constructor($http, Page, $uibModal, toaster, $location, $stateParams) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.$location = $location;
    this.orderCode = this.$stateParams.orderCode;
    this.$onInit();
  }

  $onInit() {
    this.$http
      .get(`/shipments/${this.orderCode}/request/shipRequestResponse`)
      .then(({ data: { shipment } }) => {
        this.shipment = shipment;
      })
      .catch((err) => {
        this
          .toaster
          .pop('danger', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('ShipRequestResponse', ShipRequestResponse);
