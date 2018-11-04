
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipRequest.transaction', {
        abstract: true,
        url: '/transactions/:id',
        template: '<div ui-view=""></div>',
      })
      .state('shipRequest.transaction.response', {
        url: '/response?status&message&amount',
        templateUrl: 'app/routes/shipRequests/transactions/response/response.html',
        controller: 'ShipRequestTransactionResponseController',
        controllerAs: '$ctrl',
      });
  });
