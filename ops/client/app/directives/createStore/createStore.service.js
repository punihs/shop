
class createStoreController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, Session, $stateParams, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.Session = Session;
    this.data = [];
    this.toaster = toaster;
  }

  create() {
    if (this.data.name) {
      this
        .$http
        .post('/stores', { name: this.data.name })
        .then(({ data: { name } }) => {
          this
            .toaster
            .pop('success', `${name} Store created successfully`, '');
        });
      this.$uibModalInstance.close();
    }
  }
}

class createStore {
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  open() {
    return this.$uibModal.open({
      templateUrl: 'app/directives/createStore/createStore.html',
      controller: createStoreController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
    });
  }
}

angular.module('uiGenApp')
  .service('createStore', createStore);
