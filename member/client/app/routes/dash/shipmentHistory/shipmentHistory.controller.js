class ShipmentHistoryController {
  constructor(
    $http, Page, $stateParams, moment, CONFIG, $state, Session, $uibModal,
    toaster, URLS) {
    this.$http = $http;
    this.Page = Page;
    this.moment = moment;
    this.CONFIG = CONFIG;
    this.toaster = toaster;
    this.Session = Session;
    this.URLS = URLS;
    this.$uibModal = $uibModal;

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

  uploadPhotos(packageDetail) {
    this.$uibModal.open({
      templateUrl: 'app/directives/request-photos/request-photos.html',
      controller: 'RequestPhotosController',
      controllerAs: '$ctrl',
      size: 'lg',
      resolve: {
        packageDetail() {
          return packageDetail;
        },
      },
    });
  }

}

angular
  .module('uiGenApp')
  .controller('ShipmentHistoryController', ShipmentHistoryController);
