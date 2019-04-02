
class WireController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Session = Session;
    this.$onInit();
  }

  $onInit() {
    this.data = {};
  }

  proceed() {
    const data = Object.assign({}, this.data);
    return this.$uibModalInstance
      .close(Object.assign(data, { proceed: true }));
  }

  cancel() {
    const data = Object.assign({}, this.data);
    return this.$uibModalInstance
      .close(Object.assign(data, { proceed: false }));
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
