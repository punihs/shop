'use strict';

angular.module('uiGenApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('notifications', {
        url: '/notifications',
        controller: 'NotificationsController',
        controllerAs: '$ctrl',
        templateUrl: 'app/routes/notifications/notifications.html',
      });
  });
