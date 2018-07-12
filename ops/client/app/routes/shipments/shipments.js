angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipments-list', {
        url: '/shipments',
        templateUrl: 'app/routes/shipments/shipments-list.html',
        controller: 'shipmentsListController',
        controllerAs: '$ctrl',

      });
  });
