class ClickToCopyController {

  constructor($sce, $uibModalInstance, job) {
    this.job = job;
    this.trustAsHtml = $sce.trustAsHtml;
    this.ok = function ok() {

    };
    this.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }
}

angular.module('uiGenApp')
  .controller('ClickToCopyController', ClickToCopyController);
