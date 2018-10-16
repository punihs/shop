
class ViewPhotoController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, photo, URLS) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
    this.URLS = URLS;
    this.photoUrl = photo;
  }
}

class ViewPhotoService {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }


  open(photo) {
    return this.$uibModal.open({
      templateUrl: 'app/directives/viewPhoto/viewPhoto.html',
      controller: ViewPhotoController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        photo: () => photo,
      },
    });
  }
}

angular.module('uiGenApp')
  .service('ViewPhotoService', ViewPhotoService);
