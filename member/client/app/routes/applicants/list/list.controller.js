class ApplicantsListController {
  /* @ngInject */
  constructor(
    QCONFIG, $scope, QuarcService, $stateParams, $location, $state, Prototype,
    $rootScope, $timeout, $window, $http, moment, $uibModal, prescreen, Session, ExcelDownload,
    ChangeState
  ) {
    this.QCONFIG = QCONFIG;
    this.$scope = $scope;
    this.QuarcService = QuarcService;
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
    this.prescreen = prescreen;
    this.Session = Session;
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
    this.initializing = true;
    this.timeout = this.$timeout(() => {});
    this.Page = this.QuarcService.Page;

    this.buckets = this.QCONFIG.APPLICANT_STATES;

    this.$stateParams.status = this.$stateParams.status || this.$location.search().status;

    // Set default status to ALL
    if (!~this.buckets.indexOf(this.$stateParams.status)) {
      this.$state.go('applicants.list', { status: 'Tasks' });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.status} Applicants`);

    this.applicants = []; // collection of applicants
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.xquery = '';
    this.params = { sort: '-', offset: 0, limit: 15, q: this.xquery || '',
      fl: 'id,name,mobile,email,state_id,state_name,_root_,' +
      'client_name,exp_designation,owner_id,notice_period,expected_ctc',
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
            this.loadApplicants(true);
          }, 800);
        }
      }
      , true);

    // $emit coming from directive
    this.$scope.$on('loadMore', () => this.loadApplicants());

    this.loadApplicants();
  }

  sort(sortBy) {
    this.params.sort = sortBy;
    this.loadApplicants(true);
  }

  loadApplicants(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.applicants = [];

      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more applicants to get
    this.ui = { lazyLoad: false, loading: true };
    this.params.q = this.xquery || '';
    this.params.ctc_range = this.$stateParams.ctc_range || '';
    this.params.notice_period = this.$stateParams.notice_period || '';

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
      .get(`/clients/${this.clientId}/users`)
      .then(({ data }) => {
        const hash = {};
        data.forEach(d => (hash[d.id] = d.name));
        this.$http
          .get('/applicants', {params: this.params})
          .then(({data: {applicants, total}}) => {
            // Handle error for php error
            if (typeof applicants === 'undefined') {
              if (!!refresh) this.applicants = [];
              this.ui.lazyLoad = false;
              return;
            }

            if (!applicants.length && this.$rootScope.previousState === 'access.oauth') {
              this.$state.go('applicants.list', {status: 'ALL'});
              return;
            }

            applicants.forEach(applicant => {
              applicant.owner_name = this.Prototype.initials(hash[applicant.owner_id]);
              applicant.owner_name_full = hash[applicant.owner_id];
              this.applicants.push(applicant);
            });

            this.total = total;
            // data has been loaded
            this.ui.loading = false;

            // check for returned results count and set lazy loadLoad false if less
            this.ui.lazyLoad = angular.equals(applicants.length, this.params.limit); //  =true/false

            // increment offset for next loading of results
            this.params.offset = this.params.offset + this.params.limit;
          })
          .catch(err => {
            console.log('There was problem loading data. Please contact QuezX team', err);
            if (!!refresh) this.applicants = [];
            this.ui.lazyLoad = false;
          });
      });
  }
}

angular.module('uiGenApp')
.controller('ApplicantsListController', ApplicantsListController);
