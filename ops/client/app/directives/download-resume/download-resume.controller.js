class DownloadResumeCtrl {
  constructor($uibModalInstance, ApplicantIds, URLS, $window, Session) {
    this.concat = 'true'; // download cv type default to with CTC

    if (!angular.isArray(ApplicantIds)) return;
    const token = Session.getAccessToken();
    if (ApplicantIds.length === 1) {
      this.downloadUrl =
        `${URLS.API}/applicants/${ApplicantIds[0]}/download?access_token=${token}`;
    }

    if (ApplicantIds.length > 1) {
      this.downloadUrl =
        `${URLS.API}/applicants/download?access_token=${token}&id=${ApplicantIds.join(',')}`;
    }

    this.ok = function ok() {
      $uibModalInstance.close(this.concat);
    };

    this.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }
}

angular.module('uiGenApp')
  .controller('DownloadResumeController', DownloadResumeCtrl);
