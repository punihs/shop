angular.module('qui.components')
  .directive('scrollToBottom', [
    '$timeout',
    function scrollToBottom($timeout) {
      return {
        scope: {
          scrollToBottom: '=',
        },
        link: function link(scope, element) {
          scope.$watchCollection('scrollToBottom', function updateScroll(newValue) {
            if (newValue) {
              $timeout(function scroll() {
                element[0].scrollTop = element[0].scrollHeight;
              }, 0);
            }
          });
        },
      };
    },
  ]);
