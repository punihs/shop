class JobsListController {
  /* @ngInject */
  constructor(
    $http, $state, $rootScope, $window, $location, $timeout, $stateParams, $filter,
    $uibModal, toaster, AllocationDisable, QuarcService, QCONFIG, Session, JobSuggest,
    Prototype, ListModal, RejectJob
  ) {
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
    this.AllocationDisable = AllocationDisable;
    this.QuarcService = QuarcService;
    this.QCONFIG = QCONFIG;
    this.ALL_STATUS = this.QCONFIG.MANAGE_JD_STATES;
    this.Page = this.QuarcService.Page;
    this.Session = Session;
    this.JobSuggest = JobSuggest;
    this.Prototype = Prototype;
    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this.ListModal = ListModal;
    this.RejectJob = RejectJob;
    this
      .$rootScope
      .$on('AdminView', () => {
        this.isAdmin = this.Session.read('ROLE_ADMIN');
        if (this.JobSuggest.enabled) return this.$state.go('jobs.suggestions');
        return $timeout(() => {
          if (['jobs.list', 'jobs.suggestions'].includes(this.$state.current.name)) {
            this.$state.go('jobs.list', { status: 'All' });
          }
        });
      });

    if (this.JobSuggest.enabled) this.$state.go('jobs.suggestions');
    else this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    this.facet = {};
    this.PAGE_STATUS = this.$state.params.status;
    if (!~this.ALL_STATUS.indexOf(this.PAGE_STATUS)) {
      return this.$state.go('jobs.list', { status: this.ALL_STATUS[0] });
    }

    this.Page.setTitle(`${this.$state.params.status} - Jobs`);

    this.list = [];
    this.ui = { lazyLoad: false, loading: false };
    this.params = { start: 0, offset: 0, limit: 100, rows: 100, q: '' };

    this.loadFacets();
    return this
      .AllocationDisable
      .check()
      .then(disabled => {
        this.ui.lazyLoad = !disabled;
        if (disabled) return this.AllocationDisable.open();
        if (this.isAdmin) return this.getProxy(true);
        return this.getProxy();
      });
  }

  loadFacets() {
    this.$http
      .get('/jobs/facets')
      .then(({ data: { users, positions, priorities, payments, clients } }) => {
        this.facet = {};

        if (users && positions && clients) {
          this.facet.users = users.map(i => Object.assign(i, {
            checked: (this.$stateParams.uid &&
              this.$stateParams.uid.split(',').includes(`${i.id}`)),
          }));

          this.facet.positions = positions.map(i => Object.assign(i, {
            checked: (this.$stateParams.r &&
              this.$stateParams.r.split(',').includes(`"${i.role}"`)),
          }));

          this.facet.clients = clients.map(i => Object.assign(i, {
            checked: (this.$stateParams.cid &&
              this.$stateParams.cid.split(',').includes(`${i.id}`)),
          }));
        }

        this.facet.priorities = priorities.map(i => Object.assign(i, {
          checked: (this.$stateParams.js &&
            this.$stateParams.js.split(',').includes(`${i.id}`)),
        }));

        this.facet.payments = payments.map(i => Object.assign(i, {
          checked: (this.$stateParams.pid &&
            this.$stateParams.pid.split(',').includes(`${i.id}`)),
        }));
      });
  }

  setParams() {
    this.$state.transitionTo('jobs.list', this.$stateParams, { notify: false });
  }

  getProxy(refresh) {
    const method = (this.isAdmin && 'getJobs') || 'getList';
    return this[method](refresh);
  }

  getJobs(refresh) {
    if (refresh) {
      this.list = [];
      this.params.start = 0;
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.ui.loading = false;
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return; // if no more jobs to get
    this.ui.lazyLoad = false;
    this.ui.loading = true;

    this.params.status = this.$stateParams.status.replace(' ', '_').toUpperCase();
    this.params.uid = this.$stateParams.uid;
    this.params.cid = this.$stateParams.cid;
    this.params.pid = this.$stateParams.pid;
    this.params.js = this.$stateParams.js;
    this.params.r = this.$stateParams.r;
    this.params.min = this.$stateParams.min;
    this.params.max = this.$stateParams.max;

    this.$timeout.cancel(this.timeout); // cancel the last timeout

    // to avoid calling loadMore() on loading of page
    this.timeout = this.$timeout(() => {
      this
        .$http
        .get('/jobs/allocationStatusNew', { params: this.params })
        .then(response => {
          // Handle error for php error
          if (typeof response === 'undefined') {
            if (refresh) this.list = [];
            this.ui.lazyLoad = false;
            return;
          }

          const jobs = response.data.jobs;
          jobs.forEach(j => {
            const job = j;
            job.JobAllocation = [];
            for (let i = 0; i < job.allocation_id.length; i++) {
              job.JobAllocation.push({
                id: job.allocation_id[i],
                user_id: job.allocation_user_id[i],
                user_name: job.allocation_user_name[i],
              });
            }
            this.list.push(job);
          });

          // data has been loaded
          this.ui.loading = false;

          // check for returned results count and set lazy loadLoad false if less
          this.ui.lazyLoad = angular.equals(this.list.length, this.params.limit);

          // increment offset for next loading of results
          this.params.offset = this.params.offset + this.params.limit;
        })
        .catch(() => {
          this.ui.loading = false;
          this.toaster.pop(this.QuarcService
            .toast('error', 'There was problem loading data. Please contact QuezX team'));

          if (refresh) this.list = [];
          this.ui.lazyLoad = false;
        });
    }, 500);
  }

  getList(refresh = false) {
    Object.assign(this.params, this.$stateParams);
    if (refresh) {
      this.list = [];
      this.params.start = 0;
      this.ui.lazyLoad = true;
      this.ui.loading = false;
      this.$window.scrollTo(0, 0);
    }

    if (!this.ui.lazyLoad) return;

    this.ui.lazyLoad = false;
    this.ui.loading = true;
    this.params.status = this.PAGE_STATUS.toUpperCase();

    this
      .$http
      .get('/jobAllocations', { params: this.params })
      .then(({ data: { jobs, meta: { jobsCount, noob } } }) => {
        if (!this.params.start) {
          // intialize with null values so .reduce don't break
          this.counts = new Array(this.ALL_STATUS.length).fill(null);
          jobsCount.map(b => (this.counts[b.id] = b.count));
          this.counts[4] = this.counts.reduce((a, b) => (a + b));
          this.noob = noob;
        }

        this.ui.loading = false;
        this.ui.lazyLoad = (jobs.length === this.params.rows);
        this.params.start += this.params.rows;

        jobs.forEach(job => {
          // sort by response id (1, 2, 3, Other(0,null, etc)) and tie => id
          const [allo] = JSON
            .parse(job.allocations || '[{}]')
            .sort((a, b) => ((b.response_id === a.response_id)
              ? (b.id > a.id)
              : ((b.response_id || 5) < (a.response_id || 5))));

          this.list.push(Object.assign({
            allocation_id: allo.id,
            user_id: allo.user_id,
            response_id: allo.response_id || 0,
          }, job));
        });
      })
      .catch(() => (this.ui.loading = false));
  }

  acceptJD(job, original, value) {
    const admin = this.user.admin_flag;
    if (!job.open_platform || !admin) return this.update(job, original, value);

    return this
      .ListModal
      .open({
        title: 'Client Commercials',
        description: 'Commercials for JD :',
        list: this.JobSuggest.getPayment(job),
        notes: [
          'The above commercials are subject to change.' +
          'Please check the commercials while uploading the CV.',
        ],
      })
      .then(res => {
        if (res) this.update(job, original, value);
      });
  }

  rejectJD(job, original, value) {
    return this
      .RejectJob
      .open(job)
      .then(x => this.update(Object.assign(x, job), original, value));
  }

  update(jobHash, original, value) {
    const job = jobHash;
    const OLD_RESPONSE = Number(original);
    if (value) job.response_id = value;
    const NEW_RESPONSE = Number(job.response_id);
    const data = {
      id: job.allocation_id,
      job_id: job.id,
      response_id: NEW_RESPONSE,
      commit_cv_count: job.commit_cv_count,
      FeedbackResponses: job.FeedbackResponses,
    };

    this
      .$http
      .post('/jobAllocations', data)
      .then(() => {
        // so count for new bucket alway positive
        if (this.counts[OLD_RESPONSE]) this.counts[OLD_RESPONSE]--;
        this.counts[NEW_RESPONSE]++;

        this.list.splice(this.list.findIndex(l => (l.id === job.id)), 1);
        this.toaster.pop(this.QuarcService
          .toast('success', `${job.client_name} - ${job.role} - status changed to ${
            ['Accepted', 'Hidden', 'Rejected'][value - 1]
          }`));
        // reload new allocations for noobs ON action
        if (this.noob && (this.PAGE_STATUS === 'New')) this.getProxy(true);
      })
      .catch(() => {
        this.toaster.pop(this.QuarcService
          .toast('error', 'There was problem updating consultatnt response.'));
      });
  }

  orderBy(field) {
    this.order = (this.order === field)
      ? `-${field}`
      : field;
  }

  /*  Filters added over here */
  facetFilter(facetHash, property, propName) {
    const facet = facetHash;
    facet.checked = !facet.checked;
    this.$stateParams[propName] = [];
    this.facet[property].forEach(p => {
      if (p.checked) { this.$stateParams[propName].push(p.id); }
    });
    this.$stateParams[propName] = this.$stateParams[propName].join(',');
    this.setParams();
    this.getProxy(true);
  }

  filterReset(list, key) {
    if (!list) {
      Object.assign(this.$stateParams, { min: undefined, max: undefined });
      this.setParams();
      this.getProxy(true);
      return;
    }

    list.forEach((i) => {
      const item = i;
      item.checked = false;
    });
    this.$stateParams[key] = undefined;
    this.setParams();
    this.getProxy(true);
  }

  allocate(id) {
    // ApplicantIds is array containing applicant id to download cvs
    const jobId = [];
    if (!id) this.list.forEach((job) => job.checked && jobId.push(job.id));

    this
      .$uibModal
      .open({
        templateUrl: 'app/directives/allocate-to/allocate-to.html',
        controller: 'AllocateToController',
        controllerAs: '$ctrl',
        windowClass: 'allocate-window',
        size: 'lg',
        resolve: {
          jobid: () => (id && [id]) || jobId,
        },
      });
  }

  selectAll(isChecked) {
    this.list.forEach((i) => {
      const item = i;
      item.checked = isChecked;
    });
  }

  showAllocate() {
    const checked = this.$filter('filter')(this.list, { checked: true });
    return checked && checked.length > 1 || 0;
  }
}

angular.module('uiGenApp')
  .controller('JobsListController', JobsListController);
