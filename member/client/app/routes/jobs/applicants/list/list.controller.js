class JobsApplicantsListController {
  /* @ngInject */
  constructor(
    QCONFIG, QuarcService, $stateParams, $filter, moment, $window,
    currentJob, $http, $state, prescreen, Session, Prototype, ExcelDownload, ChangeState
  ) {
    this.QCONFIG = QCONFIG;
    this.QuarcService = QuarcService;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
    this.$window = $window;
    this.currentJob = currentJob;
    this.moment = moment;
    this.prescreen = prescreen;
    this.Session = Session;
    this.Prototype = Prototype;
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
    this.Page = this.QuarcService.Page;
    this.buckets = this.QCONFIG.APPLICANT_STATES;

    this.job = this.currentJob || {};
    this.Page.setTitle(`${this.job.role ? `${this.job.role} - ` : ''} ${
      this.$stateParams.status ? this.$stateParams.status : ''} Applicants`); // set page title

    // Set default status to ALL
    if (!~this.buckets.indexOf(this.$stateParams.status)) {
      this.$state.go('job.applicants.list', { status: 'Tasks' });
      return;
    }
    this.applicants = []; // collection of applicants
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = {
      sort: '-', offset: 0, limit: 15,
      fl: '_root_,name,applicant_score,created_on,edu_degree,exp_designation,exp_employer,' +
      'exp_location,exp_salary,id,name,state_id,state_name,total_exp,owner_id,' +
      'email,notice_period,mobile,expected_ctc,summary,interview_time,is_drive,' +
      'client_name',
      sid: this.$stateParams.sid || '',
    }; // GET query params

    this.loadApplicants(); // get applicants
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

    if (!this.ui.lazyLoad) return; // if no more jobs to get
    this.ui = { lazyLoad: false, loading: true };

    if (this.$stateParams.status === 'Interview') {
      // Customization for Interview tab
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
      .get('/users', { params: { suspend_status: '0,1' } })
      .then(({ data }) => {
        const hash = {};
        data.forEach(d => (hash[d.id] = d.name));
        this.$http
          .get(`/jobs/${this.$stateParams.jobId}/applicants`, { params: this.params })
          .then(({ data: { applicants: result, total } }) => {
            result.forEach(cv => {
              const applicant = cv;
              applicant.owner_name = this.Prototype.initials(hash[applicant.owner_id]);
              applicant.owner_name_full = hash[applicant.owner_id];
              this.applicants.push(applicant);
            });
            this.total = total;
          // data has been loaded
            this.ui.loading = false;

          // check for returned results count and set lazy loadLoad false if less
            this.ui.lazyLoad = angular.equals(result.length, this.params.limit);

          // increment offset for next loading of results
            this.params.offset = this.params.offset + this.params.limit;
          });
      });
  }

  // returns array containing resultkey of search result
  getApplicant(criteria = {}, returnkey = 'id') {
    return this.$filter('filter')(this.applicants, criteria)
    .map((applicant) => applicant[returnkey]);
  }

  // sets value
  setChecked(state) {
    angular.forEach(this.applicants, (value, key) => (this.applicants[key].checked = state));
  }
}

angular.module('uiGenApp')
.controller('JobsApplicantsListController', JobsApplicantsListController);
