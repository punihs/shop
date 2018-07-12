angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      //  All Job - Routes
      .state('jobs', {
        abstract: true,
        url: '/jobs',
        template: '<div ui-view></div>',
      })
      .state('jobs.list', {
        url: '?status&uid&cid&js&pid&r&min&max',
        templateUrl: 'app/routes/jobs/list/list.html',
        controller: 'JobsListController',
        controllerAs: '$ctrl',
      })
      .state('jobs.manage-list', {
        url: '/manage-list?status',
        templateUrl: 'app/routes/jobs/manage-list/manage-list.html',
        controller: 'JobsManageListController',
        controllerAs: '$ctrl',
      })
      .state('jobs.my-client', {
        url: '/my-clients',
        templateUrl: 'app/routes/jobs/my-client/my-client.html',
        controller: 'MyClientController',
        controllerAs: '$ctrl',
      })
      .state('jobs.forceAllocation', {
        url: '/force-allocation',
        templateUrl: 'app/routes/jobs/force-allocation/force-allocation.html',
        controller: 'ForceAllocationController',
        controllerAs: '$ctrl',
      })
      .state('jobs.qlist', {
        url: '/qlist',
        template: '<jobs-qlist settings="App.app.settings"></jobs-qlist>',
      })
      .state('jobs.suggestions', {
        url: '/suggestions',
        template: '<jobs-suggestion settings="App.app.settings"></jobs-suggestion>',
      })
      // One Job Routes
      .state('job', {
        abstract: true,
        url: '/jobs/:jobId',
        template: '<div ui-view></div>',
        controller: 'JobsCtrl',
        controllerAs: 'Jobs',
        resolve: {
          currentJob: (QResolve, $stateParams) => QResolve
            .currentJob($stateParams.jobId, { fl: 'id' }),
        },
      })
      .state('job.view', {
        url: '?key',
        templateUrl: 'app/routes/jobs/view/view.html',
        controller: 'JobViewController',
        controllerAs: 'JobView',
        resolve: {
          currentJob: ($http, $state, $stateParams, JobSuggest) => $http
              .get(`/jobs/${$stateParams.jobId}`, { params: {
                key: $stateParams.key,
                auto: JobSuggest.enabled,
                qrp: true,
                share: true,
                soundPath: true,
                videoPath: true,
              } })
              .then(({ data }) => data)
              .catch(() => $state.go('access.404')),

          sampleCvs: ($http, $stateParams) => $http
            .get(`/jobs/${$stateParams.jobId}/sampleCvs`)
            .then(({ data }) => data),
        },
      })
    .state('job.sample-cv', {
      url: '/sample-cv/:sampleCvId',
      templateUrl: 'app/routes/jobs/sample-cv/sample-cv.html',
      controller: 'JobViewController',
      controllerAs: 'JobView',
      resolve: {
        currentJob: ($http, $stateParams) => $http
          .get(`/jobs/${$stateParams.jobId}`, { params: {
            soundPath: true, metrics: true, auto: true,
          } })
          .then(({ data }) => data)
          .catch(() => alert('Job Not found')),

        sampleCvs: ($http, $stateParams) => $http
            .get(`/jobs/${$stateParams.jobId}/sampleCvs`)
            .then(({ data }) => data)
            .catch(() => alert('Job Not found')),
      },
    });
  });
