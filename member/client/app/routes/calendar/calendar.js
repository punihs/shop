
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('calendar', {
        url: '/calendar',
        templateUrl: 'app/routes/calendar/calendar.html',
        controller: 'CalendarCtrl',
        controllerAs: 'Calendar',
      });
  });
