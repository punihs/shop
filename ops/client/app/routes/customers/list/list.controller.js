class CustomersListController {
  /* @ngInject */
  constructor(
    $http, $state, $rootScope, $window, $location, $timeout, $stateParams, $filter,
    $uibModal, toaster, QCONFIG, Session, Prototype, ListModal, Page, URLS, LoginAs) {
    this.URLS = URLS;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$location = $location;
    this.$timeout = $timeout;
    this.$stateParams = $stateParams;
    this.$filter = $filter;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.QCONFIG = QCONFIG;
    this.GROUPS = this.QCONFIG.USER_GROUPS;
    this.Session = Session;
    this.Prototype = Prototype;
    this.ListModal = ListModal;
    this.LoginAs = LoginAs;

    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Last Update', key: 'updated_at DESC' },
      { id: 2, name: 'Signup', key: 'created_at DESC' },
      { id: 3, name: 'Name', key: 'first_name DESC' },
    ];

    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    this.facet = {};
    this.groupId = this.$state.params.groupId;
    if (!this.GROUPS.map(x => x.id).includes(Number(this.groupId))) {
      return this.$state.go('customers.list', { groupId: this.GROUPS[1].id });
    }

    this.Page.setTitle(this.$stateParams.groupId === 1 ? 'Admins' : 'Customers');

    this.list = [];
    this.ui = { lazyLoad: false, loading: false };
    this.params = { start: 0, offset: 1, limit: 10, q: '', group_id: this.groupId };

    this.loadFacets();
    return this.getCustomers(true);
  }

  loadFacets() {
    this.facet = {
      facet_queries: {},
      facet_fields: { job_location_sf: ['Mumbai', 3, 'Bangalore', 1] },
      facet_dates: {},
      facet_ranges: {},
      facet_intervals: {},
      facet_heatmaps: {},
    };
  }

  setParams() {
    this.$state.transitionTo('customers.list', this.$stateParams, { notify: false });
  }

  getCustomers(refresh) {
    if (this.params.email && !this.Prototype.validateEmail(this.params.email)) return null;
    if (refresh) {
      this.list = [];
      this.params.start = 0;
      this.params.offset = 10;
      this.ui.lazyLoad = true;
      this.ui.loading = false;
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return null; // if no more customers to get
    this.ui.lazyLoad = false;
    this.ui.loading = true;

    // this.params.status = this.$stateParams.status.replace(' ', '_').toUpperCase();

    this.$timeout.cancel(this.timeout); // cancel the last timeout

    // to avoid calling loadMore() on loading of page
    this.timeout = this.$timeout(() => {
      this
        .$http
        .get('/users', { params: this.params })
        .then(response => {
          // Handle error for php error
          if (typeof response === 'undefined') {
            if (refresh) this.list = [];
            this.ui.lazyLoad = false;
            return;
          }

          const customers = response.data;
          customers.forEach(j => {
            const customer = j;
            this.list.push(customer);
          });

          // data has been loaded
          this.ui.loading = false;

          // increment offset for next loading of results
          this.params.offset = this.params.offset + this.params.limit;
          // this.params.offset = this.params.offset + this.params.limit;

          // check for returned results count and set lazy loadLoad false if less
          this.ui.lazyLoad = angular.equals(customers.length, this.params.limit);
          this.params.start = this.params.start + this.params.limit;
        })
        .catch(() => {
          this.ui.loading = false;
          this.toaster.pop('error', 'There was problem loading data. Please contact ShoppRe team');

          if (refresh) this.list = [];
          this.ui.lazyLoad = false;
        });
    }, 500);

    return null;
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.getCustomers(true);
  }
}

angular.module('uiGenApp')
  .controller('CustomersListController', CustomersListController);
