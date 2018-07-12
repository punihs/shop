angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /jobs/:jobId/orders/new
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('orders.list', {
        url: '?status&sid&uid',
        templateUrl: 'app/routes/orders/list/list.html',
        controller: 'OrdersListController',
        controllerAs: '$ctrl',
      })
      .state('orders.new', {
        url: '/new',
        templateUrl: 'app/routes/orders/new/new.html',
        controller: 'OrderNewController',
        controllerAs: '$ctrl',
        resolve: {
          tatdisable: ($q, $state, $location, AllocationDisable) => AllocationDisable
            .check()
            .then(disabled => {
              if (!disabled) return false;
              AllocationDisable
                .open()
                .catch(() => $state.current.name || $state
                  .go('orders.list', { jobId: $location.path().split('/')[2] }));
              return $q.reject(true);
            }),
          prescreen: ($http) => $http
            .get('/users/prescreen')
            .then(({ data: { prescreen } }) => prescreen),
          currentJob: ($http, $stateParams, JobSuggest) => $http
            .get(`/jobs/${$stateParams.jobId}`, { params: { auto: JobSuggest.enabled } })
            .then(({ data }) => {
              const status = data.job_status;
              if (status === 'Closed' || status === 'Hold') {
                alert(`This position is ${status} You cannot upload CV(s) to this position`);
              }
              return data;
            })
            .catch(() => alert('Job Not Found')),
        },
      })
      .state('order', {
        abstract: true,
        url: '/orders/:orderId',
        template: '<div ui-view></div>',
      })
      .state('order.edit', {
        url: '/edit',
        templateUrl: 'app/routes/jobs/orders/edit/edit.html',
        controller: 'JobOrderEditController',
        controllerAs: 'JobOrderEdit',
        resolve: {
          currentJob: (QResolve, $stateParams) => QResolve.currentJob($stateParams.jobId),
          currentOrderToEdit: (QResolve, $stateParams) =>
            QResolve.currentOrderToEdit($stateParams.jobId, $stateParams.orderId),
        },
      });
  });
