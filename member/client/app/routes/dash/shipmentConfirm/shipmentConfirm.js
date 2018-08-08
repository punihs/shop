angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipmentConfirm', {
        url: '/shipmentConfirm',
        templateUrl: 'app/routes/dash/shipmentConfirm/shipmentConfirm.html',
        controller: 'shipmentConfirm',
        controllerAs: '$ctrl',
      });
  });
