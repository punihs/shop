angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /jobs/:jobId/orders/new
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('orders.list', {
        url: '?status&sid&uid',
        templateUrl: 'app/routes/orders/list/list.html',
        controller: 'OrdersListController',
        controllerAs: '$ctrl',
      })
      .state('orders.new', {
        url: '/new',
        templateUrl: 'app/routes/orders/new/new.html',
        controller: 'OrderNewController',
        controllerAs: '$ctrl',
      })
      .state('order', {
        abstract: true,
        url: '/orders/:id',
        template: '<div ui-view></div>',
      })
      .state('order.show', {
        url: '',
        templateUrl: 'app/routes/orders/show/show.html',
        controller: 'OrderShowController',
        controllerAs: '$ctrl',
        resolve: {
          currentOrder: ($http, $stateParams) => $http
            .get(`/orders/${$stateParams.id}`)
            .then(({ data: order }) => order),
        },
      })

      .state('order.edit', {
        url: '/edit',
        templateUrl: 'app/routes/orders/new/new.html',
        controller: 'OrderNewController',
        controllerAs: '$ctrl',
        resolve: {
          currentOrder: ($http, $stateParams) => $http
            .get(`/orders/${$stateParams.id}`)
            .then(({ data: order }) => order),
        },
      });
  });
