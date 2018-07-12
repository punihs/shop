

angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('access', {
        abstract: true,
        template: '<div ui-view class="fade-in-right-big smooth"></div>',
      })
      .state('access.oauth', {
        url: '/access/oauth',
        templateUrl: 'app/routes/access/oauth/oauth.html',
        controller: 'oAuthCtrl',
        controllerAs: 'oAuth',
      })
      .state('access.404', {
        templateUrl: 'app/routes/access/404/404.html',
      });
  });
