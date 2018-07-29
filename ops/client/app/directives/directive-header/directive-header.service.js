class JobModalService {
  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  share(job) {
    this.$uibModal.open({
      templateUrl: 'app/directives/social-share/social-share.html',
      controller: 'SocialShareController',
      controllerAs: '$ctrl',
      size: 'md',
      resolve: {
        job: () => (job),
      },
    });
  }

  payment(job, awfTime) {
    const time = awfTime && awfTime.created_at;
    this.$uibModal.open({
      templateUrl: 'app/directives/job-payment/job-payment.html',
      controller: 'JobPaymentController',
      controllerAs: 'JobPayment',
      size: 'lg',
      resolve: {
        job: () => (job),
        awfTime: () => time,
      },
    });
  }

  clickToCopy(job) {
    this.$uibModal.open({
      templateUrl: 'app/directives/click-tocopy/click-tocopy.html',
      controller: 'ClickToCopyController',
      controllerAs: 'ClickToCopy',
      size: 'lg',
      resolve: {
        job: () => (job),
      },
    });
  }
}

angular
  .module('uiGenApp')
  .service('JobModal', JobModalService);
