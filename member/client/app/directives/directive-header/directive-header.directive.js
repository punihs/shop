
angular.module('uiGenApp')
  .directive('directiveHeader', (ListModal) => ({
    templateUrl: 'app/directives/directive-header/directive-header.html',
    scope: {
      options: '=',
      app: '=',
      buttons: '=',
      page: '=',
      ui: '=',
    },
    restrict: 'EA',
    link: (scope) => Object.assign(scope, { ListModal }),
  }));
