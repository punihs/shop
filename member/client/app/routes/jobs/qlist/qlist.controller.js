(() => {
  class QlistController {
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
      this.Page.setTitle('Qlist');
      this.getList();
      this.reset();
    }

    reset() {
      this.params = { start: 0, rows: 10 };
      this.data = [];
      this.ui = { loading: false, lazyLoad: true };
    }

    getList(q = '') {
      this.params = { start: 0, rows: 10, qlist: true };
      this.ui.loading = true;
      this.$http
        .get('/jobSuggestions/direct', {
          params: Object.assign({ q }, this.params),
        })
        .then(({ data }) => {
          this.showList = true;
          this.ui.loading = false;
          this.data = data.data;
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
        .put(`/jobSuggestions/${job.id}/hide`, {})
        .then(() => this.data.splice(pos, 1) && this.params.start--);
    }

    accept($index) {
      const pos = $index;
      const job = this.data[pos];
      const post = { user_id: this.user.id, job_id: job.id, endpoint: '/direct' };
      const reload = () => {
        this.$state.reload();
        this.$rootScope.$broadcast('AdminView', true);
      };
      if (this.settings.isAdmin) return this.JobSuggest.open(post).then(reload, reload);
      return this.$http
        .post('/jobSuggestions/direct', post)
        .then(() => this.data.splice(pos, 1))
        .catch((err) => {
          if (err.status === 403) {
            this.error = err.data.message;
            this.$timeout(() => (this.error = ''), 5000);
          }
        });
    }

    acceptJD($index, job) {
      return this.ListModal
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
          if (res) this.accept($index);
        });
    }
  }

  angular
    .module('uiGenApp')
    .directive('jobsQlist', () => ({
      templateUrl: 'app/routes/jobs/qlist/qlist.html',
      restrict: 'E',
      controller: QlistController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: { settings: '=' },
    }));
})();
