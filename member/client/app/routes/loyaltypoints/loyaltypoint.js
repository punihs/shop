
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('loyaltypoints', {
        abstract: true,
        url: '/loyaltypoints',
        templateUrl: 'app/routes/loyaltypoints/loyalty-points.html',
      })
      .state('loyaltypoints.rewards', {
        url: '/rewards',
        templateUrl: 'app/routes/loyaltypoints/rewards/rewards.html',
        //controller: 'ProfileController',
        //controllerAs: '$ctrl',
      })
      .state('loyaltypoints.history', {
        url: '/history',
        templateUrl: 'app/routes/loyaltypoints/history/history.html',
        //controller: 'ProfileController',
        //controllerAs: '$ctrl',
      })
      .state('loyaltypoints.redeem', {
        url: '/redeem',
        templateUrl: 'app/routes/loyaltypoints/redeem/redeem.html',
        //controller: 'ProfileController',
        //controllerAs: '$ctrl',
      });
  });

