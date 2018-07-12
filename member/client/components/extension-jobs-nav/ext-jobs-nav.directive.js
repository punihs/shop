angular.module('uiGenApp')
  .directive('extJobsNav', () =>
    ({
      templateUrl: 'components/extension-jobs-nav/ext-jobs-nav.html',
      restrict: 'E',
      controller: 'ExtJobsNavController',
      controllerAs: '$ctrl',
    }));
