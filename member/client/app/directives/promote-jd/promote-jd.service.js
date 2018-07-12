(function () {
  class PromoteJdDialogController {
    /* @ngInject */
    constructor($uibModalInstance, $http, QuarcService, toaster) {
      this.$uibModalInstance = $uibModalInstance;
      this.$http = $http;
      this.toaster = toaster;
      this.QuarcService = QuarcService;
    }

    $onInit() {
      this.sendMail();
    }

    sendMail() {
      return this.$http.post('/jobs/promote', {});
    }
  }

  class PromoteJdDialogService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open() {
      return this
        .$uibModal
        .open({
          size: 'md',
          animation: true,
          templateUrl: 'app/directives/promote-jd/promote-jd.html',
          controller: PromoteJdDialogController,
          controllerAs: '$ctrl',
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('PromoteJdDialog', PromoteJdDialogService);

})();
