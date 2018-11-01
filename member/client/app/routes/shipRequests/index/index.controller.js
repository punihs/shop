class ShipRequestsIndexController {
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
        console.log({ shipments });
        shipments.map(x => this.shipments.push(x));
        this.todayDate = new Date();
        this.shipments.map((s) => {
          const shipment = s;
          const shipmentDate = new Date(shipment.created_at);
          const ONE_HOUR = 60 * 60 * 1000;

          // - Todo: moment().diff(moment(shipmentDate), 'hour')
          shipment.totalHours = moment().diff(moment(shipmentDate), 'hour');

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

  cancel(id, index) {
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
  .controller('ShipRequestsIndexController', ShipRequestsIndexController);
