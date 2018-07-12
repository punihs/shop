'use strict';

angular.module('uiGenApp')
  .directive('fullScreenContent', function ($window, $document) {
    return {
      templateUrl: 'app/directives/full-screen-content/full-screen-content.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        function resize() {
          // change height of chat box views
          let error_height = 0;
          let nav_header_height = angular.element(`div.app-header.navbar`).height();
          let contentHeight = $document[0].body.clientHeight - nav_header_height - error_height;
          angular.element(`#fullscreen-content`).css(`height`, `${contentHeight}px`);
          angular.element(`.app-content-body`).css(`padding-bottom`, '0');
        }
        $(window).on(`resize`, resize);
        resize();
      }
    };
  });
