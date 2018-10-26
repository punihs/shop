class CustomersPackagesIndexController {
  /* @ngInject */
  constructor(
    QCONFIG, $stateParams, $filter, moment, $window, Page,
    customer, $http, $state, Session, Prototype, ExcelDownload, ChangeState
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
    this.ChangeState = ChangeState;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.todayDate = '';
    this.buckets = this.QCONFIG.PACKAGE_STATES;
    this.packageStateId = this.QCONFIG.PACKAGE_STATE_IDS;
    this.customer = this.customer || {};
    this.customer.create = this.$stateParams.create;
    this.Page.setTitle(`${this.customer.name ? `${this.customer.name} - ` : ''} ${
      this.$stateParams.bucket ? this.$stateParams.bucket : ''} Packages`); // set page title

    // Set default status to ALL
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('customer.packages.index', { bucket: 'TASKS' });
      return;
    }

    this.packages = []; // collection of packages
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = {
      sort: '-',
      offset: 0,
      limit: 15,
      fl: 'id,name',
      bucket: this.$stateParams.bucket.replace(' ', '_').toUpperCase(),
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

    if (!this.ui.lazyLoad) return; // if no more customers to get
    this.ui = { lazyLoad: false, loading: true };

    this.$http
      .get(`/users/${this.$stateParams.id}/packages`, { params: this.params })
      .then(({ data: { packages: result, total } }) => {
        this.packages.push(...result);
        this.todayDate = new Date();
        this.packages.map(packageData => {
          const packages = packageData;
          const packageDate = new Date(packages.created_at);
          packages.totalDays = Math.ceil((Math.abs(this.todayDate.getTime() -
            packageDate.getTime())) / (1000 * 3600 * 24));
          return packages;
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
  getPackage(criteria = {}, returnkey = 'id') {
    return this.$filter('filter')(this.packages, criteria)
      .map(pkg => pkg[returnkey]);
  }

  // sets value
  setChecked(state) {
    angular.forEach(this.packages, (value, key) => (this.packages[key].checked = state));
  }
}

angular.module('uiGenApp')
  .controller('CustomersPackagesIndexController', CustomersPackagesIndexController);
