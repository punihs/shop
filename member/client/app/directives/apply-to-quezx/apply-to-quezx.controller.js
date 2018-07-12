class ApplyToQuezXController {
  constructor($uibModalInstance, $http, $state, $window, Session, candidateName, candidateId, URLS) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$state = $state;
    this.$window = $window;
    this.Session = Session;
    this.candidateName = candidateName;
    this.candidateId = candidateId;
    this.URLS = URLS
    this.$onInit();
  }

  $onInit() {
    this.concat = 'true';
    this.Clients = {
      noResults: false,
      loadingClients: false,
    };

    this.Positions = {
      noResults: false,
      loadingClients: false,
    };
  }

  getPosition(search) {
    const clientID = this.Clients.id;
    if (!clientID) return [];

    return this.$http({
      url: '/search',
      method: "GET",
      params: {q: search, type: 'current_consultant_alloc_jobs_by_client', id: clientID}
    })
      .then(({data: xResponse}) => {
        let response = xResponse;
        return response.map(value => value);
      });
  }

  getClient(search) {
    return this.$http({
      url: '/search',
      method: "GET",
      params: {q: search, type: 'current_consultant_alloc_job_clients'}
    })
      .then(({data: response}) => response.map(value => value));
  }

  selectPosition($item) {
    if ($item.id) {
      this.Positions.id = $item.id;
      this.Positions.model = $item.name;
    }
  }

  selectClient($item) {
    if ($item.id) {
      this.Clients.id = $item.id;
      this.Clients.model = $item.name;
    }
  }

  ok() {
    this.$uibModalInstance.close(this.concat);
  };

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };

  submitform() {
    return this.$http({
      url: `/jobs/${this.Positions.id}/applicants/newApply`,
      method: "POST",
      data: {candidate_id: this.candidateId}
    })
      .then(({data: data}) => {
        this.$state.go('applicant.view', {applicantId: data.id});
        this.$uibModalInstance.close(true);
      }).catch(error => {
        this.errorMessage = ([409, 400].indexOf(error.status)) ? error.data.message : error.statusText;
        return 0
      });
  };
}

angular.module('uiGenApp')
  .controller('ApplyToQuezXController', ApplyToQuezXController);
