(() => {
  class ChangeStateController {
    /*  @ngInject   */
    constructor($uibModalInstance, $http, applicant, Session, stateId, moment, jobId) {
      this.$uibModalInstance = $uibModalInstance;
      this.$http = $http;
      this.applicant = applicant;
      this.Session = Session;
      this.stateId = stateId;
      this.moment = moment;
      this.jobId = jobId;
    }

    $onInit() {
      this.states = this.Session.read('states');
      this.today = new Date();
      this.ui = { checking: false };
      this.submitting = false;
      this.exData = {
        scheduled_on_time: this.moment()
          .startOf('day')
          .set('hour', 10),
      };
    }

    setScheduledOn() {
      const hour = this.moment(this.exData.scheduled_on_time).get('hour');
      const minute = this.moment(this.exData.scheduled_on_time).get('minute');
      this.data.scheduled_on = this.moment(this.exData.scheduled_on_date)
        .set('hour', hour)
        .set('minute', minute);
      this.checkInterviewExists();
    }

    ok() {
      if (this.submitting) return;
      this.submitting = true;
      this
        .$http
        .put(`/applicants/${this.applicant.id}/state`, this.data)
        .then(() => {
          this.$uibModalInstance.close(this.data);
          this.submitting = false;
          return location.reload(true);
        })
        .catch((response) => {
          this.submitting = false;
          this.changeStateError = response.error;
        });
    }

    checkInterviewExists() {
      this.interviewee = {};
      if (![5, 8, 17].includes(this.data.state_id)) return null;
      this.ui.checking = true;
      return this.$http
        .get(`/jobs/${this.jobId}/interviews`, {
          params: {
            interview_time: [
              this.moment(this.data.scheduled_on)
                .subtract(29, 'minutes')
                .toISOString(),
              this.moment(this.data.scheduled_on)
                .add(29, 'minutes')
                .toISOString(),
            ].join(','),
          },
        })
        .then(({ data: { data, showMessage } }) => {
          this.ui.checking = false;
          this.showMessage = showMessage;
          const [interviewee] = data;
          if (interviewee) this.interviewee = interviewee;
        });
    }
  }

  class ChangeStateService {
    /*  @ngInject  */
    constructor($uibModal, Session) {
      this.$uibModal = $uibModal;
      this.Session = Session;
    }

    $onInit() {
      this.states = this.Session.read('states');
    }

    open(applicant, stateId, jobId) {
      const modalInstance = this.$uibModal.open({
        templateUrl: 'app/directives/change-state/change-state.html',
        controller: ChangeStateController,
        controllerAs: '$ctrl',
        bindToController: 'true',
        size: 'md',
        resolve: {
          applicant: () => applicant,
          stateId: () => stateId,
          jobId: () => jobId,
        },
      });

      modalInstance
        .result
        .then((data) => {
          this.applicant.state_id = data.state_id;
          this.applicant.state_name = this.states[data.state_id].action;
        });
    }
  }

  angular.module('uiGenApp')
    .service('ChangeState', ChangeStateService);
})();
