class CustomersShipmentsIndexController {
  /* @ngInject */
  constructor(
    QCONFIG, $stateParams, $filter, moment, $window, Page,
    customer, $http, $state, Session, Prototype, ExcelDownload, ChangeShipmentState,
  ) {
    this.QCONFIG = QCONFIG;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
    this.$window = $window;
    this.customer = customer;
    this.moment = moment;
    this.Session = Session;
    this.Prototype = Prototype;
    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Update Date', key: 'updated_at DESC' },
      { id: 2, name: 'Created Date', key: 'created_at DESC' },
    ];

    this.ExcelDownload = ExcelDownload;
    this.ChangeShipmentState = ChangeShipmentState;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.todayDate = '';
    this.shipmentStateId = this.QCONFIG.SHIPMENT_STATE_IDS;
    this.buckets = this.QCONFIG.SHIPMENT_STATES;
    this.states = this.Session.read('shipment-states');

    this.customer = this.customer || {};
    this.Page.setTitle(`${this.customer.name ? `${this.customer.name} - ` : ''} ${
      this.$stateParams.bucket ? this.$stateParams.bucket : ''} Shipments`); // set page title

    // Set default status to ALL
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('customer.shipments.index', { bucket: 'IN_REVIEW' });
      return;
    }
    this.shipments = []; // collection of shipments
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = {
      sort: '-',
      offset: 0,
      limit: 15,
      fl: 'id,name',
      sid: this.$stateParams.sid || '',
      bucket: this.$stateParams.bucket,
    }; // GET query params

    this.loadShipments(true); // get shipments
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadShipments(true);
  }

  loadShipments(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.shipments = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more customers to get
    this.ui = { lazyLoad: false, loading: true };

    this.$http
      .get(`/users/${this.$stateParams.id}/shipments`, { params: this.params })
      .then(({ data: { shipments: result, total } }) => {
        this.shipments.push(...result);
        this.todayDate = new Date();
        this.shipments.map(shipmentData => {
          const shipment = shipmentData;
          const shipmentDate = new Date(shipment.ShipmentState.created_at);
          shipment.totalDays = Math.ceil((Math.abs(this.todayDate.getTime() -
            shipmentDate.getTime())) / (1000 * 3600 * 24));
          return shipment;
        });

        this.total = total;
        // data has been loaded
        this.ui.loading = false;

        // check for returned results count and set lazy loadLoad false if less
        this.ui.lazyLoad = angular.equals(result.length, this.params.limit);

        // increment offset for next loading of results
        this.params.offset = this.params.offset + this.params.limit;
      });
  }

  // returns array containing resultkey of search result
  getShipment(criteria = {}, returnkey = 'id') {
    return this.$filter('filter')(this.shipments, criteria)
      .map((shipment) => shipment[returnkey]);
  }

  // sets value
  setChecked(state) {
    angular.forEach(this.shipments, (value, key) => (this.shipments[key].checked = state));
  }
}

angular.module('uiGenApp')
  .controller('CustomersShipmentsIndexController', CustomersShipmentsIndexController);
