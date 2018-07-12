(() => {
  class ForceAllocationController {
    /* @ngInject */
    constructor(
      $window, $state, $stateParams, $http, $timeout, $q, Session, ListModal, RejectJob,
      JobSuggest, toaster, QuarcService, ConfirmDialog, Page, AllocationDisable
    ) {
      this.$window = $window;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$q = $q;
      this.Session = Session;
      this.ListModal = ListModal;
      this.RejectJob = RejectJob;
      this.JobSuggest = JobSuggest;
      this.toaster = toaster;
      this.QuarcService = QuarcService;
      this.ConfirmDialog = ConfirmDialog;
      this.Page = Page;
      this.AllocationDisable = AllocationDisable;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.ui = { loading: this.user.admin_flag };
      this.choice = 0;
      if (this.user.admin_flag) this.proceedReq();
      this.Page.setTitle('Allocate QDirect JDs');
      this.AllocationDisable.check();
    }

    proceed() {
      if (this.user.admin_flag || !this.choice) return this.proceedReq();
      return this
        .ConfirmDialog
        .open({
          title: 'Please Confirm',
          description: 'Are you sure you want to reject all JDs?',
          size: 'md',
        })
        .then((result) => {
          if (!result) return;
          this.proceedReq();
        });
    }

    proceedReq() {
      this.ui.loading = true;
      const url = this.JobSuggest.enabled
        ? '/jobSuggestions/direct'
        : '/jobAllocations/reject';
      const promise = this.choice
        ? this.$http.put(url)
        : this
          .$http
          .get('/jobs/expired', { params: { pin: this.pin, force: true } });

      promise
        .then(({ data }) => {
          if (this.choice || data.length <= 0) return (this.$window.location.href = '/jobs');
          this.showList = true;
          this.ui.loading = false;
          return (
            this.list = (data.filter((x) => x && x.users[0].blocked === 1))
              .concat(data.filter((x) => x && x.users[0].blocked === 0))
          );
        })
        .catch(({ data: { error } }) => {
          this.ui.loading = false;
          this.error = error;
          this.$timeout(() => (this.error = ''), 5000);
        });
    }

    getPayment(job) {
      return this
        .$http
        .get(`/jobs/${job.id}`, { params: { auto: this.JobSuggest.enabled, admin: true } })
        .then(({ data: { clientPaymentDesignation: pay,
          payment: normalModel, perc_revenue_share: revenueShare } }) => {
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
              { name: 'Consultants Share', val: `${revenueShare}%` },
              { name: 'Replacement Days', val: `${normalModel.replacement_days} Days` },
            ]);
        });
    }

    acceptJD(job) {
      const value = 1;
      const admin = this.user.admin_flag;
      if (!admin) return this.update(job, value);

      return this
        .ListModal
        .open({
          title: 'Client Commercials',
          description: 'The commercials for this JD are:',
          list: this.getPayment(job),
          notes: [
            'The above commercials are subject to change.' +
            'Please check the commercials while uploading the CV.',
          ],
        })
        .then(res => {
          if (res) this.update(job, value);
        });
    }

    rejectJD(job) {
      const value = 3;
      return this
        .RejectJob
        .open(job)
        .then(x => this.update(Object.assign(x, job), value));
    }

    hideJD(index) {
      const data = this.list[index];

      return this.$http
        .put(`/jobSuggestions/${data.id}/hide`, {})
        .then(() => this.list.splice(index, 1));
    }

    update(jobHash, value) {
      const job = jobHash;
      if (this.JobSuggest.enabled) {
        const promiseArr = value === 1
          ? job.users.map(
            (u) => this
              .$http
              .post('/jobSuggestions/direct?force=true', {
                id: u.id,
                user_id: u.user_id,
                job_id: job.id,
              })
            )
          : [this
              .$http
              .put(`/jobSuggestions/${job.id}/direct?force=true`, {
                job_id: job.id,
                FeedbackResponses: job.FeedbackResponses,
              })];

        return Promise.all(promiseArr)
          .then(() => {
            this.toaster.pop(this.QuarcService
              .toast('success', `${job.client_name} - ${job.role} - Position ${
                value === 1 ? 'Accepted' : 'Rejected'
               }`));
            this.proceed();
          })
          .catch(() => {
            this.toaster.pop(this.QuarcService
              .toast('error', 'There was problem updating consultant response.'));
          });
      }

      const NEW_RESPONSE = value && Number(value);
      return this
        .$http
        .post('/jobAllocations?force=true', {
          job_id: job.id,
          response_id: NEW_RESPONSE,
          commit_cv_count: job.commit_cv_count,
          FeedbackResponses: job.FeedbackResponses,
        })
        .then(() => {
          this.toaster.pop(this.QuarcService
            .toast('success', `${job.client_name} - ${job.role} - Position ${
                value === 1 ? 'Accepted' : 'Rejected'
             }`
            ));
          this.proceed();
        })
        .catch(() => {
          this.toaster.pop(this.QuarcService
            .toast('error', 'There was problem updating consultant response.'));
        });
    }
  }

  angular.module('uiGenApp')
    .controller('ForceAllocationController', ForceAllocationController);
})();
