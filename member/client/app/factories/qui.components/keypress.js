angular.module('uiGenApp')
  .directive('emptyBackspace', ($parse) => ({
    link: (scope, element, attrs) => {
      element.on('keydown', (e) => {
        const currentValue = $parse(attrs.ngModel)(scope);
        if (currentValue === undefined || currentValue.length !== 0) return;
        if (e.which === 8) {
          scope.$apply(attrs.emptyBackspace);
        }
      });
    },
  }))
  .directive('enterToSpace', () => ({
    link: (scope, element) => {
      element.bind('keydown keypress', event => {
        if (event.which === 13) {
          event.preventDefault();
          const check = angular.element(event.target);
          check.trigger('click');
        }
      });
    },
  }))
  .directive('enterDirective', () => ({
    link: (scope, element, attrs) => {
      element.bind('keydown keypress', event => {
        if (event.which === 13) {
          scope.$apply(attrs.enterDirective);
          event.preventDefault();
        }
      });
    },
  }));
