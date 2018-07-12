
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'app/routes/dashboard/dashboard.html',
        controller: 'DashboardController',
        controllerAs: '$ctrl',
      });
  });
