angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipments', {
        abstract: true,
        url: '/shipments',
        template: '<div ui-view></div>',
      })
      .state('shipments.index', {
        url: '?status',
        templateUrl: 'app/routes/shipments/shipments-list.html',
        controller: 'ShipmentsIndexController',
        controllerAs: '$ctrl',
      })
      .state('shipment', {
        abstract: true,
        url: '/shipments/:id',
        template: '<div ui-view></div>',
      });
  });
