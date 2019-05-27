
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('shipRequests', {
        abstract: true,
        url: '/shipRequests',
        template: '<div ui-view=""></div>',
      })
      .state('shipRequests.index', {
        url: '',
        templateUrl: 'app/routes/shipRequests/index/index.html',
        controller: 'ShipRequestsIndexController',
        controllerAs: '$ctrl',
        resolve: {
          shipments($http, $stateParams, $state) {
            return $http
              .get('/shipments/queue')
              .then(({ data: { shipments } }) => shipments)
              .catch(() => $state.go('access.404'));
          },
        },
      })
      .state('shipRequests.create', {
        url: '/create?packageIds',
        templateUrl: 'app/routes/shipRequests/create/create.html',
        controller: 'ShipRequestsCreateController',
        controllerAs: '$ctrl',
      })
      .state('shipRequests.history', {
        url: '/history',
        templateUrl: 'app/routes/shipRequests/history/history.html',
        controller: 'ShipRequestHistoryController',
        controllerAs: '$ctrl',
      })

      .state('shipRequest', {
        abstract: true,
        url: '/shipRequests/:orderCode',
        template: '<div ui-view=""></div>',
      })
      .state('shipRequest.show', {
        url: '',
        templateUrl: 'app/routes/shipRequests/transactions/response/show.html',
        controller: 'ShipRequestTransactionResponseController',
        controllerAs: '$ctrl',
      })
      .state('shipRequest.confirm', {
        url: '/confirm',
        templateUrl: 'app/routes/shipRequests/confirm/confirm.html',
        controller: 'ShipRequestConfirmController',
        controllerAs: '$ctrl',
      })
      .state('shipRequest.response', {
        url: '/response?status',
        templateUrl: 'app/routes/shipRequests/response/response.html',
        controller: 'ShipRequestResponse',
        controllerAs: '$ctrl',
      })
      .state('shipRequest.invoice', {
        url: '/invoice',
        templateUrl: 'app/routes/shipRequests/invoice/invoice.html',
        controller: 'ShipRequestInvoiceController',
        controllerAs: '$ctrl',
      })
      .state('shipRequest.cancel', {
        url: '/cancel',
        templateUrl: 'app/routes/shipRequests/cancel/cancel.html',
        controller: 'ShipRequestCancelController',
        controllerAs: '$ctrl',
      });
  });
