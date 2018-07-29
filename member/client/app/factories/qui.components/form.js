angular.module('qui.components')
  .directive('onlyDigits', () => ({
    require: 'ngModel',
    restrict: 'A',
    link(scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          const digits = val.replace(/[^0-9]/g, '');
          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseInt(digits, 10);
        }
        return undefined;
      }
      ctrl.$parsers.push(inputValue);
    },
  }))
  .directive('decimalDigits', () => ({
    require: 'ngModel',
    restrict: 'A',
    link(scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          const digits = val.replace(/[^0-9.]/g, '');
          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseFloat(digits);
        }
        return undefined;
      }
      ctrl.$parsers.push(inputValue);
    },
  }));
