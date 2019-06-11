angular.module('uiGenApp')
  .factory('moment', [
    '$window',
    function Jobs($window) {
      return $window.moment;
    },
  ]);
