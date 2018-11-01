angular.module('qui.core')
  .factory('moment', [
    '$window',
    function Jobs($window) {
      return $window.moment;
    },
  ]);
