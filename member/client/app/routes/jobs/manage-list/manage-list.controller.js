class JobsManageListController {
  /* @ngInject */
  constructor(
    $http, $state, $rootScope, $window, $location, $timeout, $stateParams, $filter,
    $uibModal, toaster, AllocationDisable, QuarcService, QCONFIG, Session, Prototype,
    JobSuggest, RejectJob, $scope
  ) {
    this.$http = $http;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$scope = $scope;
    this.$location = $location;
    this.$timeout = $timeout;
    this.$stateParams = $stateParams;
    this.$filter = $filter;
    this.$uibModal = $uibModal;
    this.toaster = toaster;
    this.AllocationDisable = AllocationDisable;
    this.QuarcService = QuarcService;
    this.QCONFIG = QCONFIG;
    this.ALL_STATUS = this.QCONFIG.MANAGE_JD_STATES;
    this.Page = this.QuarcService.Page;
    this.Session = Session;
    this.Prototype = Prototype;
    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this.JobSuggest = JobSuggest;
    this.RejectJob = RejectJob;

    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    this.facet = {};
    this.MANAGELIST_STATES = [];
    this.collapse = {
      client: false,
      position: true,
    };
    this.jobStatusMap = {
      Passive: '1,2',
      Active: '1,2',
      Qdirect: '1,2',
      Inactive: '3,4',
    };
    const manageTab = {
      Qdirect: 0,
      Active: 0,
      Passive: 0,
      Inactive: 0,
    };

    this.filter = {
      client_name_sf: {},
    };

    this.$scope.$watch(() => ({
      j: this.filter,
    }), () => {
      this.timeout = this.$timeout(() => {
        const qArr = {};
        const query = this.filter;

        Object.keys(query).forEach((field) => {
          const selectedFacet = Object.keys(query[field])
            .filter(innerKey => query[field][innerKey]);
          qArr[field] = selectedFacet.length
            ? `("${selectedFacet.join('" OR "')}")`
            : '*';
        });

        Object.assign(this.params, qArr);
        this.getList(true);
      }, 300);
    }, true);

    this.MANAGELIST_STATES = this.MANAGELIST_STATES.concat(Object.keys(manageTab).map(key => ({
      title: key,
      count: manageTab[key],
    })));

    this.PAGE_STATUS = this.$state.params.status;

    this.Page.setTitle(`${this.$state.params.status}`);

    this.list = [];

    this.facet_fields = {};
    this.reset();
    this.userNameMap = {};
    this.userList();

    this.refreshList = this.getList.bind(this);
  }

  userList() {
    this.$http
      .get('/users', { params: { suspend_status: '0,1' } })
      .then(({ data }) => {
        data.forEach(v => this.userNameMap[v.id] = v.name);
      });
  }

  allocateUser(job, userId) {
    const endpoint = (job.open_platform && '/direct') || '';
    this
      .$http
      .post(`/jobSuggestions${endpoint || ''}`, { user_id: userId, job_id: job.id })
      .then(() => {
        const index = job.passiveUsers.indexOf(userId);
        job.passiveUsers.splice(index, 1);
        (job.activeUsers || []).push(userId);
      })
      .catch((err) => {
        this.toaster
          .pop(this.QuarcService.toast('error', err.data.message));
      });
  }

  deallocateUser(job, userId) {
    this
      .$http
      .delete(`/jobSuggestions/${job.id}`, {
        params: { user_id: userId },
      })
      .then(() => {
        const index = job.activeUsers.indexOf(userId);
        job.activeUsers.splice(index, 1);
      })
      .catch((err) => {
        this.toaster
          .pop(this.QuarcService.toast('error', err.data.message));
      });
  }

  reset() {
    this.jobs = [];
    this.ui = { lazyLoad: true, loading: false };

    this.params = Object.assign(this.params || {}, {
        start: 0,
        rows: 15,
        fl: [
          'id,client_name,owner_id',
          'role,job_status_id,consultant_score',
          'open_platform,max_sal,min_sal,max_exp',
          'min_exp,consultant_score,job_location,qrex_client_name'
          ].join(),
        job_status_id: this.jobStatusMap[this.PAGE_STATUS],
        facet: true,
      })
  }

  getList(refresh = false) {
    const query = ['Active', 'Qdirect'].includes(this.PAGE_STATUS)
      ? { open_platform : this.PAGE_STATUS === 'Qdirect' }
      : {};

    if (!refresh && !this.ui.lazyLoad) return;
    if (refresh) this.reset();
    this.ui = { lazyLoad: false, loading: true };

    this
      .$http
      .get('/jobSuggestions/jobs', { params: Object.assign( {}, this.params, query ) })
      .then(({ data: { data = [], facetCounts = {} } }) => {

        if (!data.length) {
          this.ui.loading = false;
          this.ui.lazyLoad = false;
          return;
        }

        this.facet_fields = facetCounts.facet_fields;
        let stopLazyLoad = false;
        switch (this.PAGE_STATUS) {
          case 'Qdirect':
          case 'Active':
            stopLazyLoad = data.some(v => v.active === false);
            data = data.filter(v => v.active);
            break;
          case 'Passive':
            data = data.filter(v => !v.active);
            break;
          default:
            break;
        }

        this.jobs = (this.jobs || []).concat(data);
        this.ui.loading = false;
        this.ui.lazyLoad = stopLazyLoad ? !stopLazyLoad : !!data.length;
        this.params.start += this.params.rows;
      });
  }
}

angular.module('uiGenApp')
  .controller('JobsManageListController', JobsManageListController);
