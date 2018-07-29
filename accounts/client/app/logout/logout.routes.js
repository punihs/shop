/* @ngInject */
export default function routes($stateProvider) {
  $stateProvider
    .state('logout', {
      url: '/logout?continue',
      template: '<logout></logout>',
      data: { pageTitle: 'Logout in progress' },
    });
}
