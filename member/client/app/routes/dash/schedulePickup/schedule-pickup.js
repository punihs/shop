angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('schedulePickup', {
        url: '/schedulePickup',
        templateUrl: 'app/routes/dash/schedulePickup/schedule-pickup.html',
        controller: 'schedulePickupController',
        controllerAs: '$ctrl',
      });
  });
