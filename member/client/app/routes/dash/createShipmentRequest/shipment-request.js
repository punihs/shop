angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipments-create', {
        url: '/shipmentRequest',
        templateUrl: 'app/routes/dash/createShipRequest/createShip-request.html',
        controller: 'shipmentsListController',
        controllerAs: '$ctrl',
      });
  });
