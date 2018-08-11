
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
      .state('dash.schedulePickup', {
        url: '/create',
        templateUrl: 'app/routes/dash/schedulePickup/schedule-pickup.html',
        controller: 'schedulePickupController',

      .state('dash.shipmentConfirm', {
        url: '/request/confirm?order_code=1000',
        templateUrl: 'app/routes/dash/shipmentConfirm/shipmentConfirm.html',
        controller: 'shipmentConfirm',
        controllerAs: '$ctrl',
      })
      .state('dash.response', {
        url: '/115/request/reponse',
        templateUrl: 'app/routes/dash/response/response.html',
        controller: 'PaymentResponse',
        controllerAs: '$ctrl',
      })
      .state('dash.retryPayment', {
        url: '/115/request/payment/retryPayment',
        templateUrl: 'app/routes/dash/retryPayment/retryPayment.html',
        controller: 'RetryPayment',
        controllerAs: '$ctrl',
      })
    ;
  });
