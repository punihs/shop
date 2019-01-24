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
    this.PAYMENT_GATEWAYS = this.CONFIG.PAYMENT_GATEWAY;
    this.SHIPMENT_STATE_IDS = this.CONFIG.SHIPMENT_STATE_IDS;
    this.$http
      .get('/shipments/queue')
      .then(({ data: { shipments } }) => {
        if (shipments) {
          this.shipments = shipments;

          this.shipments.map((s) => {
            const shipment = s;
            const shipmentDate = new Date(shipment.created_at);
            shipment.totalHours = moment().diff(moment(shipmentDate), 'hour');

            return shipment;
          });

          const transactionIds = this.shipments.map(x => x.transaction_id);
          let transactionId = '';
          this.$http
            .get(`$/api/transactions?transactionIds=${transactionIds}`)
            .then(({ data: transactions }) => {
              this.transactions = transactions;

              transactionId = transactions.map(x => x.id);

              this.shipments.forEach((ship) => {
                if (transactionId.includes(ship.transaction_id)) {
                  this.transactions.map((trans) => {
                    if (ship.transaction_id === trans.id) {
                      Object.assign(ship, { payment_gate_id: trans.payment_gateway_id });
                      Object.assign(ship, { payment_status: trans.payment_status });
                    }
                  });
                }
              });
            });
        }
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
