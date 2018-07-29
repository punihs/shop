angular.module('uiGenApp')
  .directive('lightBox', ['$document', '$window', ($document, $window) => ({
    templateUrl: 'components/light-box/light-box.html',
    restrict: 'EA',
    scope: {
      data: '=',
    },
    link: $scope => {
      const scope = $scope;
      const documents = $document[0];
      const lightBoxVideo = documents.getElementById('lightBoxVideo');
      const lightBoxFade = documents.getElementById('light-box-fade');

      scope.lightboxOpen = () => {
        $window.scrollTo(0, 0);
        lightBoxFade.style.display = 'block';
        lightBoxVideo.play();
      };

      scope.lightboxClose = () => {
        lightBoxFade.style.display = 'none';
        lightBoxVideo.pause();
      };
    },
  })]);
