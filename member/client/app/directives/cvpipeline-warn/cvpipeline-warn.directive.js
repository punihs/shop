angular
  .module('uiGenApp')
  .directive('cvpipelineWarn', () => {
    return {
      templateUrl: 'app/directives/cvpipeline-warn/cvpipeline-warn.html',
      restrict: 'E',
      scope: {
        data: '=?',
      },
    };
  });

