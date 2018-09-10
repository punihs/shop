angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      //  All Customer - Routes
      .state('customers', {
        abstract: true,
        url: '/customers',
        template: '<div ui-view></div>',
      })
      .state('customers.list', {
        url: '?groupId',
        templateUrl: 'app/routes/customers/list/list.html',
        controller: 'CustomersListController',
        controllerAs: '$ctrl',
      })
      .state('customer', {
        abstract: true,
        url: '/customers/:id',
        template: '<div ui-view></div>',
      })
      .state('customer.view', {
        url: '',
        templateUrl: 'app/routes/customers/view/view.html',
        controller: 'CustomerViewController',
        controllerAs: '$ctrl',
        resolve: {
          currentCustomer: ($http, $state, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data)
            .catch(() => $state.go('access.404')),
        },
      });
  });
