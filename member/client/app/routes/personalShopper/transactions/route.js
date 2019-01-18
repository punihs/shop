
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('personalShopper.transaction', {
        abstract: true,
        url: '/transactions',
        template: '<div ui-view=""></div>',
      })
      .state('personalShopper.transaction.response', {
        url: '/response',
        templateUrl: 'app/routes/personalShopper/transactions/response/show.html',
        controller: 'PersonalShopperTransactionResponseController',
        controllerAs: '$ctrl',
      });
  });
