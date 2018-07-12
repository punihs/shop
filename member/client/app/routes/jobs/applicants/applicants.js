angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /jobs/:jobId/applicants/new
      .state('job.applicants', {
        abstract: true,
        url: '/applicants',
        template: '<div ui-view></div>',
      })
      .state('job.applicants.list', {
        url: '?status&sid&uid',
        templateUrl: 'app/routes/jobs/applicants/list/list.html',
        controller: 'JobsApplicantsListController',
        controllerAs: '$ctrl',
        resolve: {
          prescreen: ($http) => $http.get('/users/prescreen')
          .then(({ data: { prescreen } }) => prescreen),
          currentJob: (QResolve, $stateParams) => QResolve.currentJob($stateParams.jobId),
        },
      })
      .state('job.applicants.new', {
        url: '/new',
        templateUrl: 'app/routes/jobs/applicants/new/new.html',
        controller: 'ApplicantNewController',
        controllerAs: '$ctrl',
        resolve: {
          tatdisable: ($q, $state, $location, AllocationDisable) => AllocationDisable
            .check()
            .then(disabled => {
              if (!disabled) return false;
              AllocationDisable
                .open()
                .catch(() => $state.current.name || $state
                  .go('job.applicants.list', { jobId: $location.path().split('/')[2] }));
              return $q.reject(true);
            }),
          prescreen: ($http) => $http
            .get('/users/prescreen')
            .then(({ data: { prescreen } }) => prescreen),
          currentJob: ($http, $stateParams, JobSuggest) => $http
            .get(`/jobs/${$stateParams.jobId}`, { params: { auto: JobSuggest.enabled } })
            .then(({ data }) => {
              const status = data.job_status;
              if (status === 'Closed' || status === 'Hold') {
                alert(`This position is ${status} You cannot upload CV(s) to this position`);
              }
              return data;
            })
            .catch(() => alert('Job Not Found')),
        },
      })
      .state('job.applicant', {
        abstract: true,
        url: '/applicants/:applicantId',
        template: '<div ui-view></div>',
      })
      .state('job.applicant.edit', {
        url: '/edit',
        templateUrl: 'app/routes/jobs/applicants/edit/edit.html',
        controller: 'JobApplicantEditController',
        controllerAs: 'JobApplicantEdit',
        resolve: {
          currentJob: (QResolve, $stateParams) => QResolve.currentJob($stateParams.jobId),
          currentApplicantToEdit: (QResolve, $stateParams) =>
            QResolve.currentApplicantToEdit($stateParams.jobId, $stateParams.applicantId),
        },
      });
  });
