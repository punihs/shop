(function () {
  class JobNavController {
    /* @ngInject */
    constructor(
      $http, $state, $scope, $timeout, AllocationDisable, JobSuggest, Session, RejectJob
    ) {
      this.$http = $http;
      this.$state = $state;
      this.$scope = $scope;
      this.$timeout = $timeout;
      this.AllocationDisable = AllocationDisable;
      this.JobSuggest = JobSuggest;
      this.Session = Session;
      this.RejectJob = RejectJob;
      this.$onInit();
    }

    $onInit() {
      this.isAdmin = this.Session.read('ROLE_ADMIN');
      this.reset();
      this
        .AllocationDisable
        .check()
        .then(disabled => (this.DISABLE_MANAGE = disabled));
      this.getList(true);

      // insert inside job navigation on suggestion accept
      this.$scope.$on('JobSuggest', (ev, { data }) => this
        .jobs[data.open_platform ? 'qdirect' : 'active']
        .unshift(data));

      this // listen for Admin View Change and Reload
        .$scope
        .$on('AdminView', () => {
          this.isAdmin = this.Session.read('ROLE_ADMIN');
          this.reset();
          this.getList();
        });

      this.refreshList = this.getList.bind(this);
    }

    reset() {
      this.jobs = {
        qdirect: [],
        active: [],
        passive: [],
        inactive: [],
      };

      this.collapse = { qdirect: false, active: false, passive: true, inactive: true };

      this.ui = { lazyLoad: true, loading: false };
      this.params = Object.assign(this.params || {}, {
        start: 0,
        rows: 30,
        fl: [
          'id,client_name,role,job_status_id',
          'consultant_score,open_platform,qrex_client_name',
        ].join(),
      });
    }

    getList(refresh = false, all = false) {
      if (!refresh && !this.ui.lazyLoad) return; // if no more jobs to get
      if (refresh) this.reset();
      this.ui = { lazyLoad: false, loading: true };

      this
        .$http
        .get('/jobSuggestions/jobs', { params: this.params })
        .then(({ data: { data = [] } }) => {
          if (refresh) Object.keys(this.jobs).forEach(k => (this.jobs[k] = []));
          data
            .forEach(j => {
              const job = j;

              job.tooltip = `${job.role} / ${job.client_name}${job.open_platform
                ? ''
                : ` [${(job.type === 1) && 'Preference based' || 'System generated'}]`
              }`;

              const list = [1, 2].includes(job.job_status_id)
                ? (!job.active && 'passive') || (job.open_platform && 'qdirect') || 'active'
                : 'inactive';

              this.jobs[list].push(job);
            });

          if (refresh) {
            this.collapse.inactive = !this.params.q;
            this.collapse.passive = !this.params.q;
          }
          this.ui.loading = false;
          this.ui.lazyLoad = this.params.rows === data.length;
          this.params.start += this.params.rows;

          if (all && !this.jobs.inactive.length) this.getList(refresh, all);
        });
    }

    getLink(jobId) {
      const states = [
        'job.applicants', 'job.applicants.new', 'job.references.list',
        'job.interviews.list', 'job.view',
      ];
      const name = states.includes(this.$state.current.name)
        ? this.$state.current.name
        : states[0];

      const status = this.$state.params.status || 'PENDING_FEEDBACK';

      return this.$state.href(name, { jobId, status, key: '' });
    }
  }

  angular
    .module('uiGenApp')
    .directive('jobNav', () => ({
      templateUrl: 'components/job-nav/job-nav.html',
      restrict: 'E',
      controller: JobNavController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {},
    }));
}());
