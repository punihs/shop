
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('notifications', {
        url: '/notifications',
        controller: 'NotificationsController',
        controllerAs: '$ctrl',
        templateUrl: 'app/routes/notifications/notifications.html',
      });
  });
