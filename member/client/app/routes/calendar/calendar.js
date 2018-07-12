'use strict';

angular.module('uiGenApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('calendar', {
        url: '/calendar',
        templateUrl: 'app/routes/calendar/calendar.html',
        controller: 'CalendarCtrl',
        controllerAs: 'Calendar',
      });
  });
