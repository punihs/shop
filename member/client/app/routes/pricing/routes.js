
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('pricing', {
        abstract: true,
        url: '/pricing',
        template: '<div ui-view=""></div>',
      })
      .state('pricing.index', {
        url: '',
        templateUrl: 'app/routes/pricing/partners/index.html',
        controller: 'PricingIndexController',
        controllerAs: '$ctrl',
      });
  });
