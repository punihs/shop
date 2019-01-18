
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('personalShopper', {
        abstract: true,
        url: '/personalShopper',
        template: '<div ui-view=""></div>',
      })
      .state('personalShopper.workFlow', {
        url: '/workFlow',
        templateUrl: 'app/routes/personalShopper/workFlow/workFlow.html',
        controller: 'WorkFlowController',
        controllerAs: '$ctrl',
      })
      .state('personalShopper.create', {
        url: '/create',
        templateUrl: 'app/routes/personalShopper/create/create.html',
        controller: 'CreateController',
        controllerAs: '$ctrl',
      })
      .state('personalShopper.index', {
        url: '/index',
        templateUrl: 'app/routes/personalShopper/index/index.html',
        controller: 'IndexController',
        controllerAs: '$ctrl',
      })
      .state('personalShopper.show', {
        url: '/show/:id',
        templateUrl: 'app/routes/personalShopper/show/show.html',
        controller: 'ShowController',
        controllerAs: '$ctrl',
      })
      .state('personalShopper.balance', {
        url: '/balance',
        templateUrl: 'app/routes/personalShopper/balance/balance.html',
        controller: 'BalanceController',
        controllerAs: '$ctrl',
      });
  });
