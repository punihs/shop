class shipmentsListController {
  constructor($http, Page) {
    this.$http = $http;
    this.Page = Page;
    this.shipments = [];
    this.$onInit();
  }
  $onInit() {
    this.Page.setTitle('Shipments');
    this.getShipments();
  }
  getShipments() {
    this
      .$http
      .get('/shipments/history')
      .then(({ data: shipments }) => {
        this.shipments.push(...shipments);
      });
  }

}
angular.module('uiGenApp').controller('shipmentsListController', shipmentsListController);
