
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('dashboard', {
        abstract: true,
        url: '/dashboard',
        template: '<div ui-view=""></div>',
      })
      .state('dashboard.index', {
        url: '',
        templateUrl: 'app/routes/dashboard/index/index.html',
        controller: 'DashboardIndexController',
        controllerAs: '$ctrl',
      });
  });
