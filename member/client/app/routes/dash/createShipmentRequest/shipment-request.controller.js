class shipmentRequestController {
  constructor($http, Page) {
    this.$http = $http;
    this.Page = Page;
    this.shipments = [];
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Shipment Request Create');
  }
}
angular
  .module('uiGenApp')
  .controller('shipmentRequestController', shipmentRequestController);
