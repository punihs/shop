class ExtJobsNavController {
  /* @ngInject */
  constructor($http, JobSuggest) {
    this.$http = $http;
    this.JobSuggest = JobSuggest;
    this.url = JobSuggest.enabled
      ? '/jobSuggestions/jobs'
      : '/jobs';
    this.$onInit();
  }

  $onInit() {
    this.list = [];
    this.ui = { lazyLoad: true, loading: false };
    // GET query params
    this.params = {
      offset: 0,
      limit: 20,
      fl: [
        'id,client_name,role,job_status_id',
        'consultant_score,open_platform,qrex_client_name',
      ].join(),
      job_status_id: '1,2',
      status: 'OPEN,HIGH_PRIORITY',
      query: '',
    };
    this.getList();
  }

  getList(refresh) {
    if (refresh) {
      this.list = [];
      this.params.offset = 0;
      this.ui = { lazyLoad: true, loading: false };
    }
    if (!this.ui.lazyLoad) return; // if no more jobs to get
    this.ui = { lazyLoad: false, loading: true };
    this.params.q = this.params.query;

    this
      .$http
      .get(this.url, { params: this.params, skipAdminView: true })
      .then(({ data: { jobs, data } }) => {
        (jobs || data || [])
          .forEach((job) => {
            if (this.JobSuggest.enabled) return (job.active && this.list.push(job));
            else return this.list.push(job);
          });

        this.ui.loading = false;
        this.ui.lazyLoad = this.params.limit === (jobs || data || []).length;
        this.params.offset += this.params.limit;
      });
  }
}

angular.module('uiGenApp')
  .controller('ExtJobsNavController', ExtJobsNavController);

