
angular.module('uiGenApp')
  .directive('reauth', () => {
    return {
      templateUrl: 'app/directives/reauth/reauth.html',
      restrict: 'EA',
      link: (scope, element, attrs) => {
      },
    };
  });
