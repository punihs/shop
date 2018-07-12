angular.module('uiGenApp')
  .directive('jobQna', () => {
    return {
      templateUrl: 'app/directives/job-qna/job-qna.html',
      restrict: 'EA',
      controller: 'JobQnaController',
      controllerAs: '$ctrl',
      replace: true,
    };
  });
