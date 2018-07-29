angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('membership-plan', {
        url: '/memberships',
        templateUrl: 'app/routes/membership/member-plan.html',
        controller: 'membershipController',
        controllerAs: '$ctrl',

      });
  });
