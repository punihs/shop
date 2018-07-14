angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipments', {
        abstract: true,
        url: '/shipments',
        template: '<div ui-view></div>',
      })
      .state('shipments.index', {
        url: '?status&sid&uid',
        templateUrl: 'app/routes/shipments/index/index.html',
        controller: 'ShipmentsIndexController',
        controllerAs: '$ctrl',
      })
      .state('shipment', {
        abstract: true,
        url: '/shipments/:id',
        template: '<div ui-view></div>',
      })
      .state('shipment.show', {
        url: '',
        templateUrl: 'app/routes/shipments/show/show.html',
        controller: 'shipmentsShowController',
        controllerAs: '$ctrl',
        resolve: {
          pkg($http, $stateParams, $state) {
            const fl = [
              'id', 'customer_id', 'created_at', 'weight', 'final_amount', 'packages_count',
            ];
            const params = {
              fl: fl.join(','),
            };

            return $http
              .get(`/shipments/${$stateParams.id}`, { params })
              .then(({ data: pkg }) => pkg)
              .catch(() => $state.go('access.404'));
          },
        },
      });
  });
