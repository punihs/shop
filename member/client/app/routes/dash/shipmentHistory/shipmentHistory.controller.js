class ShipmentHistoryController {
  constructor(
    $http, Page, $stateParams, CONFIG, $state, Session,
    toaster, URLS) {
    this.$http = $http;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.CONFIG = CONFIG;
    this.toaster = toaster;
    this.Session = Session;
    this.URLS = URLS;

    return this.$onInit();
  }

  $onInit() {
    this.SHIPMENT_STATE_IDS = this.CONFIG.SHIPMENT_STATE_IDS;
    this.Page.setTitle('Shipment History');
    this.shipments = [];
    this.getList();
  }

  getList() {
    this.$http
      .get('/shipments/history')
      .then(({ data: { shipment } }) => {
        shipment.forEach(x => this.shipments.push(x));
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
  .controller('ShipmentHistoryController', ShipmentHistoryController);
