class DownloadResumeCtrl {
  constructor($uibModalInstance, offer) {
    this.$uibModalInstance = $uibModalInstance;
    this.offer = offer;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  ok() {
    this.$uibModalInstance.close();
  }
}

angular.module('uiGenApp')
  .controller('DownloadResumeCtrl', DownloadResumeCtrl);
