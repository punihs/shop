angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /jobs/:jobId/orders/new
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('orders.new', {
        url: '/new',
        templateUrl: 'app/routes/dash/orders/new/new.html',
        controller: 'OrderNewController',
        controllerAs: '$ctrl',
      });
  });
