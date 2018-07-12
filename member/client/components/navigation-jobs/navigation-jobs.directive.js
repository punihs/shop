angular.module('uiGenApp')
  .directive('navigationJobs', () => ({
    templateUrl: 'components/navigation-jobs/navigation-jobs.html',
    restrict: 'EA',
    controller: 'NavigationJobsController',
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {},
  }));
