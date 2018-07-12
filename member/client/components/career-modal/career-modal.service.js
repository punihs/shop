(() => {
  class CareerModalController {
    /* @ngInject */
    constructor($uibModalInstance, site) {
      this.$uibModalInstance = $uibModalInstance;
      this.ui = { site };
    }
  }

  class CareerModalService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(site, size = 'lg') {
      return this
        .$uibModal
        .open({
          size: `${size} careersize`,
          animation: true,
          templateUrl: 'components/career-modal/career-modal.html',
          controller: CareerModalController,
          controllerAs: '$ctrl',
          resolve: {
            site: () => site,
          },
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('CareerModal', CareerModalService);
})();
