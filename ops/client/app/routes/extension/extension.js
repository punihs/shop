angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('extension', {
        url: '/extension/chrome/applicants/new?{jobId:int}&{id:int}',
        templateUrl: 'app/routes/extension/extension.html',
        controller: 'ApplicantNewController',
        controllerAs: '$ctrl',
        resolve: {
          currentJob: ($http, $stateParams, $q) => {
            if (!$stateParams.jobId) return $q.resolve({});
            return $http
              .get(`/jobs/${$stateParams.jobId}`, {
                params: {
                  fl: 'id,role,client_name,job_location,min_sal,max_sal,min_exp,max_exp,vacancy,' +
                'is_drive',
                },
                skipAdminView: true,
              })
              .then(res => res.data['0']);
          },
        },
      });
  });
