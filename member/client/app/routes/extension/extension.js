angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('extension', {
        url: '/extension/chrome/applicants/new?{jobId:int}&{id:int}',
        templateUrl: 'app/routes/extension/extension.html',
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
          currentJob: ($http, $stateParams, $q, JobSuggest) => {
            if (!$stateParams.jobId) return $q.resolve({});
            return $http
            .get(`/jobs/${$stateParams.jobId}`, {
              params: {
                fl: 'id,role,client_name,job_location,min_sal,max_sal,min_exp,max_exp,vacancy,' +
                'is_drive',
                auto: JobSuggest.enabled,
              },
              skipAdminView: true,
            })
            .then(res => res.data['0']);
          },
        },
      });
  });
