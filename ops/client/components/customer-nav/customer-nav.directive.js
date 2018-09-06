
class CustomerNavController {
  /* @ngInject */
  constructor(
    $http, $state, $scope, $timeout, Session, Prototype, toaster
  ) {
    this.toaster = toaster;
    this.$http = $http;
    this.$state = $state;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.Session = Session;
    this.Prototype = Prototype;
    this.searchTypes = {
      email: { icon: 'at', label: 'Email' },
      virtual_address_code: { icon: 'dropbox', label: 'Virtual Address Code' },
      q: { icon: 'user', label: 'Name' },
    };
    this.searchType = this.Session.read('searchType') || 'virtual_address_code';

    this.$onInit();
  }

  $onInit() {
    this.reset();
    this.getList(true);
    this.refreshList = this.getList.bind(this);
  }

  reset(fromSearch) {
    this.customers = {
      shipments: [],
      packages: [],
      // orders: [],
      customers: [],
    };

    this.collapse = {
      shipments: false,
      packages: false,
      // orders: true,
      customers: false,
    };

    this.ui = { lazyLoad: true, loading: false };
    this.params = Object.assign(this.params || {}, {
      start: 0,
      rows: 30,
      fl: [
        'id,name',
      ].join(),
    });
    if (!fromSearch) this.params.virtual_address_code = 'SHPR-';
  }

  changeSearchType(nextSearchType) {
    const lastSearchType = this.searchType;

    if (nextSearchType === 'virtual_address_code') {
      if (this.params[lastSearchType] && !this.params[lastSearchType].startsWith('SHPR-')) {
        this.params[nextSearchType] = 'SHPR-';
      }
    } else if (lastSearchType === 'virtual_address_code') {
      if (this.params[lastSearchType] && this.params[lastSearchType].startsWith('SHPR-')) {
        this.params[nextSearchType] = '';
      } else {
        this.params[nextSearchType] = this.params[lastSearchType];
      }
    } else {
      this.params[nextSearchType] = this.params[lastSearchType];
    }

    this.searchType = nextSearchType;
    this.Session.create('searchType', this.searchType);
    $('input[name="customerSearch"]')[0].focus();
    return this.search(this.searchType);
  }

  search(type) {
    const searchTouched = this.searchTouched;

    if (this.params[type] === '' && searchTouched) return this.getList(true);
    if (this.params[type] === '' && !searchTouched) return null;
    if (type === 'email' && !this.Prototype.validateEmail(this.params.email)) return null;
    const vaCode = 'virtual_address_code';
    if (type === vaCode && this.params.virtual_address_code === 'SHPR-') return null;
    if (type === 'q') {
      const pattern = /^[a-zA-Z\s]+$/g;
      if (!pattern.test(this.params.q)) {
        return this.toaster.pop('error', 'Only alphabets allowed in Search by Name');
      }
    }

    this.searchTouched = !!(this.params[type] && this.params[type] !== '');

    const keys = Object.keys(this.searchTypes);

    // if blank
    if (!keys.some(x => (this.searchTypes[x] && this.params[x] !== ''))) return null;

    keys.forEach(x => {
      if (x !== type) {
        delete this.params[x];
      }
    });
    const fromSearch = true;
    return this.getList(true, false, fromSearch);
  }

  getList(refresh = false, all = false, fromSearch = false) {
    if (!refresh && !this.ui.lazyLoad) return; // if no more customers to get
    if (refresh) this.reset(fromSearch);

    const IS_SHPR = this.params.virtual_address_code === 'SHPR-';

    this.ui = { lazyLoad: false, loading: true };

    const vaCode = 'virtual_address_code';
    this
      .$http
      .get('/users', { params: IS_SHPR ? _.omit(this.params, [vaCode]) : this.params })
      .then(({ data: customers }) => {
        if (refresh) Object.keys(this.customers).forEach(k => (this.customers[k] = []));
        customers
          .forEach(j => {
            const customer = j;

            customer.tooltip = `${customer.name} / ${customer[vaCode]}${customer.is_member
              ? 'Member'
              : ''
            }`;

            let list;
            if (customer.Shipments.length) list = 'shipments';
            else if (customer.Packages.length) list = 'packages';
            // else if (customer.Orders.length) list = 'orders';
            else list = 'customers';

            this.customers[list].push(customer);
          });

        if (refresh) {
          this.collapse.inactive = !this.params.q;
          this.collapse.passive = !this.params.q;
        }
        this.ui.loading = false;
        this.ui.lazyLoad = this.params.rows === customers.length;
        this.params.start += this.params.rows;

        if (all && !this.customers.customers.length) this.getList(refresh, all);
      });
  }

  getLink(customerId) {
    const states = [
      'customer.shipments.index',
      'customer.packages.index',
      'customer.package.update',
      'customer.view',
      'customer.orders.list',
      'customer.orders.new',
      'customer.packages.new',
      'shipment.view',
      'shipment.packages.index',
    ];

    const name = states.includes(this.$state.current.name) ?
      this.$state.current.name
      : states[0];

    const status = this.$state.params.status || 'ALL';

    return this.$state.href(name, { id: customerId, status });
  }
}

angular
  .module('uiGenApp')
  .directive('customerNav', () => ({
    templateUrl: 'components/customer-nav/customer-nav.html',
    restrict: 'E',
    controller: CustomerNavController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {},
  }));
