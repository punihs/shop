(() => {
  class ListModalController {
    /* @ngInject */
    constructor($http, $uibModalInstance, data, type) {
      this.$http = $http;
      this.$uibModalInstance = $uibModalInstance;
      this.data = data;
      this.type = type;
    }

    $onInit() {
      Promise.resolve(this.data.list).then((items = []) => {
        this.items = items;
      });
    }
  }

  class ListModalService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(data, type = 'payment', size = 'md') {
      return this
        .$uibModal
        .open({
          size,
          animation: true,
          templateUrl: 'components/list-modal/list-modal.html',
          controller: ListModalController,
          controllerAs: '$ctrl',
          resolve: {
            data: () => data,
            type: () => type,
          },
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('ListModal', ListModalService);
})();
