
angular.module('uiGenApp')
  .directive('directiveHeader', (Restangular, JobSuggest, UploadExcel, ListModal, $http) => {
    return {
      templateUrl: 'app/directives/directive-header/directive-header.html',
      scope: {
        viewdata: '=',
        app: '=',
        buttons: '=',
        page: '=',
        ui: '=',
      },
      restrict: 'EA',
      link: (scope, element, attrs) => {
        scope.ListModal = ListModal;

      },
    };
  });
