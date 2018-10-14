
class createCategoryController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
    this.PackageItemCategory = [];
    this.toaster = toaster;
  }

  $onInit() {

  }

  create() {
    if (this.PackageItemCategory.name) {
      this
        .$http
        .post('/packageItemCategories', { name: this.PackageItemCategory.name })
        .then(({ data: { message } }) => {
          this
            .toaster
            .pop('success', message);
        });
      this.$uibModalInstance.close();
    }
  }
}

class createCategory {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open() {
    return this.$uibModal.open({
      templateUrl: 'app/directives/createCategory/createCategory.html',
      controller: createCategoryController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
    });
  }
}

angular.module('uiGenApp')
  .service('createCategory', createCategory);
