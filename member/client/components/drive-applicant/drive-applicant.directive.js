(() => {
  class DriveApplicantController {
    /* @ngInject */
    constructor($http, $stateParams, toaster, moment, QuarcService, ChangeState) {
      this.$http = $http;
      this.$stateParams = $stateParams;
      this.toaster = toaster;
      this.moment = moment;
      this.QuarcService = QuarcService;
      this.ChangeState = ChangeState;
      this.$onInit();
    }

    $onInit() {
      this.dateOptions = {
        minDate: new Date(),
      };
    }

    changeStateOpen(applicant, state) {
      return this.ChangeState
        .open(
          Object.assign(applicant, { _root_: this.job }),
          (this.job.is_drive && applicant.state_id === 44)
            ? 12
            : state.state_id,
          this.$stateParams.jobId);
    }

    changeInterviewTime(applicant) {
      const interviewTime = this.moment(applicant.interview_time);
      interviewTime
        .set('hour', 10)
        .set('minute', 0);
      this
        .$http
        .post(`/applicants/${applicant.id}/driveState`, {
          scheduled_on: interviewTime.toISOString(),
        })
        .then(() => (
          this
            .toaster
            .pop(this.QuarcService.toast('success', 'Interview time changed successfully.'))
        ))
        .catch(({ data }) => {
          applicant.interview_time = new Date(applicant._interview_time);
          this
            .toaster
            .pop(this.QuarcService.toast(
              'error', data.message || 'Could not change interview time.'
            ));
        });
    }
  }

  angular
    .module('uiGenApp')
    .directive('driveApplicant', () => ({
      templateUrl: 'components/drive-applicant/drive-applicant.html',
      restrict: 'E',
      controller: DriveApplicantController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        applicants: '=',
        states: '=',
        job: '=',
      },
    }));
})();
