
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('customer.orders', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('customer.orders.index', {
        url: '?bucket&sid&uid&type',
        templateUrl: 'app/routes/customers/orders/index/index.html',
        controller: 'CustomerOrdersIndexController',
        controllerAs: '$ctrl',
        resolve: {
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      });
  });
