angular.module('uiGenApp')
  .directive('scrollToBottom', [
    '$timeout',
    function scrollToBottom($timeout) {
      return {
        scope: {
          scrollToBottom: '=',
        },
        link: function link(scope, element) {
          scope.$watchCollection('scrollToBottom', (newValue) => {
            if (newValue) {
              $timeout(() => Object
                .assign(element[0], { scrollTop: element[0].scrollHeight }), 0);
            }
          });
        },
      };
    },
  ]);
