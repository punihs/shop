
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('packages', {
        abstract: true,
        url: '/packages',
        template: '<div ui-view=""></div>',
      })
      .state('packages.index', {
        url: '?bucket&packageIds',
        templateUrl: 'app/routes/packages/index/index.html',
        controller: 'PackagesIndexController',
        controllerAs: '$ctrl',
      })
      .state('packages.create', {
        url: '/create',
        templateUrl: 'app/routes/packages/create/create.html',
        controller: 'PackagesCreateController',
        controllerAs: '$ctrl',
      });
  });
