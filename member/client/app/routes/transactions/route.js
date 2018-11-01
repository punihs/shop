
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('transaction', {
        abstract: true,
        url: '/transactions/:id',
        template: '<div ui-view=""></div>',
      })
      .state('transaction.response', {
        url: '/response?error&message&amount',
        templateUrl: 'app/routes/transactions/response/response.html',
        controller: 'TransactionResponseController',
        controllerAs: '$ctrl',
      });
  });
