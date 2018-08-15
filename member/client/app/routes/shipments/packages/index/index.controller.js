class ShipmentsPackagesIndexController {
  /* @ngInject */
  constructor(
    CONFIG, $stateParams, $filter, moment, $window, Page,
    shipment, $http, $state, Session, Prototype, ExcelDownload, ChangeState
  ) {
    this.CONFIG = CONFIG;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
    this.$window = $window;
    this.shipment = shipment;
    this.moment = moment;
    this.Session = Session;
    this.Prototype = Prototype;
    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Update Date', key: 'updated_on DESC' },
      { id: 2, name: 'Upload Date', key: 'created_on DESC' },
      { id: 3, name: 'Name', key: 'first_name DESC' },
    ];

    this.ExcelDownload = ExcelDownload;
    this.ChangeState = ChangeState;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.buckets = this.CONFIG.PACKAGE_STATES;

    this.shipment = this.shipment || {};
    this.Page.setTitle(`${this.shipment.Country.iso3 ? `${this.shipment.Country.iso3} - ` : ''} ${
      this.$stateParams.status ? this.$stateParams.status : ''} Packages`); // set page title

    // Set default status to ALL
    if (!this.buckets.includes(this.$stateParams.status)) {
      this.$state.go('shipment.packages.index', { status: 'ALL' });
      return;
    }
    this.packages = []; // collection of packages
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = {
      sort: '-',
      offset: 0,
      limit: 15,
      fl: 'id,name',
      sid: this.$stateParams.sid || '',
    }; // GET query params

    this.loadPackages(true); // get packages
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadPackages(true);
  }

  loadPackages(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.packages = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more shipments to get
    this.ui = { lazyLoad: false, loading: true };

    this.$http
      .get(`/shipments/${this.$stateParams.id}/packages`, { params: this.params })
      .then(({ data: { packages: result, total } }) => {
        this.packages.push(...result);

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
  getPackage(criteria = {}, returnkey = 'id') {
    return this.$filter('filter')(this.packages, criteria)
    .map((pkg) => pkg[returnkey]);
  }

  // sets value
  setChecked(state) {
    angular.forEach(this.packages, (value, key) => (this.packages[key].checked = state));
  }
}

angular.module('uiGenApp')
.controller('ShipmentsPackagesIndexController', ShipmentsPackagesIndexController);