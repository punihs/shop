angular.module('uiGenApp')
  .directive('contenteditable', () =>
    ({
      require: 'ngModel',
      restrict: 'A',
      link: (scope, elm, attr, ngModel) => {
        const model = ngModel;
        function updateViewValue() {
          ngModel.$setViewValue(this.innerHTML);
        }
        elm.on('keyup', updateViewValue);

        scope.$on('$destroy', () => elm.off('keyup', updateViewValue));

        model.$render = () => elm.html(ngModel.$viewValue);
      },
    }));
