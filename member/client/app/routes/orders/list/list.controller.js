class OrdersListController {
  /* @ngInject */
  constructor(
    QCONFIG, QuarcService, $stateParams, $filter, moment, $window,
    $http, $state, Session, Prototype, ExcelDownload, ChangeState, URLS
  ) {
    this.QCONFIG = QCONFIG;
    this.QuarcService = QuarcService;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
    this.$window = $window;
    this.moment = moment;
    this.Session = Session;
    this.Prototype = Prototype;
    this.URLS = URLS;
    this.token = Session.getAccessToken();
    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Update Date', key: 'updated_on DESC' },
      { id: 2, name: 'Upload Date', key: 'created_on DESC' },
      { id: 3, name: 'CTC', key: 'expected_ctc DESC' },
      { id: 4, name: 'Notice Period', key: 'notice_period ASC' },
    ];
    this.ExcelDownload = ExcelDownload;
    this.ChangeState = ChangeState;
    this.$onInit();
  }

  $onInit() {

    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this.clientId = this.Session.read('userinfo').client_id;
    this.Page = this.QuarcService.Page;
    this.buckets = this.QCONFIG.ORDER_STATES;

    this.Page.setTitle('Orders'); // set page title

    this.orders = []; // collection of orders
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = {
      sort: '-', offset: 0, limit: 15,
      fl: 'store_name',
    }; // GET query params

    this.loadOrders(); // get orders
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadOrders(true);
  }

  loadOrders(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.orders = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more jobs to get
    this.ui = { lazyLoad: false, loading: true };

    this.$http
      .get('/orders')
      .then(({ data: { items, total }}) => {
        items.forEach(order => this.orders.push(order));

        this.total = total;
        // data has been loaded
        this.ui.loading = false;

        // check for returned results count and set lazy loadLoad false if less
        this.ui.lazyLoad = angular.equals(items.length, this.params.limit);

        // increment offset for next loading of results
        this.params.offset = this.params.offset + this.params.limit;
      });

  }

  // returns array containing resultkey of search result
  getOrder(criteria = {}, returnkey = 'id') {
    return this.$filter('filter')(this.orders, criteria)
    .map((order) => order[returnkey]);
  }

  // sets value
  setChecked(state) {
    angular.forEach(this.orders, (value, key) => (this.orders[key].checked = state));
  }
}

angular.module('uiGenApp')
.controller('OrdersListController', OrdersListController);
