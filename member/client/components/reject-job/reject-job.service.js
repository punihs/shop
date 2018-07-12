(() => {
  class RejectJobController {
    /* @ngInject */
    constructor($http, $uibModalInstance, $log, JobSuggest, Session, job, feedbackId) {
      this.$http = $http;
      this.$uibModalInstance = $uibModalInstance;
      this.$log = $log;
      this.JobSuggest = JobSuggest;
      this.Session = Session;
      this.job = job;
      this.feedbackId = feedbackId;
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.data = [];

      this
        .$http
        .get(`/feedbacks/${this.feedbackId || (this.JobSuggest.enabled ? 3 : 2)}/options`)
        .then(({ data: { data } }) => (this.data = data
          .map(x => Object.assign(x, {
            is_other: x.name.trim().toLowerCase() === 'other',
          }))));
    }

    ok() {
      return {
        FeedbackResponses: this.data
          .filter(r => r.checked)
          .map(({ id, other }) => Object
            .assign({ feedback_option_id: id, other })),
      };
    }

    isOptionSelected() {
      return this.data.some(x => x.checked);
    }
  }

  class RejectJobService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(job, size = 'md', feedbackId = 0) {
      return this
        .$uibModal
        .open({
          size,
          animation: true,
          templateUrl: 'components/reject-job/reject-job.html',
          controller: RejectJobController,
          controllerAs: '$ctrl',
          resolve: {
            job: () => job,
            feedbackId: () => feedbackId,
          },
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('RejectJob', RejectJobService);
})();
