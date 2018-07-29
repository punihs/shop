
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('career', {
        url: '/career',
        templateUrl: 'app/routes/career/career.html',
        controller: 'CareerController',
        controllerAs: '$ctrl',
      });
  });
