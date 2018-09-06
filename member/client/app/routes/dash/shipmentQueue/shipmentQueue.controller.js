class ShipmentQueue {
  constructor($http, Page, $uibModal, toaster, moment, CONFIG) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.moment = moment;
    this.toaster = toaster;
    this.Number = Number;
    this.shipments = [];
    this.CONFIG = CONFIG;
    this.$onInit();
  }

  $onInit() {
    this.SHIPMENT_STATE_IDS = this.CONFIG.SHIPMENT_STATE_IDS;
    this.$http
      .get('/shipments/queue')
      .then(({ data: { shipment } }) => {
        shipment.forEach(x => this.shipments.push(x));
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
  .controller('ShipmentQueue', ShipmentQueue);
