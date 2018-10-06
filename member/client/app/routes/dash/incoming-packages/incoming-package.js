angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('incoming-packages', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('incoming-packages.new', {
        url: '/new',
        templateUrl: 'app/routes/dash/incoming-packages/new/new.html',
        controller: 'PackageNewController',
        controllerAs: '$ctrl',
      });
  });
