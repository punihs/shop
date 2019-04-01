
class WireController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, URLS,
    $window, CONFIG) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$window = $window;
    this.CONFIG = CONFIG;
    this.Session = Session;
    this.$http = $http;
    this.URLS = URLS;

    this.$onInit();
  }


  $onInit() {

  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

class WireService {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open() {
    return this.$uibModal.open({
      templateUrl: 'app/directives/wire/wire.html',
      controller: WireController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'lg',
    });
  }
}

angular.module('uiGenApp')
  .service('WireService', WireService);
