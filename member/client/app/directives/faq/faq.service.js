
class FaqController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams,
    $window, CONFIG) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$window = $window;
    this.CONFIG = CONFIG;
    this.Session = Session;
    this.$http = $http;

    this.$onInit();
  }


  $onInit() {

  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

class FaqService {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open() {
    return this.$uibModal.open({
      templateUrl: 'app/directives/faq/faq.html',
      controller: FaqController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'lg',
    });
  }
}

angular.module('uiGenApp')
  .service('FaqService', FaqService);
