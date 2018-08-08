
class ViewPhotoController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
  }
}

class ViewPhotoService {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }


  open(customerId) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/viewPhoto/viewPhoto.html',
      controller: ViewPhotoController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        customerId: () => customerId,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('ViewPhotoService', ViewPhotoService);
