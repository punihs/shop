angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('report', {
        abstract: true,
        url: '/reports',
        controller: 'ReportOverviewController',
        controllerAs: '$ctrl',
        templateUrl: 'app/routes/report/report.html',
      })
      .state('report.overview', {
        url: '',
        templateUrl: 'app/routes/report/report-overview/report-overview.html',
      })
      .state('report.list', {
        url: 'list?id',
        controller: 'ReportListController',
        controllerAs: '$ctrl',
        templateUrl: 'app/routes/report/report-list/report-list.html',
      });
  });
