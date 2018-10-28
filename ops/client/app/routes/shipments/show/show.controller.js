class shipmentsShowController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeShipmentState,
    pkg, JobModal, ListModal, toaster) {
    this.Number = Number;
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.ChangeShipmentState = ChangeShipmentState;
    this.data = pkg;
    this.ListModal = ListModal;
    this.moment = moment;
    this.customer = pkg.Customer;
    // - todo -required
    // this.editAllowedStates = [16, 17, 18, 19, 21, 22, 23, 24];
    this.deleteAllowedStates = [16, 17, 18, 19, 21];
    this.location = $window.location;
    this.user = Session.read('userinfo');
    this.$onInit();
  }

  $onInit() {
    this.root = '_root_';
    this.modal = {};
    this.states = this.Session.read('shipment-states');
    this.user = this.Session.read('userinfo');
  }

  setMessage(description) {
    this.modal = {
      modalButtons: [{ name: 'OK', type: 'default' }],
      title: 'Action Required',
      description,
    };
    this.ListModal.open(this.modal, 'popup');
  }

  chatHoverText() {
    return `Initiate chat with ${this.data.name}`;
  }

  awfTime() {
    const [time] = this.data.comments.filter(c => c.state_id === 1);
    return time;
  }

  toggleBookmark(bucket) {
    this
      .$http
      .post(`/shipments/${this.$stateParams.id}/bookmarks`, { bucket })
      .then(() => {
        this.data.is_bookmarked = bucket;
        this.toaster
          .pop('success',
            (bucket
              ? 'Bookmarked Successfully'
              : 'Unbookmarked Successfully'
            ));
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem loading data. Please contact ShoppRe team');
      });
  }

  deleteShipment(shipmentid) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Shipment');
    if (!ok) return null;

    return this
      .$http
      .delete(`/shipments/${shipmentid}`)
      .then(({ data: { message } }) => {
        this.toaster
          .pop('success', message);
        this.$state.go('shipments.index');
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem deleting shipment');
      });
  }

  uploadFiles(files) {
    this.$q
      .all(files
        .map((file) => this
          .$http
          .post(`/shipment/${this.$stateParams.id}/items`, {
            documentFile: file,
          })))
      .then((docs) => {
        const data = docs.map(file => {
          const { id, filename, link } = file.data;
          return { id, filename, link };
        });
        this.document = [...this.document, ...data];
      }
      );
  }

  deleteDocument(id, key) {
    this
      .$http
      .delete(`/shipment/${id}/items`)
      .then(() => this.document.splice(key, 1));
  }
}

angular.module('uiGenApp')
  .controller('shipmentsShowController', shipmentsShowController);
