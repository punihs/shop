
angular.module('uiGenApp')
  .directive('fullScreenContent', ($window, $document) => ({
    templateUrl: 'app/directives/full-screen-content/full-screen-content.html',
    restrict: 'EA',
    link() {
      function resize() {
        // change height of chat box views
        const errorHeight = 0;
        const navHeaderHeight = angular.element('div.app-header.navbar').height();
        const contentHeight = $document[0].body.clientHeight - navHeaderHeight - errorHeight;
        angular.element('#fullscreen-content').css('height', `${contentHeight}px`);
        angular.element('.app-content-body').css('padding-bottom', '0');
      }
      $(window).on('resize', resize);
      resize();
    },
  }));
