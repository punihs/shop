
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('dash', {
        abstract: true,
        url: '/locker',
        template: '<div ui-view=""></div>',
      })
      .state('dash.packages', {
        url: '?status',
        templateUrl: 'app/routes/dash/packages/packages.html',
        controller: 'PackageLockerController',
        controllerAs: '$ctrl',
      })
      .state('dash.createShipmentRequest', {
        url: '/create',
        templateUrl: 'app/routes/dash/createShipmentRequest/shipment-request.html',
        controller: 'shipmentRequestController',
        controllerAs: '$ctrl',
      })
    ;
  });
