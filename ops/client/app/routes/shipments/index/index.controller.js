class ShipmentsIndexController {
  /* @ngInject */
  constructor(
    QCONFIG, $scope, $stateParams, $location, $state, Prototype,
    $rootScope, $timeout, $window, $http, moment, $uibModal, Session, ExcelDownload,
    ChangeShipmentState, Page, ShipmentFilter
  ) {
    this.Page = Page;
    this.QCONFIG = QCONFIG;
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$location = $location;
    this.$state = $state;
    this.Prototype = Prototype;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$http = $http;
    this.moment = moment;
    this.$uibModal = $uibModal;
    this.ShipmentFilter = ShipmentFilter;
    this.Session = Session;
    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Update Date', key: 'updated_on DESC' },
      { id: 2, name: 'Upload Date', key: 'created_on DESC' },
      { id: 3, name: 'CTC', key: 'expected_ctc DESC' },
      { id: 4, name: 'Notice Period', key: 'notice_period ASC' },
    ];
    this.ExcelDownload = ExcelDownload;
    this.states = this.Session.read('shipment-states');
    this.ChangeShipmentState = ChangeShipmentState;
    this.$onInit();
  }

  $onInit() {
    this.facets = {};
    this.initializing = true;
    this.timeout = this.$timeout(() => {});

    this.buckets = this.QCONFIG.SHIPMENT_STATES;

    this.$stateParams.status = this.$stateParams.status || this.$location.search().status;

    // Set default status to ALL
    if (!this.buckets.includes(this.$stateParams.status)) {
      this.$state.go('shipments.index', { status: 'ALL' });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.status} Shipments`);

    this.shipments = []; // collection of shipments
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.xquery = '';
    this.params = { sort: '-', offset: 0, limit: 15, q: this.xquery || '',
      fl: 'id,name,state_id,state_name',
      sid: this.$stateParams.sid || '',
    };

    // Search
    this.$scope.$watch(
      () => this.xquery,
      () => {
        if (this.initializing) {
          this.$timeout(() => { this.initializing = false; }); // First time watcher not calling
        } else {
          this.$timeout.cancel(this.timeout); // cancel the last timeout
          // to avoid calling loadMore() on loading of page

          this.timeout = this.$timeout(() => {
            this.loadShipments(true);
          }, 800);
        }
      }
      , true);

    // $emit coming from directive
    this.$scope.$on('loadMore', () => this.loadShipments());

    this.loadShipments();
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadShipments(true);
  }

  openShipmentFilter() {
    const selected = {
      states: (this.$stateParams.sid || '').split(',').map(Number),
    };

    const filtered = {
      all: {
        states: this.facets.stateIds.map(id => ({
          id,
          name: this.states.filter(state => (state && (state.id === Number(id))))[0].action,
          checked: selected.states.includes(Number(id)),
        })),
      },
    };

    this
      .ShipmentFilter
      .open(filtered)
      .then(applied => {
        this.$state.transitionTo(this.$state.current.name,
          Object.assign(this.$stateParams, {
            sid: applied.states && applied.states.join(','),
          }),
          { notify: false });
        this.$onInit();
      });
  }


  loadShipments(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.shipments = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more shipments to get
    this.ui = { lazyLoad: false, loading: true };
    this.params.q = this.xquery || '';

    if (this.$stateParams.status === 'Interview') {
      this.params.interview_time = [
        this.moment().startOf('day').toISOString(),
        this.moment().startOf('day').add(1, 'months')
          .toISOString(),
      ].join(',');
      this.params.fl += ',interview_time,interview_type';
    } else {
      this.params.status = this.$stateParams.status.replace(' ', '_').toUpperCase();
    }

    this.$http
      .get('/shipments', { params: this.params })
      .then(({ data: { shipments, total, facets } }) => {
        // Handle error for php error
        if (typeof shipments === 'undefined') {
          if (!!refresh) this.shipments = [];
          this.ui.lazyLoad = false;
          return;
        }

        if (!shipments.length && this.$rootScope.previousState === 'access.oauth') {
          this.$state.go('shipments.index', { status: 'ALL' });
          return;
        }
        this.shipments.push(...shipments);

        this.total = total;
        // data has been loaded
        this.ui.loading = false;

        // check for returned results count and set lazy loadLoad false if less
        this.ui.lazyLoad = angular.equals(shipments.length, this.params.limit); //  =true/false

        // increment offset for next loading of results
        this.params.offset = this.params.offset + this.params.limit;

        if (facets) {
          this.facets.stateIds = Object.keys(facets.state_id)
            .filter(key => Number(facets.state_id[key])).map(Number);
        }
      })
      .catch(() => {
        if (!!refresh) this.shipments = [];
        this.ui.lazyLoad = false;
      });
  }
}

angular.module('uiGenApp')
  .controller('ShipmentsIndexController', ShipmentsIndexController);
