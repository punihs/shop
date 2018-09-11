angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('signUp', {
        url: '/signUp',
        templateUrl: 'app/routes/dash/signUp/signUp.html',
        controller: 'signUp',
        controllerAs: '$ctrl',
      });
  });
