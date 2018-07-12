angular.module('uiGenApp')
  .directive('searchFocus', ($timeout) => ({
    restrict: 'A',
    scope: {
      ui: '=',
    },
    link: (scope, element) => {
      if (scope.ui) Object.assign(scope.ui, { setfocus: () => $timeout(() => element[0].focus()) });
    },
  }));

