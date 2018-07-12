(() => {
  class PaymentTrackerController {
    /* @ngInject */
    constructor($uibModalInstance, $http, appId) {
      this.$uibModalInstance = $uibModalInstance;
      this.$http = $http;
      this.ui = { appId };
    }
    $onInit() {
      this.paymentTrack = [
        { flag: 1, name: 'Candidate Joined', description: '', created: '' },
        { flag: 0, name: 'Client Invoice generated', description: '', created: '' },
        { flag: 0, name: 'Payment Received', description: '', created: '' },
        { flag: 0, name: 'Consultant Invoiced', description: '', created: '' },
        { flag: 0, name: 'Payment Processed', description: '', created: '' },
      ];
      this.arrowPos = 10;
      this.get();
      this.getDescriptions();
    }

    selectTrack(index) {
      this.selectedIndex = index;
      this.arrowPos = [10, 29, 48, 67, 86][index];
    }

    get() {
      this.$http.get(`/applicants/${this.ui.appId}/paymentOverview`).then((res) => {
        this.paymentTrack.forEach((v, i) => {
          Object.assign(v, { flag: res.data[i].flag, created: res.data[i].date });
        });
        this.selectedIndex = (this.paymentTrack.filter((x) => (x.flag)).length - 1 || 0);
        this.selectTrack(this.selectedIndex);

      });
    }

    getDescriptions() {
      this.$http.get('/paymentState').then((res) => {
        this.paymentTrack.forEach((v, i) => {
          Object.assign(v, { description: res.data[i].description, name: res.data[i].name });
        });
      });
    }
  }

  class PaymentTrackerService {
    /* @ngInject */
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    open(appId, size = 'lg') {
      return this
        .$uibModal
        .open({
          size,
          animation: true,
          templateUrl: 'components/payment-tracker/payment-tracker.html',
          controller: PaymentTrackerController,
          controllerAs: '$ctrl',
          resolve: {
            appId: () => appId,
          },
        })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('PaymentTracker', PaymentTrackerService);
})();
