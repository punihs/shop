(() => {
  class JobSuggestController {
    /* @ngInject */
    constructor($http, $timeout, $uibModalInstance, allo, RejectJob) {
      this.$http = $http;
      this.$timeout = $timeout;
      this.$uibModalInstance = $uibModalInstance;
      this.allo = allo;
      this.RejectJob = RejectJob;

      this.getList();
    }

    getList() {
      this
        .$http
        .get(`/jobs/${this.allo.job_id}/consultants`, {
          params: { auto: true },
        })
        .then(({ data }) => (this.list = data));
    }

    accept(alloUser) {
      const user = alloUser; // { id, job_id, stats, auto, endpoint }

      (!user.active
        ? this.$http
        .post(`/jobSuggestions${this.allo.endpoint || ''}`, Object
          .assign({}, this.allo, { id: user.allo_id, user_id: user.id }))
        : this.$http
        .delete(`/jobSuggestions/${this.allo.job_id}`, {
          params: Object.assign({}, this.allo, { user_id: user.id }),
        }))
        .then(() => {
          user.recommend = false;
          user.active = !user.active;
        })
        .catch((err) => {
          this.error = (err.status === 403)
            ? err.data.message
            : 'Something went wrong. Please contact QuezX Team';

          return this.$timeout(() => (this.error = ''), 5000);
        });
    }
  }

  class JobSuggestService {
    /* @ngInject */
    constructor($http, $uibModal, Session, toaster, QuarcService, RejectJob, $timeout) {
      this.$http = $http;
      this.$uibModal = $uibModal;
      this.Session = Session;
      this.toaster = toaster;
      this.QuarcService = QuarcService;
      this.RejectJob = RejectJob;
      this.$timeout = $timeout;
    }

    get enabled() {
      return true;
    }

    activate(job, getList) {
      const endpoint = (job.open_platform && '/direct') || '';
      const reload = () => getList(true);
      return this.Session.read('ROLE_ADMIN')
        ? this.open({
          job_id: job.id,
          endpoint,
        })
          .then(reload, reload)
        : this
          .$http
          .post(`/jobSuggestions${endpoint}`, { job_id: job.id, auto: job.type === 0 })
          .then(() => getList(true))
          .catch((err) => {
            if (err.status === 403) {
              job.error = err.data.message;
              this.$timeout(() => (job.error = ''), 5000);
              this.toaster
                .pop(this.QuarcService.toast('error', err.data.message));
            }
          });
    }


    complete(job, getList, all = true, hideAllocated = false) {
      const endpoint = (job.open_platform && '/direct') || '';
      const reload = () => getList(true);

      return (this.Session.read('ROLE_ADMIN') && !all
        ? this.open({
            job_id: job.id,
            endpoint,
            hideAllocated,
          })
          .then(reload, reload)
        : this.RejectJob
          .open(job, 'md', 5)
          .then(({ FeedbackResponses }) => {
            this.$http.put(
              `/jobSuggestions/${job.id}`,
              { FeedbackResponses },
              { params: this.Session.read('ROLE_ADMIN') && all ? { all } : {} }
            )
              .then(() => getList(true));
          }));
    }

    open(allo) {
      return this
        .$uibModal
        .open({
          size: 'md job-suggest',
          windowTopClass: 'bg-black-opacity',
          animation: true,
          templateUrl: 'app/routes/jobs/suggestions/suggest.html',
          controller: JobSuggestController,
          controllerAs: '$ctrl',
          resolve: {
            allo: () => allo,
          },
        })
        .result;
    }

    getPayment(job) {
      return this
        .$http
        .get(`/jobs/${job.id}`, { params: { auto: this.enabled, key: job.key } })
        .then(({ data: { clientPaymentDesignation: pay,
          payment: normalModel, perc_revenue_share } }) => {
          if (pay) {
            return (pay.isFixed === 4
              ? [{ name: 'Commission', val: `${pay.percent || '-'}%` }]
              : [{ name: 'Commission', val: `INR ${pay.percent || '-'}` }])
              .concat([
                { name: 'Consultants Share', val: '80%' },
                { name: 'Replacement Days', val: `${pay.replacement_days} Days` },
              ]);
          }
          return [{ name: 'Commission', val: `${normalModel.model || '-'}` }]
          .concat([
              { name: 'Consultants Share', val: perc_revenue_share },
              { name: 'Replacement Days', val: `${normalModel.replacement_days} Days` },
          ]);
        }
        );
    }
  }

  angular
    .module('uiGenApp')
    .service('JobSuggest', JobSuggestService);
})();
