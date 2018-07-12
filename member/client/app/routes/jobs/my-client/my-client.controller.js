class MyClientController {
  /* @ngInject */
  constructor(
    $http, $timeout, $state, $rootScope, Session, ListModal, JobSuggest, Page
  ) {
    this.$http = $http;
    this.$timeout = $timeout;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.Session = Session;
    this.ListModal = ListModal;
    this.JobSuggest = JobSuggest;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    this.ui = { loading: this.user.admin_flag };
    this.Page.setTitle('My Client JDs');
    this.getList();
    this.reset();
  }

  reset() {
    this.params = { start: 0, rows: 10 };
    this.data = [];
    this.ui = { loading: false, lazyLoad: true };
  }

  getList() {
    this.params = { start: 0, rows: 10 };
    this.ui.loading = true;
    this.$http
      .get('/jobSuggestions/myClients')
      .then(({ data }) => {
        this.showList = true;
        this.ui.loading = false;
        this.data = data;
      })
      .catch(({ data: { error } }) => {
        this.ui.loading = false;
        this.error = error;
        this.$timeout(() => (this.error = ''), 5000);
      });
  }

  rejectJD($index) {
    const pos = $index;
    const job = this.data[pos];
    return this.$http
      .delete(`/jobSuggestions/${job.job_id}`)
      .then(() => this.data.splice(pos, 1) && this.params.start--);
  }

  acceptJD($index) {
    const pos = $index;
    const job = this.data[pos];
    const post = { user_id: this.user.id, job_id: job.job_id, id: job.id };
    return this.$http
      .post('/jobSuggestions/omni', post)
      .then(() => this.data.splice(pos, 1))
      .catch((err) => {
        if (err.status === 403) {
          this.error = err.data.message;
          this.$timeout(() => (this.error = ''), 5000);
        }
      });
  }
}


angular.module('uiGenApp')
  .controller('MyClientController', MyClientController);
