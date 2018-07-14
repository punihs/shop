/* @ngInject */
export function routeConfig($urlRouterProvider, $locationProvider) {
  $urlRouterProvider.when('/', '/sign-in');
  $urlRouterProvider.otherwise($injector => $injector.get('$state').go('four-o-four'));

  $locationProvider.html5Mode(true);
}
