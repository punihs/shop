class NavigationJobsController {
  /* @ngInject */
  constructor($http, $state, $timeout, $scope, $window, AllocationDisable, Session) {
    this.$http = $http;
    this.$state = $state;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.$window = $window;
    this.AllocationDisable = AllocationDisable;
    this.Session = Session;
    this.$onInit();
  }

  $onInit() {
    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this
      .$scope
      .$on('AdminView', () => {
        this.isAdmin = this.Session.read('ROLE_ADMIN');
      });
    this.initializing = true;
    this.timeout = this.$timeout(() => {});
    this.jobs = []; // collection of jobs
    this.searchResults = []; // collection of searched jobs
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.searchTerm = '';
    // GET query params
    this.params = {
      offset: 0, limit: 20, fl: 'id,role,job_status,owner_id,open_platform', meta: true,
    };
    this.params.status = 'OPEN,HIGH_PRIORITY';
    this.toggleFlag = 1;
    // Accordion Expand/ Collapse
    this.$scope.$watch(() => this.toggleFlag, () => {
      if (this.initializing) return this.$timeout(() => (this.initializing = false));
      switch (this.toggleFlag) {
        case 1:
          this.params.status = 'OPEN,HIGH_PRIORITY';
          break;
        case 2:
          this.params.status = 'HOLD';
          break;
        case 3:
          this.params.status = 'CLOSED';
          break;
        default:
      }
      this.$timeout.cancel(this.timeout); // cancel the last timeout
      // to avoid calling loadMore() on loading of page
      this.jobs = [];
      this.timeout = this.$timeout(() => this.loadJobs(true), 50);
      return this.timeout;
    }, true);

    this.$scope.$watch(() => ({ a: this.searchTerm }), () => {
      if (this.initializing) return this.$timeout(() => (this.initializing = false));

      this.$timeout.cancel(this.timeout);
      this.jobs = [];
      delete this.params.status;
      this.timeout = this.$timeout(() => this.loadJobs(true), 50);
      return this.timeout;
    }, true);

    this
      .AllocationDisable
      .check()
      .then(disabled => (this.DISABLE_MANAGE = disabled));

    this
      .$http
      .get('/jobs/allocationStatusNewCount')
      .then(({ data }) => (this.newJobCount = data.count));
    this.loadJobs();
  }

  jobHref(jobId) {
    const states = ['job.applicants', 'job.applicants.new', 'job.references.list',
      'job.interviews.list', 'job.view'];
    const name = ~states.indexOf(this.$state.current.name) ? this.$state.current.name : states[0];
    // Todo: Temporary Hack
    const queryParams = this.$state.params.status ? `?status=${this.$state.params.status}` : '';
    return this.$state.href(name, { jobId }, { absolute: true }) + queryParams;
  }

  toggle(index) {
    this.toggleFlag = (this.toggleFlag === index)
      ? !this.toggleFlag
      : index;
  }

  loadJobs(refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.jobs = [];
      // Move to top if fresh request required
      this.$window.scrollTo(0, 0);
    }
    if (!this.ui.lazyLoad) return; // if no more jobs to get
    this.ui = { lazyLoad: false, loading: true };
    this.params.query = this.searchTerm;
    const firstPage = this.params.offset === 0; // return true
    this.$http
      .get('/jobs', { params: this.params })
      .then(({ data: response }) => {
        if (!response) {
          if (refresh) this.jobs = [];
          this.ui.lazyLoad = false;
          return;
        }
        if (firstPage) this.meta = response.meta;
        this.jobs.push(...response.jobs);
        // data has been loaded
        this.ui.loading = false;
        // check for returned results count and set lazy loadLoad false if less
        this.ui.lazyLoad = (response.jobs.length === this.params.limit);
        // increment offset for next loading of results
        this.params.offset += this.params.limit;
      })
      .catch(() => {
        if (refresh) this.jobs = [];
        this.ui.lazyLoad = false;
      });
  }

  jobStatusOpenHold(item) {
    return item.job_status === 'Open' || item.job_status === 'High Priority';
  }
}

angular.module('uiGenApp')
  .controller('NavigationJobsController', NavigationJobsController);
