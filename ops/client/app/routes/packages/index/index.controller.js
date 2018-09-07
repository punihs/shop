class PackagesIndexController {
  /* @ngInject */
  constructor(
    QCONFIG, $scope, $stateParams, $location, $state, Prototype,
    $rootScope, $timeout, $window, $http, moment, $uibModal, Session, ExcelDownload,
    ChangeState, Page, PackageFilter
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
    this.PackageFilter = PackageFilter;
    this.Session = Session;
    this.sorts = [
      { id: 1, name: 'Default', key: '-' },
      { id: 1, name: 'Update Date', key: 'updated_on DESC' },
      { id: 2, name: 'Upload Date', key: 'created_on DESC' },
    ];
    this.ExcelDownload = ExcelDownload;
    this.states = this.Session.read('states');
    this.ChangeState = ChangeState;
    this.$onInit();
  }

  $onInit() {
    this.facets = {};
    this.initializing = true;
    this.timeout = this.$timeout(() => {});

    this.buckets = this.QCONFIG.PACKAGE_STATES;

    this.$stateParams.bucket = this.$stateParams.bucket || this.$location.search().bucket;

    // Set default bucket to ALL
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('packages.index', { bucket: 'TASKS' });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.bucket} Packages`);

    this.packages = []; // collection of packages
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.xquery = '';
    this.params = {
      sort: '-',
      offset: 0,
      limit: 15,
      q: this.xquery || '',
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
            this.loadPackages(true);
          }, 800);
        }
      }
      , true,
    );

    // $emit coming from directive
    this.$scope.$on('loadMore', () => this.loadPackages());

    this.loadPackages();
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadPackages(true);
  }

  openPackageFilter() {
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
      .PackageFilter
      .open(filtered)
      .then(applied => {
        this.$state.transitionTo(
          this.$state.current.name,
          Object.assign(this.$stateParams, {
            sid: applied.states && applied.states.join(','),
          }),
          { notify: false },
        );
        this.$onInit();
      });
  }


  loadPackages(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.packages = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more packages to get
    this.ui = { lazyLoad: false, loading: true };
    this.params.q = this.xquery || '';

    if (this.$stateParams.bucket === 'Interview') {
      this.params.interview_time = [
        this.moment().startOf('day').toISOString(),
        this.moment().startOf('day').add(1, 'months')
          .toISOString(),
      ].join(',');
      this.params.fl += ',interview_time,interview_type';
    } else {
      this.params.bucket = this.$stateParams.bucket.replace(' ', '_').toUpperCase();
    }

    this.$http
      .get('/packages', { params: this.params })
      .then(({ data: { packages, total, facets } }) => {
        // Handle error for php error
        if (typeof packages === 'undefined') {
          if (!!refresh) this.packages = [];
          this.ui.lazyLoad = false;
          return;
        }
        console.log('url', packages[0].Customer);
        console.log('url', packages);

        if (!packages.length && this.$rootScope.previousState === 'access.oauth') {
          this.$state.go('packages.index', { bucket: 'ALL' });
          return;
        }
        this.packages.push(...packages);

        this.total = total;
        // data has been loaded
        this.ui.loading = false;

        // check for returned results count and set lazy loadLoad false if less
        this.ui.lazyLoad = angular.equals(packages.length, this.params.limit); //  =true/false

        // increment offset for next loading of results
        this.params.offset = this.params.offset + this.params.limit;

        if (facets) {
          this.facets.stateIds = Object.keys(facets.state_id)
            .filter(key => Number(facets.state_id[key])).map(Number);
        }
      })
      .catch(() => {
        if (!!refresh) this.packages = [];
        this.ui.lazyLoad = false;
      });
  }
}

angular.module('uiGenApp')
  .controller('PackagesIndexController', PackagesIndexController);
