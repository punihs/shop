(function () {
  class ConfirmDialogController {
    /* @ngInject */
    constructor($uibModalInstance, title, description) {
      this.$uibModalInstance = $uibModalInstance;
      this.title = title;
      this.description = description;
    }
  }

  class ConfirmDialogService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open({ title, description, size = 'sm' }) {
      return this
        .$uibModal
        .open({
          size,
          animation: true,
          templateUrl: 'app/directives/confirm-dialog/confirm-dialog.html',
          controller: ConfirmDialogController,
          controllerAs: '$ctrl',
          resolve: {
            title: () => title,
            description: () => description,
          },
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('ConfirmDialog', ConfirmDialogService);

})();
