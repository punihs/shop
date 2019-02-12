
angular.module('uiGenApp')
  .config($stateProvider => {
    $stateProvider
      .state('feeds', {
        abstract: true,
        url: '/feeds',
        template: '<div ui-view></div>',
      })
      .state('feeds.index', {
        url: '?bucket',
        templateUrl: 'app/routes/feeds/index/index.html',
        controller: 'FeedIndexController',
        controllerAs: '$ctrl',
      });
  });
