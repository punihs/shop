angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('loyaltyPoints', {
        abstract: true,
        url: '/loyaltyPoints',
        template: '<div ui-view=""></div>',
      })
      .state('loyaltyPoints.rewards', {
        url: '/rewards?customer_id',
        templateUrl: 'app/routes/loyaltyPoints/loyaltyPoints/loyaltyPoints.html',
        controller: 'loyaltyPointsController',
        controllerAs: '$ctrl',
      });
  });
