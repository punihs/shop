(() => {
  class ReApplyService {
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(applicant) {
      this.$uibModal.open({
        templateUrl: 'app/directives/reapply/reapply.html',
        controller: 'ReApplyController',
        controllerAs: '$ctrl',
        resolve: {
          applicant,
        },
      });
    }
  }

  angular.module('uiGenApp')
    .service('ReApply', ReApplyService);
})();
