angular.module('uiGenApp')
  .directive('searchFocus', ($timeout) => ({
    restrict: 'A',
    scope: {
      ui: '=',
    },
    link: (scope, element, attrs) => {
      if (scope.ui) scope.ui.setfocus = () => $timeout(() => element[0].focus());
    },
  }));

