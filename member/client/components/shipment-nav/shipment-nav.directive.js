
class ShipmentNavController {
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
    this.shipmentStates = this.Session.read('shipment-states');
    this.$onInit();
  }

  $onInit() {
    this.reset();
    this.getList(true);
    this.refreshList = this.getList.bind(this);
  }

  reset(fromSearch) {
    this.shipments = {
      active: [],
      dispatched: [],
      delivered: [],
    };

    this.collapse = {
      active: false,
      dispatched: false,
      delivered: false,
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

  getList(refresh = false, all = false, fromSearch = false) {
    if (!refresh && !this.ui.lazyLoad) return; // if no more customers to get
    if (refresh) this.reset(fromSearch);

    const IS_SHPR = this.params.virtual_address_code === 'SHPR-';

    this.ui = { lazyLoad: false, loading: true };

    const vaCode = 'virtual_address_code';
    this
      .$http
      .get('/shipments', { params: IS_SHPR ? _.omit(this.params, [vaCode]) : this.params })
      .then(({ data: { shipments, total, facets } }) => {
        this.total = total;
        this.facets = facets;
        if (refresh) Object.keys(this.shipments).forEach(k => (this.shipments[k] = []));
        shipments
          .forEach(j => {
            const shipment = j;

            // shipment.tooltip = `${shipment.Country.name} / ${shipment.City.name}`;

            // let list;
            // if (customer.Shipments.length) list = 'active';
            // else if (customer.Packages.length) list = 'dispatched';
            // else list = 'delivered';

            this.shipments[shipment.list || 'active'].push(shipment);
          });

        if (refresh) {
          this.collapse.inactive = !this.params.q;
          this.collapse.passive = !this.params.q;
        }
        this.ui.loading = false;
        this.ui.lazyLoad = this.params.rows === shipments.length;
        this.params.start += this.params.rows;

        // if (all && !this.shipments.length) this.getList(refresh, all);
      });
  }

  getLink(shipmentId) {
    const states = [
      'shipment.packages.index',
    ];

    const name = states.includes(this.$state.current.name)
      ? this.$state.current.name
      : states[0];

    const status = this.$state.params.status || 'ALL';

    return this.$state.href(name, { id: shipmentId, status });
  }
}

angular
  .module('uiGenApp')
  .directive('shipmentNav', () => ({
    templateUrl: 'components/shipment-nav/shipment-nav.html',
    restrict: 'E',
    controller: ShipmentNavController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {},
  }));
