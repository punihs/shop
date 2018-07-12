(() => {
  class Suggestions {
    /* @ngInject */
    constructor($, boxSize = 4, endpoint = '') {
      this.$ = $;
      this.boxSize = boxSize;
      this.endpoint = endpoint;
      this.params = { start: 0, rows: 10, auto: this.boxSize === 4 };
      this.filters = {
        max_sal: [
          { name: 'LOW', checked: false },
          { name: 'MID', checked: false },
          { name: 'HIGH', checked: false },
        ],
      };

      this.reset();
    }

    reset() {
      this.params.start = 0;
      this.head = -1;
      this.data = [];
      this.ui = { loading: false, lazyLoad: true };
    }

    get list() {
      return this.data.slice(this.head, this.head + this.boxSize);
    }

    get next() {
      return !!this.data[this.head + this.boxSize];
    }

    getList(prev = false, q = '') {
      const { $http, settings: { isAdmin }, user } = this.$;
      if (this.ui.loading) return this;
      this.head -= Number(prev) || -1; // a bit complicated :)

      if (!this.ui.lazyLoad) return this;
      if (this.data[this.head + this.boxSize + 1]) return Promise.resolve(this);

      this.ui = { loading: true, lazyLoad: true };

      return $http
        .get(`/jobSuggestions${this.endpoint}`, {
          params: Object.assign({ q }, this.params, {
            max_sal: this.filters.max_sal.filter(x => x.checked).map(x => x.name).join(),
          }),
        })
        .then(({ data: { data = [], funclist, funcs, active } }) => {
          this.funclist = funclist || [];
          this.funcs = funcs || {};
          this.active = active || {};

          if (!this.endpoint && this.params.auto && !this.funclist.length) this.$.pref.boxSize = 4;

          data.forEach(job => this.data.push(Object.assign(job, {
            users: isAdmin // handle
              ? this.getUsers(job).then(users => Object.assign(job, { users }))
              : [user],
          })));

          this.ui.loading = false;
          if (data.length !== this.params.rows) this.ui.lazyLoad = false;

          this.params.start += this.params.rows;
          return this;
        });
    }

    getUsers(job) {
      // handle async load of user list
      const list = this.$.settings.users;
      if (!list) return this.$.$timeout(() => this.getUsers(job), 400);

      const users = list.filter(x => (!x.suspend_status && x.selected));

      const recommend = this.funcs[job.func_id] || [];
      const active = this.active[job.id] || [];

      return Promise
        .resolve(users.map(({ id, name }) => ({
          id, name,
          recommend: !active.includes(id) &&
            (recommend.includes(id) || Object.keys(job.manual || {}).includes(id)),
          active: active.includes(id),
        }))
        .sort((a, b) => ((b.recommend - a.recommend) || (a.active - b.active))));
    }

    hideJD($index) {
      const pos = this.head + $index;
      const job = this.data[pos];
      const { $http } = this.$;

      return $http
        .put(`/jobSuggestions/${job.id}/hide`, {})
        .then(() => this.data.splice(pos, 1) && this.params.start--);
    }

    accept($index, user = {}) {
      const pos = this.head + $index;
      const job = this.data[pos];
      const {
        $http, $rootScope, $timeout, $state, JobSuggest,
        settings: { isAdmin },
        user: { id: userId },
      } = this.$;

      const { id: job_id, stats, manual } = job;
      const id = (manual || {})[userId];

      const post = {
        id, job_id, user_id: user.id,
        stats, auto: this.params.auto,
        endpoint: this.endpoint,
      };

      const reload = () => {
        $state.reload();
        $rootScope.$broadcast('AdminView', true);
      };

      if (isAdmin) return JobSuggest.open(post).then(reload, reload);

      return $http
        .post(`/jobSuggestions${this.endpoint}`, post)
        .then(() => {
          this.active[job_id] = (this.active[job_id] || []).concat(user.id || userId);
          job.count++;

          const splice = job.count >= job.lot || this.active[job_id].length >= job.users.length;
          const [data] = splice
            ? this.data.splice(pos, 1)
            : this.data.slice(pos, pos + 1);

          if (splice) this.params.start--; // correct next offset for results

          [data, user].forEach(x => Object.assign(x, {
            active: true,
            open_platform: this.endpoint === '/direct',
          }));

          $rootScope.$broadcast('JobSuggest', { data });
        })
        .catch((err) => {
          if (err.status === 403) {
            this.$.error = err.data.message;
            $timeout(() => (this.$.error = ''), 5000);
          }
        });
    }

    acceptJD($index, job, user = {}) {
      if (!job.open_platform || !this.$.user.admin_flag) return this.accept($index, user);
      const { ListModal, JobSuggest } = this.$;
      return ListModal
        .open({
          title: 'Client Commercials',
          description: 'Commercials for JD :',
          list: JobSuggest.getPayment(job),
          notes: [
            'The above commercials are subject to change.' +
            'Please check the commercials while uploading the CV.',
          ],
        })
        .then(res => {
          if (res) this.accept($index, user);
        });
    }

    rejectJD(job, index, all = true) {
      return this
        .$
        .RejectJob
        .open(job)
        .then(x => this.reject(Object.assign(x, job), index, all));
    }

    reject({ id, FeedbackResponses }, index, all) {
      const { $http } = this.$;
      const pos = this.head + index;
      const data = { job_id: id, FeedbackResponses, all };

      $http
        .put(`/jobSuggestions/${id}/direct`, data)
        .then(() => {
          if (this.data.splice(pos, 1)) this.params.start--;
        })
        .catch(() => {
          this.$.error = 'There was problem rejecting this JD.';
        });
    }
  }

  class JobsSuggestionsController {
    /* @inject */
    constructor(
      $http, $rootScope, $scope, $state, $timeout, Session,
      AllocationDisable, QuarcService, JobSuggest, RejectJob, ListModal
    ) {
      this.$http = $http;
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$state = $state;
      this.$timeout = $timeout;
      this.Session = Session;
      this.AllocationDisable = AllocationDisable;
      this.Page = QuarcService.Page;
      this.JobSuggest = JobSuggest;
      this.RejectJob = RejectJob;
      this.ListModal = ListModal;

      this.qdirect = new Suggestions(this, 4, '/direct');
      this.auto = new Suggestions(this, 4, Session.read('ALLO'));
      this.pref = new Suggestions(this, 2, Session.read('ALLO'));
      this
        .AllocationDisable
        .check()
        .then(disabled => {
          if (disabled && this.AllocationDisable.open()) return;
          this.$onInit();
        });
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.Page.setTitle('Recommended Jobs');
      this.prefConf = {
        ctc: false, industry: false, accounts: false,
        pref: false, redirect: false, city: false,
      };
      this.qdirect.getList();
      this.auto.getList();
      this.pref.getList();

      this.$scope.$watch(() => this.reload, (reload) => {
        if (!reload) return null;
        this.showPrefs = false;
        this.pref.reset();
        return this.pref.getList();
      }, true);
    }
  }

  angular
    .module('uiGenApp')
    .directive('jobsSuggestion', () => ({
      templateUrl: 'app/routes/jobs/suggestions/suggestions.html',
      restrict: 'E',
      controller: JobsSuggestionsController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: { settings: '=' },
    }));
})();
