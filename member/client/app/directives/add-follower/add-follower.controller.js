class AddFollowerController {
  constructor($uibModalInstance, FollowerData, ApplicantId) {
    this.$uibModalInstance = $uibModalInstance;
    this.FollowerData = FollowerData;
    this.ApplicantId = ApplicantId;
    this.newEmails = [];
  }

  ok() {
    this.$http
      .post(`/applicants/${this.ApplicantId}/followers`, this.newEmails)
      .then(() => this.$uibModalInstance.close(true));
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  addNewFollower() {
    const curVal = this.emailTobeAdded;

    const found = this.FollowerData.some(el => el.email_id === curVal);

    const foundNew = this.newEmails.some(el => el === curVal);

    if (!found || !foundNew) this.newEmails.push(curVal);
  }
}

angular.module('uiGenApp')
  .controller('AddFollowerController', AddFollowerController);
