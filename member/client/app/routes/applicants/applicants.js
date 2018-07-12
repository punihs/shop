/**
 * LIST    /applicants             ->  ApplicantsCtrl
 * NEW     /applicants/new         ->  ApplicantNewController
 * VIEW    /applicants/:id         ->  ApplicantViewController
 */

angular.module('uiGenApp')
  .config($stateProvider => {
    $stateProvider
      .state('applicants', {
        abstract: true,
        url: '/applicants',
        template: '<div ui-view></div>',
      })
      .state('applicants.list', {
        url: '?status&sid&uid&notice_period&ctc_range',
        templateUrl: 'app/routes/applicants/list/list.html',
        controller: 'ApplicantsListController',
        controllerAs: '$ctrl',
        resolve: {
          prescreen($http) {
            return $http.get('/users/prescreen')
            .then(({ data: { prescreen } }) => prescreen);
          },
        },
      })
      .state('applicant', {
        abstract: true,
        url: '/applicants/:applicantId',
        template: '<div ui-view></div>',
      })
      .state('applicant.view', {
        url: '',
        templateUrl: 'app/routes/applicants/view/view.html',
        controller: 'ApplicantViewController',
        controllerAs: '$ctrl',
        resolve: {
          prescreen($http) {
            return $http.get('/users/prescreen')
            .then(({ data: { prescreen } }) => prescreen);
          },
          applicant($http, $stateParams, $state, Session) {
            const fl = [
              '_root_', 'name', 'id', 'applicant_score', 'state_name', 'state_id', 'applicant_confirmed',
              'email', 'total_exp', 'skills', 'edu_degree', 'exp_salary', 'exp_designation', 'exp_employer',
              'email', 'notice_period', 'mobile', 'exp_location', 'expected_ctc', 'summary',
              'interview_time', 'assessment_score', 'assessment_id',
            ];
            const access = location.href.replace('partner.quezx', 'access.quezx');
            const user = Session.read('userinfo');
            const params = {
              fl: fl.join(','),
            };

            return $http
            .get(`/applicants/${$stateParams.applicantId}`, { params })
            .then(({ data: applicant }) => applicant)
            .catch((err) => {
              if (err.status === 404 && user.access) {
                return (location.href = access);
              }
              return $state.go('access.404');
            });
          },
        },
      });
  });
