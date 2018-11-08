
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('transaction', {
        abstract: true,
        url: '/transactions/:id',
        template: '<div ui-view=""></div>',
      })
      .state('transaction.response', {
        url: '/response?status&message&amount&customer_id&object_id',
        templateUrl: 'app/routes/transactions/response/response.html',
        controller: 'TransactionResponseController',
        controllerAs: '$ctrl',
      })
      .state('transaction.create', {
        url: '/create?amount&object_id&customer_id&axis_banned',
        templateUrl: 'app/routes/transactions/create/create.html',
        controller: 'TransactionCreateController',
        controllerAs: '$ctrl',
      });
  });
