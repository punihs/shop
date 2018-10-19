class ShipmentQueue {
  constructor($http, Page, $uibModal, toaster, moment, CONFIG, $location) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.moment = moment;
    this.toaster = toaster;
    this.$location = $location;
    this.Number = Number;
    this.shipments = [];
    this.CONFIG = CONFIG;
    this.error = this.$location.search().error;
    this.$onInit();
  }

  $onInit() {
    this.inreview = false;
    this.SHIPMENT_STATE_IDS = this.CONFIG.SHIPMENT_STATE_IDS;
    this.$http
      .get('/shipments/queue')
      .then(({ data: { shipments } }) => {
        shipments.forEach(x => this.shipments.push(x));
        this.todayDate = new Date();
        this.shipments.map(shipment => {
          const shipmentDate = new Date(shipment.created_at);
          shipment.totalHours = Math.ceil((Math.abs(this.todayDate.getTime() - shipmentDate.getTime())) / (60 * 60 * 1000)) - 1;
          return shipment;
        });
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });

    if (this.error) {
      this.message = this.$location.search().message;
    }
  }

  cancelShipRequest(id, index) {
    this.$http
      .put(`/shipments/${id}/cancel`)
      .then(() => {
        this.shipments.splice(index, 1);
        this
          .toaster
          .pop('success', 'Shipment cancelled');
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
  .controller('ShipmentQueue', ShipmentQueue);
