
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('dash', {
        abstract: true,
        url: '/locker',
        template: '<div ui-view=""></div>',
      })
      .state('dash.packages', {
        url: '?bucket',
        templateUrl: 'app/routes/dash/packages/packages.html',
        controller: 'PackageLockerController',
        controllerAs: '$ctrl',
      })
      .state('dash.createShipmentRequest', {
        url: '/create?packageIds',
        templateUrl: 'app/routes/dash/createShipmentRequest/shipment-request.html',
        controller: 'shipmentRequestController',
        controllerAs: '$ctrl',
      })
      .state('dash.schedulePickup', {
        url: '/create',
        templateUrl: 'app/routes/dash/schedulePickup/schedule-pickup.html',
        controller: 'schedulePickupController',
      })
      .state('dash.shipmentConfirm', {
        url: '/request/confirm?order_code',
        templateUrl: 'app/routes/dash/shipmentConfirm/shipmentConfirm.html',
        controller: 'shipmentConfirm',
        controllerAs: '$ctrl',
      })
      .state('dash.response', {
        url: '/request/reponse',
        templateUrl: 'app/routes/dash/response/response.html',
        controller: 'PaymentResponse',
        controllerAs: '$ctrl',
      })
      .state('dash.shipRequestResponse', {
        url: '/115/request/shipRequestResponse',
        templateUrl: 'app/routes/dash/response/shipRequestResponse.html',
        controller: 'ShipRequestResponse',
        controllerAs: '$ctrl',
      })
      .state('dash.retryPayment', {
        url: '/request/payment/retryPayment',
        templateUrl: 'app/routes/dash/retryPayment/retryPayment.html',
        controller: 'RetryPayment',
        controllerAs: '$ctrl',
      })
      .state('dash.axis', {
        url: '/request/payment/axis?encrypted&vpcMerchantId',
        templateUrl: 'app/routes/dash/axis/axis.html',
        controller: 'PaymentAxis',
        controllerAs: '$ctrl',
      })
      .state('dash.paytm', {
        url: '/request/payment/paytm?encryptedData',
        templateUrl: 'app/routes/dash/paytm/paytm.html',
        controller: 'PaymentPaytm',
        controllerAs: '$ctrl',
      })
      .state('dash.paypal', {
        url: '/request/payment/paypal?encryptedData',
        templateUrl: 'app/routes/dash/paypal/paypal.html',
        controller: 'PaymentPaytm',
        controllerAs: '$ctrl',
      })
    ;
  });
