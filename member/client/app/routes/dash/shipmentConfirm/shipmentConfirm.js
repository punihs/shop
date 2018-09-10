angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipmentConfirm', {
        url: '/shipmentConfirm?order_code',
        templateUrl: 'app/routes/dash/shipmentConfirm/shipmentConfirm.html',
        controller: 'ShipmentConfirmController',
        controllerAs: '$ctrl',
      });
  });
