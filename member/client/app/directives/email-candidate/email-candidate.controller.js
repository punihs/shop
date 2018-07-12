class EmailCandidateController {
  constructor($http, $state, $uibModalInstance, $stateParams, toaster, URLS,
              candidateName, candidateEmail, candidateId, QuarcService) {
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$uibModalInstance = $uibModalInstance;
    this.toaster = toaster;
    this.candidateId = candidateId;
    this.candidateName = candidateName;
    this.candidateEmail = candidateEmail;
    this.QuarcService = QuarcService;
    this.URLS = URLS;
    this.$onInit();
  }

  $onInit() {
    this.email = {};
    this.email.to = this.candidateEmail;
    this.email.name = this.candidateName;
    this.email.replyTo = JSON.parse(localStorage.getItem('userinfo')).email_id;
  }

  cancel = function cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };

  emailCandidate = () => {
    return this.$http({
      url: `${this.URLS.CRUX_API}/candidates/${this.candidateId
        }/email?source=${this.$stateParams.source}`,
      method: "POST",
      data: this.email
    })
      .then(data => {
        this.toaster.pop(this.QuarcService.toast('success', 'Email Sent.'));
        this.$uibModalInstance.close(true);
      }).catch(error => {
        this.toaster.pop(this.QuarcService.toast('error', 'Something went wrong. Contact QuezX.'));
        this.errorMessage = ([409, 400].indexOf(error.status)) ? error.data.message : error.statusText;
        return 0
      });
  }
}

angular.module('uiGenApp')
  .controller('EmailCandidateController', EmailCandidateController);
